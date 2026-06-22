"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import API from "../../src/utils/api";
import toast from "react-hot-toast";

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
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
    } else {
      fetchTrips();
    }
  }, []);

  // ---------------- FETCH TRIPS ----------------
  const fetchTrips = async () => {
    try {
      const res = await API.get("/trips");
      setTrips(res.data);
    } catch {
      toast.error("Failed to load trips");
    }
  };

  // ---------------- GENERATE TRIP ----------------
  const generateTrip = async () => {
    try {
      setLoading(true);

      const res = await API.post("/trips/generate", {
        destination,
        durationDays,
        budgetTier,
        interests: interests
          .split(",")
          .map((i) => i.trim())
          .filter(Boolean),
      });

      setTrip(res.data);
      fetchTrips();

      toast.success("Trip generated successfully 🚀");
    } catch {
      toast.error("Failed to generate trip");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- ADD ACTIVITY ----------------
  const addActivity = async (dayNumber: number) => {
    try {
      if (!newActivity.trim()) return;

      setActionLoading(true);

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

      toast.success("Activity added");
    } catch {
      toast.error("Failed to add activity");
    } finally {
      setActionLoading(false);
    }
  };

  // ---------------- REMOVE ACTIVITY ----------------
  const removeActivity = async (
    dayNumber: number,
    activityIndex: number
  ) => {
    try {
      setActionLoading(true);

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

      toast.success("Activity removed");
    } catch {
      toast.error("Failed to remove activity");
    } finally {
      setActionLoading(false);
    }
  };

  // ---------------- REGENERATE DAY ----------------
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

      toast.success("Day regenerated");
    } catch {
      toast.error("Failed to regenerate day");
    }
  };

  // ---------------- DELETE TRIP ----------------
  const deleteTrip = async () => {
    try {
      if (!trip) return;

      setActionLoading(true);

      await API.delete(`/trips/${trip._id}`);

      setTrip(null);
      fetchTrips();

      toast.success("Trip deleted");
    } catch {
      toast.error("Failed to delete trip");
    } finally {
      setActionLoading(false);
    }
  };

  // ---------------- LOGOUT ----------------
  const logout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  // ================= UI =================
  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">
            AI Travel Planner ✈️
          </h1>

          <button
            onClick={logout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>

        {/* MY TRIPS */}
        <div className="bg-white p-6 rounded shadow mb-8">
          <h2 className="text-xl font-bold mb-4">
            My Trips
          </h2>

          {trips.length === 0 ? (
            <p className="text-gray-500">
              No trips found
            </p>
          ) : (
            trips.map((t: any) => (
              <div
                key={t._id}
                onClick={() => setTrip(t)}
                className="border p-3 rounded mb-2 cursor-pointer hover:bg-gray-100"
              >
                <p className="font-semibold">
                  {t.destination}
                </p>
                <p className="text-sm text-gray-500">
                  {t.durationDays} Days
                </p>
              </div>
            ))
          )}
        </div>

        {/* CREATE TRIP */}
        <div className="bg-white p-6 rounded shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">
            Create Trip
          </h2>

          <input
            type="text"
            placeholder="Destination"
            className="border p-2 w-full mb-3 rounded"
            value={destination}
            onChange={(e) =>
              setDestination(e.target.value)
            }
          />

          <input
            type="number"
            className="border p-2 w-full mb-3 rounded"
            value={durationDays}
            onChange={(e) =>
              setDurationDays(Number(e.target.value))
            }
          />

          <select
            className="border p-2 w-full mb-3 rounded"
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
            className="border p-2 w-full mb-4 rounded"
            value={interests}
            onChange={(e) =>
              setInterests(e.target.value)
            }
          />

          <button
            onClick={generateTrip}
            disabled={loading}
            className={`w-full py-2 rounded text-white ${
              loading
                ? "bg-gray-400"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {loading
              ? "Generating..."
              : "Generate Trip"}
          </button>
        </div>

        {/* EMPTY STATE */}
        {!trip && (
          <div className="bg-white p-10 rounded shadow text-center">
            <h2 className="text-2xl font-bold">
              No Trip Selected
            </h2>
            <p className="text-gray-500 mt-2">
              Generate or select a trip to view details
            </p>
          </div>
        )}

        {/* TRIP DETAILS */}
        {trip && (
          <div className="space-y-6">

            {/* BASIC INFO */}
            <div className="bg-white p-6 rounded shadow">
              <h2 className="text-2xl font-bold">
                {trip.destination}
              </h2>

              <p>Duration: {trip.durationDays} days</p>
              <p>Budget: {trip.budgetTier}</p>
              <p>
                Interests:{" "}
                {trip.interests?.join(", ")}
              </p>

              <button
                onClick={deleteTrip}
                disabled={actionLoading}
                className="mt-4 bg-red-600 text-white px-4 py-2 rounded"
              >
                Delete Trip
              </button>
            </div>

            {/* ITINERARY */}
            <div className="bg-white p-6 rounded shadow">
              <h2 className="text-xl font-bold mb-4">
                Itinerary
              </h2>

              {trip.itinerary?.map((day: any) => (
                <div
                  key={day.dayNumber}
                  className="mb-6 border-b pb-4"
                >
                  <h3 className="font-bold">
                    Day {day.dayNumber}
                  </h3>

                  {day.activities?.map(
                    (a: any, i: number) => (
                      <div
                        key={i}
                        className="ml-4 mt-2 border-l-2 pl-4"
                      >
                        <p className="font-semibold">
                          {a.title}
                        </p>

                        <p className="text-sm text-gray-600">
                          {a.description}
                        </p>

                        <button
                          onClick={() =>
                            removeActivity(
                              day.dayNumber,
                              i
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
                      className="border p-2 flex-1 rounded"
                      placeholder="Add activity"
                      value={newActivity}
                      onChange={(e) =>
                        setNewActivity(e.target.value)
                      }
                    />

                    <button
                      onClick={() =>
                        addActivity(day.dayNumber)
                      }
                      className="bg-green-500 text-white px-3 py-1 rounded"
                    >
                      Add
                    </button>

                    <button
                      onClick={() =>
                        regenerateDay(day.dayNumber)
                      }
                      className="bg-yellow-500 text-white px-3 py-1 rounded"
                    >
                      Regenerate
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