// AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import { auth } from "../firebase/config";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getToken = async () => await auth.currentUser.getIdToken();

  const apiFetch = async (url, options = {}) => {
    const token = await getToken();
    const res = await fetch(`${import.meta.env.VITE_API_URL}${url}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Request failed.");
    return data;
  };

  // Fetch based on active tab
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        if (activeTab === "dashboard") {
          const data = await apiFetch("/api/admin/stats");
          setStats(data);
        } else if (activeTab === "events") {
          const data = await apiFetch("/api/admin/events");
          setEvents(data.events);
        } else if (activeTab === "users") {
          const data = await apiFetch("/api/admin/users");
          setUsers(data.users);
        } else if (activeTab === "payouts") {
          const data = await apiFetch("/api/admin/payouts");
          setPayouts(data.payouts);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [activeTab]);

  const handleDeleteEvent = async (id) => {
    if (!confirm("Delete this event? This cannot be undone.")) return;
    try {
      await apiFetch(`/api/admin/events/${id}`, { method: "DELETE" });
      setEvents((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSuspendUser = async (id) => {
    try {
      const data = await apiFetch(`/api/admin/users/${id}/suspend`, { method: "PATCH" });
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, isSuspended: data.isSuspended } : u))
      );
    } catch (err) {
      alert(err.message);
    }
  };

  const handleMarkPaid = async (id) => {
    try {
      await apiFetch(`/api/admin/payouts/${id}/pay`, { method: "PATCH" });
      setPayouts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isPaid: true } : p))
      );
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-500 to-gray-900 flex">

      {/* Sidebar */}
      <div className="w-64 bg-white p-4 shadow-lg">
        <h2 className="text-xl font-bold text-orange-500 mb-6">Admin Panel</h2>
        <ul className="space-y-3">
          {["dashboard", "events", "users", "payouts"].map((tab) => (
            <li key={tab}>
              <button
                onClick={() => setActiveTab(tab)}
                className={`w-full text-left px-3 py-2 rounded-lg capitalize ${
                  activeTab === tab
                    ? "bg-orange-500 text-white"
                    : "hover:bg-gray-100"
                }`}
              >
                {tab}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 text-white overflow-auto">

        {error && (
          <div className="bg-red-100 text-red-600 px-4 py-2 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-white text-lg">Loading...</p>
          </div>
        ) : (
          <>
            {/* DASHBOARD */}
            {activeTab === "dashboard" && stats && (
              <>
                <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard title="Users" value={stats.totalUsers} />
                  <StatCard title="Events" value={stats.totalEvents} />
                  <StatCard title="Tickets Sold" value={stats.totalTickets} />
                  <StatCard
                    title="Revenue (KES)"
                    value={Number(stats.totalRevenue).toLocaleString()}
                  />
                </div>
              </>
            )}

            {/* EVENTS */}
            {activeTab === "events" && (
              <Section title="All Events">
                <table className="w-full text-left bg-white text-gray-800 rounded-xl overflow-hidden">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                    <tr>
                      <th className="p-3">Title</th>
                      <th className="p-3">Creator</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Price</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((e) => (
                      <tr key={e.id} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-semibold">{e.title}</td>
                        <td className="p-3 text-gray-600">{e.creator}</td>
                        <td className="p-3 text-gray-600">
                          {new Date(e.date).toLocaleDateString("en-KE")}
                        </td>
                        <td className="p-3 text-gray-600">
                          KES {Number(e.price).toLocaleString()}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            e.status === "Active"
                              ? "bg-green-100 text-green-600"
                              : e.status === "Sold Out"
                              ? "bg-red-100 text-red-600"
                              : "bg-gray-100 text-gray-500"
                          }`}>
                            {e.status}
                          </span>
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => handleDeleteEvent(e.id)}
                            className="text-red-500 hover:underline text-sm font-semibold"
                          >
                            Delete
                          </button>
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
                <table className="w-full bg-white text-gray-800 rounded-xl overflow-hidden">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                    <tr>
                      <th className="p-3 text-left">Name</th>
                      <th className="p-3 text-left">Email</th>
                      <th className="p-3 text-left">Role</th>
                      <th className="p-3 text-left">Joined</th>
                      <th className="p-3 text-left">Status</th>
                      <th className="p-3 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-semibold">{u.name}</td>
                        <td className="p-3 text-gray-600">{u.email}</td>
                        <td className="p-3">
                          <span className="bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded-full capitalize">
                            {u.role}
                          </span>
                        </td>
                        <td className="p-3 text-gray-500 text-sm">
                          {new Date(u.createdAt).toLocaleDateString("en-KE")}
                        </td>
                        <td className="p-3">
                          <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                            u.isSuspended
                              ? "bg-red-100 text-red-600"
                              : "bg-green-100 text-green-600"
                          }`}>
                            {u.isSuspended ? "Suspended" : "Active"}
                          </span>
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => handleSuspendUser(u.id)}
                            className={`text-sm font-semibold hover:underline ${
                              u.isSuspended ? "text-green-500" : "text-red-500"
                            }`}
                          >
                            {u.isSuspended ? "Unsuspend" : "Suspend"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Section>
            )}

            {/* PAYOUTS */}
            {activeTab === "payouts" && (
              <Section title="Payouts">
                <table className="w-full bg-white text-gray-800 rounded-xl overflow-hidden">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                    <tr>
                      <th className="p-3 text-left">Event</th>
                      <th className="p-3 text-left">Creator</th>
                      <th className="p-3 text-left">Revenue</th>
                      <th className="p-3 text-left">Commission (5%)</th>
                      <th className="p-3 text-left">Payable</th>
                      <th className="p-3 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payouts.map((p) => (
                      <tr key={p.id} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-semibold">{p.title}</td>
                        <td className="p-3 text-gray-600">
                          <p>{p.creator}</p>
                          <p className="text-xs text-gray-400">{p.creatorPhone}</p>
                        </td>
                        <td className="p-3">
                          KES {Number(p.totalRevenue).toLocaleString()}
                        </td>
                        <td className="p-3 text-red-500">
                          KES {Number(p.commission).toLocaleString()}
                        </td>
                        <td className="p-3 text-green-600 font-bold">
                          KES {Number(p.payable).toLocaleString()}
                        </td>
                        <td className="p-3">
                          {p.isPaid ? (
                            <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full font-semibold">
                              Paid
                            </span>
                          ) : (
                            <button
                              onClick={() => handleMarkPaid(p.id)}
                              className="bg-green-500 hover:bg-green-600 text-white text-sm px-3 py-1 rounded-lg transition"
                            >
                              Mark Paid
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Section>
            )}
          </>
        )}
      </div>
    </div>
  );
}

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