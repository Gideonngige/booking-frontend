// AdminDashboard.jsx
import React, { useState } from "react";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");

  // SAMPLE DATA (replace with API later)
  const stats = {
    totalUsers: 120,
    totalEvents: 35,
    totalRevenue: 850000,
    totalTickets: 540,
  };

  const events = [
    { id: 1, title: "Music Fest", creator: "John", revenue: 50000, status: "Ended" },
    { id: 2, title: "Tech Expo", creator: "Mary", revenue: 80000, status: "Active" },
  ];

  const users = [
    { id: 1, name: "John Doe", email: "john@mail.com" },
    { id: 2, name: "Mary Jane", email: "mary@mail.com" },
  ];

  const messages = [
    { id: 1, name: "Client A", message: "Need help with booking" },
    { id: 2, name: "Organizer B", message: "Payment not received" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-500 to-gray-900 flex">
      
      {/* Sidebar */}
      <div className="w-64 bg-white p-4 shadow-lg">
        <h2 className="text-xl font-bold text-orange-500 mb-6">
          Admin Panel
        </h2>

        <ul className="space-y-3">
          {["dashboard", "events", "users", "messages", "payouts"].map(tab => (
            <li key={tab}>
              <button
                onClick={() => setActiveTab(tab)}
                className={`w-full text-left px-3 py-2 rounded-lg ${
                  activeTab === tab
                    ? "bg-orange-500 text-white"
                    : "hover:bg-gray-100"
                }`}
              >
                {tab.toUpperCase()}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 text-white">

        {/* DASHBOARD */}
        {activeTab === "dashboard" && (
          <>
            <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard title="Users" value={stats.totalUsers} />
              <StatCard title="Events" value={stats.totalEvents} />
              <StatCard title="Tickets Sold" value={stats.totalTickets} />
              <StatCard
                title="Revenue (KES)"
                value={stats.totalRevenue.toLocaleString()}
              />
            </div>
          </>
        )}

        {/* EVENTS */}
        {activeTab === "events" && (
          <Section title="All Events">
            <table className="w-full text-left bg-white text-gray-800 rounded-xl">
              <thead>
                <tr className="border-b">
                  <th className="p-3">Title</th>
                  <th>Creator</th>
                  <th>Revenue</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {events.map(e => (
                  <tr key={e.id} className="border-b">
                    <td className="p-3">{e.title}</td>
                    <td>{e.creator}</td>
                    <td>KES {e.revenue}</td>
                    <td>{e.status}</td>
                    <td>
                      <button className="text-red-500">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>
        )}

        {/* USERS */}
        {activeTab === "users" && (
          <Section title="All Users">
            <table className="w-full bg-white text-gray-800 rounded-xl">
              <thead>
                <tr className="border-b">
                  <th className="p-3">Name</th>
                  <th>Email</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-b">
                    <td className="p-3">{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <button className="text-red-500">Suspend</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>
        )}

        {/* MESSAGES */}
        {activeTab === "messages" && (
          <Section title="Messages">
            {messages.map(msg => (
              <div key={msg.id} className="bg-white text-gray-800 p-4 rounded-xl mb-3">
                <p className="font-semibold">{msg.name}</p>
                <p className="text-sm mb-2">{msg.message}</p>

                <textarea
                  placeholder="Reply..."
                  className="w-full border rounded-lg p-2 mb-2"
                />

                <button className="bg-orange-500 text-white px-4 py-1 rounded">
                  Send Reply
                </button>
              </div>
            ))}
          </Section>
        )}

        {/* PAYOUTS */}
        {activeTab === "payouts" && (
          <Section title="Payouts">
            <table className="w-full bg-white text-gray-800 rounded-xl">
              <thead>
                <tr className="border-b">
                  <th className="p-3">Event</th>
                  <th>Creator</th>
                  <th>Total Revenue</th>
                  <th>Commission</th>
                  <th>Payable</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {events.map(e => {
                  const commission = e.revenue * 0.1;
                  const payable = e.revenue - commission;

                  return (
                    <tr key={e.id} className="border-b">
                      <td className="p-3">{e.title}</td>
                      <td>{e.creator}</td>
                      <td>KES {e.revenue}</td>
                      <td>KES {commission}</td>
                      <td className="text-green-600 font-semibold">
                        KES {payable}
                      </td>
                      <td>
                        <button className="bg-green-500 text-white px-3 py-1 rounded">
                          Pay
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Section>
        )}

      </div>
    </div>
  );
}

// Reusable Components
function StatCard({ title, value }) {
  return (
    <div className="bg-white text-gray-800 p-4 rounded-xl shadow">
      <h3 className="text-sm text-gray-500">{title}</h3>
      <p className="text-2xl font-bold text-orange-500">{value}</p>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      {children}
    </div>
  );
}