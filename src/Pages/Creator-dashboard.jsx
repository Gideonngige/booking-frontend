// CreatorDashboard.jsx
import React, { useState, useEffect } from "react";
import { useAuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase/config";

export default function CreatorDashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { currentUser } = useAuthContext();
  const navigate = useNavigate();
  const savedUser = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const fetchMyEvents = async () => {
      try {
        const token = await auth.currentUser.getIdToken();
        const userId = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")).id : null;
        
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/organizer-events`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ "userId": userId }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch events.");
        setEvents(data.events);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMyEvents();
  }, []);

  const totalTicketsSold = events.reduce((sum, event) => {
    return sum + (Number(event.totalTickets) - Number(event.availableTickets));
  }, 0);

  const totalRevenue = events.reduce((sum, event) => {
    const sold = Number(event.totalTickets) - Number(event.availableTickets);
    return sum + sold * Number(event.price);
  }, 0);

  const totalTicketsRemaining = events.reduce((sum, event) => {
    return sum + Number(event.availableTickets);
  }, 0);

  const bestEvent = events.length > 0
    ? events.reduce((best, event) =>
        (Number(event.totalTickets) - Number(event.availableTickets)) >
        (Number(best.totalTickets) - Number(best.availableTickets)) ? event : best
      )
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-500 to-gray-900 p-6">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Creator Dashboard</h1>
          <p className="text-orange-100 text-sm mt-1">{savedUser.name || currentUser?.email}</p>
        </div>
        <button
          onClick={() => navigate("/create-event")}
          className="bg-white text-orange-500 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition"
        >
          + Create Event
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="text-gray-500 text-sm">Total Events</h3>
          <p className="text-2xl font-bold text-orange-500">{events.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="text-gray-500 text-sm">Tickets Sold</h3>
          <p className="text-2xl font-bold text-orange-500">{totalTicketsSold}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="text-gray-500 text-sm">Tickets Remaining</h3>
          <p className="text-2xl font-bold text-orange-500">{totalTicketsRemaining}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="text-gray-500 text-sm">Revenue (Ksh)</h3>
          <p className="text-2xl font-bold text-orange-500">{totalRevenue.toLocaleString()}</p>
        </div>
      </div>

      {/* Event List */}
      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Your Events</h2>

        {loading ? (
          <p className="text-center text-gray-400 py-10">Loading your events...</p>
        ) : error ? (
          <p className="text-center text-red-500 py-10">{error}</p>
        ) : events.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-400">No events yet.</p>
            <button
              onClick={() => navigate("/create-event")}
              className="mt-3 bg-orange-500 text-white px-5 py-2 rounded-lg hover:bg-orange-600 transition"
            >
              Create Your First Event
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-600 border-b">
                  <th className="py-2 pr-4">Event</th>
                  <th className="pr-4">Date</th>
                  <th className="pr-4">Location</th>
                  <th className="pr-4">Tickets</th>
                  <th className="pr-4">Revenue</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => {
                  const sold = Number(event.totalTickets) - Number(event.availableTickets);
                  const revenue = sold * Number(event.price);
                  const isPast = new Date(event.date) < new Date();
                  const isSoldOut = Number(event.availableTickets) === 0;

                  return (
                    <tr key={event.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 font-semibold pr-4">{event.title}</td>
                      <td className="pr-4 text-gray-600">
                        {new Date(event.date).toLocaleDateString("en-KE", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </td>
                      <td className="pr-4 text-gray-600">{event.location}</td>
                      <td className="pr-4 text-gray-600">
                        {sold}/{event.totalTickets}
                        <br />
                        <span className="text-sm text-gray-400">{event.availableTickets} left</span>
                      </td>
                      <td className="pr-4 text-orange-500 font-semibold">
                        Ksh {revenue.toLocaleString()}
                      </td>
                      <td>
                        <span className={`px-2 py-1 rounded text-sm font-semibold ${
                          isSoldOut
                            ? "bg-red-100 text-red-600"
                            : isPast
                            ? "bg-gray-100 text-gray-500"
                            : "bg-green-100 text-green-600"
                        }`}>
                          {isSoldOut ? "Sold Out" : isPast ? "Ended" : "Active"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Insights */}
      <div className="grid md:grid-cols-2 gap-4 mt-6">
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="font-bold text-gray-700 mb-2">💡 Tips to Increase Sales</h3>
          <ul className="text-gray-600 text-sm space-y-1">
            <li>• Share your event on social media</li>
            <li>• Offer early bird discounts</li>
            <li>• Add attractive event images</li>
          </ul>
        </div>
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="font-bold text-gray-700 mb-2">📈 Performance Summary</h3>
          <p className="text-gray-600 text-sm">
            {bestEvent
              ? <>Your best performing event is{" "}
                  <span className="font-semibold text-orange-500">{bestEvent.title}</span>.
                  Keep promoting similar events!</>
              : "Create your first event to see performance insights."
            }
          </p>
        </div>
      </div>

    </div>
  );
}