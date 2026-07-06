import React, { useEffect, useState } from "react";

import { useNavigate, Navigate } from "react-router-dom";
import FloatingParticles from "../Components/Floating-particles";

import api from "../Api/api";
import Swal from "sweetalert2";

export default function CreatorDashboard() {

  // User
  const user = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : null;

  // Redirect
  if (!user) {
    return <Navigate to="/login" />;
  }

  // Only organizers
  if (user.role !== "organizer") {
    return <Navigate to="/" />;
  }

  const navigate = useNavigate();

  const [events, setEvents] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  // Fetch organizer events
  useEffect(() => {

    const fetchEvents = async () => {

      try {

        const res = await api.get(
          "/get_organizer_events/"
        );

        setEvents(res.data.events);

      } catch (err) {

        console.log(err);

        // setError(
        //   err.response?.data?.message ||
        //   "Failed to fetch events"
        // );
        Swal.fire({
          icon: "error",
          title: "Failed to fetch events",
          text: err.response?.data?.message ||
            "An unexpected error occurred. Please try again.",
        });

      } finally {

        setLoading(false);

      }
    };

    fetchEvents();

  }, []);

  // Stats
  const totalTicketsSold = events.reduce(
    (sum, event) =>
      sum + Number(event.tickets_sold),
    0
  );

  const totalRevenue = events.reduce(
    (sum, event) =>
      sum + Number(event.revenue),
    0
  );

  const totalTicketsRemaining = events.reduce(
    (sum, event) =>
      sum + Number(event.available_tickets),
    0
  );

  // Best event
  const bestEvent =
    events.length > 0
      ? events.reduce((best, event) =>
          Number(event.tickets_sold) >
          Number(best.tickets_sold)
            ? event
            : best
        )
      : null;

  return (

    <div className="min-h-screen bg-gradient-to-r from-orange-500 to-gray-900 p-6">
      {/* Floating particles */}
      <FloatingParticles />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">

        <div>

          <h1 className="text-3xl font-bold text-white">
            Creator Dashboard
          </h1>

          <p className="text-orange-100 text-sm mt-1">
            Welcome back, {user.name}
          </p>

        </div>

        <button
          onClick={() =>
            navigate("/create-event")
          }
          className="bg-white text-orange-500 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition"
        >
          + Create Event
        </button>

      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">

        <div className="bg-white p-4 rounded-xl shadow">

          <h3 className="text-gray-500 text-sm">
            Total Events
          </h3>

          <p className="text-2xl font-bold text-orange-500">
            {events.length}
          </p>

        </div>

        <div className="bg-white p-4 rounded-xl shadow">

          <h3 className="text-gray-500 text-sm">
            Tickets Sold
          </h3>

          <p className="text-2xl font-bold text-orange-500">
            {totalTicketsSold}
          </p>

        </div>

        <div className="bg-white p-4 rounded-xl shadow">

          <h3 className="text-gray-500 text-sm">
            Tickets Remaining
          </h3>

          <p className="text-2xl font-bold text-orange-500">
            {totalTicketsRemaining}
          </p>

        </div>

        <div className="bg-white p-4 rounded-xl shadow">

          <h3 className="text-gray-500 text-sm">
            Revenue (Ksh)
          </h3>

          <p className="text-2xl font-bold text-orange-500">
            {totalRevenue.toLocaleString()}
          </p>

        </div>

      </div>

      {/* Event List */}
      <div className="bg-white rounded-xl shadow p-4">

        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Your Events
        </h2>

        {loading ? (

          <p className="text-center text-gray-400 py-10">
            Loading your events...
          </p>

        ) : error ? (

          <p className="text-center text-red-500 py-10">
            {error}
          </p>

        ) : events.length === 0 ? (

          <div className="text-center py-10">

            <p className="text-gray-400">
              No events yet.
            </p>

            <button
              onClick={() =>
                navigate("/create-event")
              }
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

                  <th className="py-2 pr-4">
                    Event
                  </th>

                  <th className="pr-4">
                    Date
                  </th>

                  <th className="pr-4">
                    Location
                  </th>

                  <th className="pr-4">
                    Tickets
                  </th>

                  <th className="pr-4">
                    Revenue
                  </th>

                  <th className="pr-4">
                    Status
                  </th>

                  <th>
                    Action
                  </th>

                </tr>

              </thead>

              <tbody>

                {events.map((event) => {

                  const isPast =
                    new Date(event.date) <
                    new Date();

                  const isSoldOut =
                    Number(event.available_tickets) === 0;

                  return (

                    <tr
                      key={event.id}
                      className="border-b hover:bg-gray-50"
                    >

                      <td className="py-3 pr-4">

                        <div className="font-semibold">
                          {event.title}
                        </div>

                        <div className="text-xs text-gray-400">
                          {event.category}
                        </div>

                      </td>

                      <td className="pr-4 text-gray-600">

                        {new Date(
                          event.date
                        ).toLocaleDateString(
                          "en-KE",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          }
                        )}

                      </td>

                      <td className="pr-4 text-gray-600">
                        {event.location}
                      </td>

                      <td className="pr-4 text-gray-600">

                        {event.tickets_sold}/
                        {event.total_tickets}

                        <br />

                        <span className="text-sm text-gray-400">

                          {
                            event.available_tickets
                          } left

                        </span>

                      </td>

                      <td className="pr-4 text-orange-500 font-semibold">

                        Ksh{" "}
                        {Number(
                          event.revenue
                        ).toLocaleString()}

                      </td>

                      <td>

                        <span
                          className={`px-2 py-1 rounded text-sm font-semibold ${
                            isSoldOut
                              ? "bg-red-100 text-red-600"
                              : isPast
                              ? "bg-gray-100 text-gray-500"
                              : "bg-green-100 text-green-600"
                          }`}
                        >

                          {isSoldOut
                            ? "Sold Out"
                            : isPast
                            ? "Ended"
                            : "Active"}

                        </span>

                      </td>

                      <td>

                        <button
                          onClick={() =>
                            navigate(
                              `/verify-tickets/${event.id}`
                            )
                          }
                          className="text-green-500 hover:underline text-xs font-semibold"
                        >
                          Verify Tickets
                        </button>

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

          <h3 className="font-bold text-gray-700 mb-2">
            💡 Tips to Increase Sales
          </h3>

          <ul className="text-gray-600 text-sm space-y-1">

            <li>
              • Share your event on social media
            </li>

            <li>
              • Use attractive event images
            </li>

            <li>
              • Offer early bird discounts
            </li>

          </ul>

        </div>

        <div className="bg-white p-4 rounded-xl shadow">

          <h3 className="font-bold text-gray-700 mb-2">
            📈 Performance Summary
          </h3>

          <p className="text-gray-600 text-sm">

            {bestEvent ? (
              <>
                Your best performing event is{" "}

                <span className="font-semibold text-orange-500">
                  {bestEvent.title}
                </span>

                .
              </>
            ) : (
              "Create your first event to see insights."
            )}

          </p>

        </div>

      </div>

    </div>
  );
}