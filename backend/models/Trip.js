const mongoose = require("mongoose");

const ActivitySchema = new mongoose.Schema({
  title: String,
  description: String,
  estimatedCostUSD: Number,
  timeOfDay: {
  type: String,
  default: "Afternoon"
},
});

const TripSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    destination: String,
    durationDays: Number,
    budgetTier: String,
    interests: [String],

    itinerary: [
      {
        dayNumber: Number,
        activities: [ActivitySchema],
      },
    ],

    hotels: [
      {
        name: String,
        tier: String,
        estimatedCostNightUSD: Number,
        rating: String,
      },
    ],

    estimatedBudget: {
      transport: Number,
      accommodation: Number,
      food: Number,
      activities: Number,
      total: Number,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Trip", TripSchema);