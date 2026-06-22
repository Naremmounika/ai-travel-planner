const Trip = require("../models/Trip");

// ===============================
// Helper: Retry logic for Gemini
// ===============================
async function fetchWithRetry(url, options, retries = 3, delay = 1000) {
  try {
    const res = await fetch(url, options);

    if (!res.ok) {
      throw new Error(`API Error: ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    if (retries > 0) {
      await new Promise((r) => setTimeout(r, delay));
      return fetchWithRetry(url, options, retries - 1, delay * 2);
    }
    throw err;
  }
}

function extractJSON(str) {
  if (!str) throw new Error("Empty AI response");

  const start = str.indexOf("{");
  const end = str.lastIndexOf("}");

  if (start === -1 || end === -1) {
    throw new Error("Invalid AI response format (no JSON found)");
  }

  return str.substring(start, end + 1);
}

// ===============================
// MAIN: Generate Trip using AI
// ===============================
exports.generateTrip = async (req, res) => {
  try {
    const { destination, durationDays, budgetTier, interests } = req.body;

    if (!destination || !durationDays || !budgetTier) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    const prompt = `
You are an expert travel planner AI.

Create a ${durationDays}-day travel itinerary for ${destination}.
Budget level: ${budgetTier}.
User interests: ${interests?.join(", ") || "General travel"}.

STRICT RULES:
- Return ONLY valid JSON
- No markdown
- No explanation
- No \`\`\`json blocks

JSON FORMAT:
{
  "itinerary": [
    {
      "dayNumber": 1,
      "activities": [
        {
          "title": "Activity name",
          "description": "Short description",
          "estimatedCostUSD": 50,
          "timeOfDay": "Morning"
        }
      ]
    }
  ],
  "hotels": [
    {
      "name": "Hotel name",
      "tier": "Budget | Mid | Luxury",
      "estimatedCostNightUSD": 100,
      "rating": "4.5"
    }
  ],
  "estimatedBudget": {
    "transport": 100,
    "accommodation": 300,
    "food": 150,
    "activities": 100,
    "total": 650
  }
}
`;

    const url =
      `https://generativelanguage.googleapis.com/v1beta/models/` +
      `gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

    const response = await fetchWithRetry(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    const text =
      response?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error("Empty response from Gemini");
    }

    // Clean + parse AI response safely
    const cleanText = extractJSON(text);

    let data;
    try {
      data = JSON.parse(cleanText);
    } catch (err) {
      console.log("RAW GEMINI OUTPUT:\n", text);
      throw new Error("Failed to parse Gemini JSON response");
    }

    // Save trip in DB (user isolated)
    const trip = await Trip.create({
      userId: req.user.id,
      destination,
      durationDays,
      budgetTier,
      interests,
      itinerary: data.itinerary,
      hotels: data.hotels,
      estimatedBudget: data.estimatedBudget,
    });

    return res.status(201).json(trip);
  } catch (err) {
    console.error("generateTrip error:", err.message);

    return res.status(500).json({
      message: "AI generation failed",
      error: err.message,
    });
  }
};
exports.regenerateDay = async (req, res) => {
  try {
    const { dayNumber, userPrompt } = req.body;

    const trip = await Trip.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!trip) {
      return res.status(404).json({
        message: "Trip not found",
      });
    }

    const prompt = `
Generate ONLY Day ${dayNumber}
for a trip to ${trip.destination}.

Budget: ${trip.budgetTier}

Interests:
${trip.interests.join(", ")}

User Request:
${userPrompt}

Return ONLY JSON:

{
  "dayNumber": ${dayNumber},
  "activities": [
    {
      "title":"Activity",
      "description":"Description",
      "estimatedCostUSD":20,
      "timeOfDay":"Morning"
    }
  ]
}
`;

    const url =
      `https://generativelanguage.googleapis.com/v1beta/models/` +
      `gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      }),
    });

   const data = await response.json();

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return res.status(500).json({
        message: "Gemini returned empty response",
      });
    }

    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");

    if (start === -1 || end === -1) {
      return res.status(500).json({
        message: "Invalid JSON returned by Gemini",
        raw: text,
      });
    }

    const cleanText = text.substring(start, end + 1);

    const newDay = JSON.parse(cleanText);

    trip.itinerary = trip.itinerary.map((day) =>
      day.dayNumber === dayNumber ? newDay : day
    );

    await trip.save();

    res.json(trip);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Failed to regenerate day",
    });
  }
};
// ===============================
// GET ALL TRIPS OF LOGGED-IN USER
// ===============================
exports.getMyTrips = async (req, res) => {
  try {
    const trips = await Trip.find({
      userId: req.user.id,
    }).sort({ createdAt: -1 });

    res.status(200).json(trips);
  } catch (err) {
    console.error("getMyTrips error:", err.message);

    res.status(500).json({
      message: "Failed to fetch trips",
    });
  }
};
// ===============================
// UPDATE TRIP
// ===============================
exports.updateTrip = async (req, res) => {
  try {
    const trip = await Trip.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!trip) {
      return res.status(404).json({
        message: "Trip not found",
      });
    }

    trip.itinerary = req.body.itinerary;

    await trip.save();

    res.status(200).json(trip);
  } catch (err) {
    console.error("updateTrip error:", err);

    res.status(500).json({
      message: "Failed to update trip",
    });
  }
};
exports.deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!trip) {
      return res.status(404).json({
        message: "Trip not found",
      });
    }

    res.json({
      message: "Trip deleted successfully",
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Delete failed",
    });
  }
};