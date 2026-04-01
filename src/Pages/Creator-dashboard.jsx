// CreatorDashboard.jsx
import React from "react";

export default function CreatorDashboard() {
  // Sample data (replace with API data later)
  const stats = {
    totalEvents: 3,
    ticketsSold: 120,
    ticketsRemaining: 80,
    revenue: 120000,
  };

  const events = [
    {
      id: 1,
      title: "Nairobi Music Fest",
      date: "12 Aug 2026",
      location: "Nairobi",
      sold: 50,
      total: 100,
      price: 1500,
    },
    {
      id: 2,
      title: "Tech Conference",
      date: "20 Sep 2026",
      location: "Mombasa",
      sold: 30,
      total: 50,
      price: 2000,
    },
    {
      id: 3,
      title: "Business Summit",
      date: "5 Oct 2026",
      location: "Kisumu",
      sold: 40,
      total: 50,
      price: 2500,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-500 to-gray-900 p-6">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Creator Dashboard</h1>
        <a
          href="/create-event"
          className="bg-white text-orange-500 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100"
        >
          + Create Event
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="text-gray-500 text-sm">Total Events</h3>
          <p className="text-2xl font-bold text-orange-500">
            {stats.totalEvents}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="text-gray-500 text-sm">Tickets Sold</h3>
          <p className="text-2xl font-bold text-orange-500">
            {stats.ticketsSold}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="text-gray-500 text-sm">Tickets Remaining</h3>
          <p className="text-2xl font-bold text-orange-500">
            {stats.ticketsRemaining}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="text-gray-500 text-sm">Revenue (KES)</h3>
          <p className="text-2xl font-bold text-orange-500">
            {stats.revenue.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Event List */}
      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Your Events
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-600 border-b">
                <th className="py-2">Event</th>
                <th>Date</th>
                <th>Location</th>
                <th>Tickets</th>
                <th>Revenue</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {events.map((event) => {
                const revenue = event.sold * event.price;
                const remaining = event.total - event.sold;

                return (
                  <tr key={event.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 font-semibold">{event.title}</td>
                    <td>{event.date}</td>
                    <td>{event.location}</td>
                    <td>
                      {event.sold}/{event.total} <br />
                      <span className="text-sm text-gray-500">
                        {remaining} left
                      </span>
                    </td>
                    <td className="text-orange-500 font-semibold">
                      KES {revenue.toLocaleString()}
                    </td>
                    <td>
                      <span className="bg-green-100 text-green-600 px-2 py-1 rounded text-sm">
                        Active
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Extra Section: Insights */}
      <div className="grid md:grid-cols-2 gap-4 mt-6">
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="font-bold text-gray-700 mb-2">
            💡 Tips to Increase Sales
          </h3>
          <ul className="text-gray-600 text-sm space-y-1">
            <li>• Share your event on social media</li>
            <li>• Offer early bird discounts</li>
            <li>• Add attractive event images</li>
          </ul>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="font-bold text-gray-700 mb-2">
            📈 Performance Summary
          </h3>
          <p className="text-gray-600 text-sm">
            Your best performing event is{" "}
            <span className="font-semibold text-orange-500">
              Nairobi Music Fest
            </span>
            . Keep promoting similar events!
          </p>
        </div>
      </div>
    </div>
  );
}