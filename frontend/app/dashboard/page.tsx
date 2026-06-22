"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import API from "../../src/utils/api";

export default function Dashboard() {
  const router = useRouter();

  const [destination, setDestination] = useState("");
  const [newActivity, setNewActivity] = useState("");
  const [durationDays, setDurationDays] = useState(3);
  const [budgetTier, setBudgetTier] = useState("Medium");
  const [interests, setInterests] = useState("");

  const [trip, setTrip] = useState<any>(null);
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
    } else {
      fetchTrips();
    }
  }, [router]);

  const fetchTrips = async () => {
    try {
      const res = await API.get("/trips");
      setTrips(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const generateTrip = async () => {
    try {
      setLoading(true);

      const res = await API.post("/trips/generate", {
        destination,
        durationDays,
        budgetTier,
        interests: interests
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      });

      setTrip(res.data);
      fetchTrips();
    } catch (err) {
      console.error(err);
      alert("Failed to generate trip");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const addActivity = async (dayNumber: number) => {
  try {
    if (!newActivity.trim()) return;

    const updated = trip.itinerary.map((d: any) => ({
  ...d,
  activities: [...d.activities],
}));

    const day = updated.find(
      (d: any) => d.dayNumber === dayNumber
    );

    if (!day) return;

    day.activities.push({
      title: newActivity,
      description: "Added manually",
      estimatedCostUSD: 0,
      timeOfDay: "Afternoon",
    });

    const res = await API.put(`/trips/${trip._id}`, {
      itinerary: updated,
    });

    setTrip(res.data);
    setNewActivity("");
  } catch (err) {
    console.error(err);
  }
};

  const removeActivity = async (
    dayNumber: number,
    activityIndex: number
  ) => {
    if (!trip) return;

    const updated = [...trip.itinerary];

    const day = updated.find(
      (d: any) => d.dayNumber === dayNumber
    );

    if (!day) return;

    day.activities.splice(activityIndex, 1);

    const res = await API.put(`/trips/${trip._id}`, {
      itinerary: updated,
    });

    setTrip(res.data);
    fetchTrips();
  };

  const regenerateDay = async (dayNumber: number) => {
  try {
    const userPrompt = window.prompt(
      "Describe how you want this day changed"
    );

    if (!userPrompt) return;

    const res = await API.post(
      `/trips/${trip._id}/regenerate-day`,
      {
        dayNumber,
        userPrompt,
      }
    );

    setTrip(res.data);
    fetchTrips();
  } catch (err) {
    console.error(err);
    alert("Failed to regenerate day");
  }
};

const deleteTrip = async () => {
  try {
    if (!trip) return;

    await API.delete(`/trips/${trip._id}`);

    setTrip(null);
    fetchTrips();

    alert("Trip deleted successfully");
  } catch (err) {
    console.error(err);
    alert("Failed to delete trip");
  }
};

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">
            AI Travel Planner ✈️
          </h1>

          <button
            onClick={logout}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>

        {/* My Trips */}
        <div className="bg-white p-6 rounded shadow mb-8">
          <h2 className="text-xl font-bold mb-4">
            My Trips
          </h2>

          {trips.length === 0 ? (
            <p>No trips found.</p>
          ) : (
            trips.map((savedTrip: any) => (
              <div
                key={savedTrip._id}
                onClick={() => setTrip(savedTrip)}
                className="border p-3 rounded mb-2 cursor-pointer hover:bg-gray-100"
              >
                <p className="font-semibold">
                  {savedTrip.destination}
                </p>

                <p>{savedTrip.durationDays} Days</p>
              </div>
            ))
          )}
        </div>

        {/* Create Trip */}
        <div className="bg-white p-6 rounded shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">
            Create Trip
          </h2>

          <input
            type="text"
            placeholder="Destination"
            className="border p-2 w-full mb-3"
            value={destination}
            onChange={(e) =>
              setDestination(e.target.value)
            }
          />

          <input
            type="number"
            placeholder="Days"
            className="border p-2 w-full mb-3"
            value={durationDays}
            onChange={(e) =>
              setDurationDays(Number(e.target.value))
            }
          />

          <select
            className="border p-2 w-full mb-3"
            value={budgetTier}
            onChange={(e) =>
              setBudgetTier(e.target.value)
            }
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>

          <input
            type="text"
            placeholder="Food, Culture, Shopping"
            className="border p-2 w-full mb-4"
            value={interests}
            onChange={(e) =>
              setInterests(e.target.value)
            }
          />

          <button
            onClick={generateTrip}
            className="bg-blue-500 text-white px-5 py-2 rounded"
          >
            {loading
              ? "Generating..."
              : "Generate Trip"}
          </button>
        </div>
        {!trip && (
          <div className="bg-white p-10 rounded shadow text-center">
            <h2 className="text-2xl font-bold">
              No Trip Selected
            </h2>

            <p>
              Generate a new trip or select one
              from My Trips.
            </p>
          </div>
        )}

        {/* Results */}
        {trip && (
          <div className="space-y-6">
            {/* Budget */}
            <div className="bg-white p-6 rounded shadow">
              <h2 className="text-2xl font-bold mb-2">
                {trip.destination}
              </h2>

              <p>Duration: {trip.durationDays} Days</p>

              <p>Budget: {trip.budgetTier}</p>

              <p>
                Interests: {trip.interests?.join(", ")}
              </p>

              <button
                onClick={deleteTrip}
                className="bg-red-600 text-white px-4 py-2 rounded mt-4"
              >
                Delete Trip
              </button>
            </div>
            <div className="bg-white p-6 rounded shadow">
              <h2 className="text-xl font-bold mb-4">
                Estimated Budget
              </h2>

              <p>
                Transport: $
                {trip.estimatedBudget?.transport}
              </p>

              <p>
                Accommodation: $
                {trip.estimatedBudget?.accommodation}
              </p>

              <p>
                Food: $
                {trip.estimatedBudget?.food}
              </p>

              <p>
                Activities: $
                {trip.estimatedBudget?.activities}
              </p>

              <p className="font-bold mt-2">
                Total: $
                {trip.estimatedBudget?.total}
              </p>
            </div>

            {/* Hotels */}
            <div className="bg-white p-6 rounded shadow">
              <h2 className="text-xl font-bold mb-4">
                Recommended Hotels
              </h2>

              {trip.hotels?.map((hotel: any) => (
                <div
                  key={hotel._id || hotel.name}
                  className="border-b py-2"
                >
                  <p className="font-semibold">
                    {hotel.name}
                  </p>

                  <p>
                    {hotel.tier} • $
                    {hotel.estimatedCostNightUSD}/night
                  </p>

                  <p>
                    Rating: {hotel.rating}
                  </p>
                </div>
              ))}
            </div>

            {/* Itinerary */}
            <div className="bg-white p-6 rounded shadow">
              <h2 className="text-xl font-bold mb-4">
                Day-by-Day Itinerary
              </h2>

              {trip.itinerary?.map((day: any) => (
                <div
                  key={day.dayNumber}
                  className="mb-6 border-b pb-4"
                >
                  <h3 className="font-bold text-lg mb-2">
                    Day {day.dayNumber}
                  </h3>

                  {day.activities?.map(
                    (
                      activity: any,
                      index: number
                    ) => (
                      <div
                        key={
                          activity._id || index
                        }
                        className="ml-4 mt-2 border-l-2 pl-4"
                      >
                        <p className="font-semibold">
                          {activity.title}
                        </p>

                        <p>
                          {activity.description}
                        </p>

                        <p>
                          Cost: $
                          {
                            activity.estimatedCostUSD
                          }
                        </p>

                        <button
                          onClick={() =>
                            removeActivity(
                              day.dayNumber,
                              index
                            )
                          }
                          className="bg-red-500 text-white px-2 py-1 rounded mt-2"
                        >
                          Remove
                        </button>
                      </div>
                    )
                  )}

                  <div className="mt-3 flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter activity name"
                      value={newActivity}
                      onChange={(e) => setNewActivity(e.target.value)}
                      className="border p-2 rounded flex-1"
                    />

                    <button
                      onClick={() => addActivity(day.dayNumber)}
                      className="bg-green-500 text-white px-3 py-1 rounded"
                    >
                      Add Activity
                    </button>

                    <button
                      onClick={() =>
                        regenerateDay(day.dayNumber)
                      }
                      className="bg-yellow-500 text-white px-3 py-1 rounded"
                    >
                      Regenerate Day
                    </button>
                 </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}