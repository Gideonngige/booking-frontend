// CreateEventPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase/config";
import { useAuthContext } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

export default function CreateEvent() {
  const { currentUser } = useAuthContext();
  if (!currentUser) return <Navigate to="/login" />;
  const [formData, setFormData] = useState({
    userId: "",
    title: "",
    description: "",
    category: "",
    county: "",
    location: "",
    date: "",
    time: "",
    price: "",
    tickets: "",
    organizer: "",
    email: "",
    image: null,
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Step 1: Get Firebase token
      const token = await auth.currentUser.getIdToken();
      const userId = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")).id : null;
      if (!userId) throw new Error("User ID not found. Please log in again.");

      // Step 2: Build FormData (needed for image file upload)
      const data = new FormData();
      data.append("userId", userId);
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("category", formData.category);
      data.append("county", formData.county);
      data.append("location", formData.location);
      data.append("date", formData.date);
      data.append("time", formData.time);
      data.append("price", formData.price);
      data.append("tickets", formData.tickets);
      data.append("organizer", formData.organizer);
      data.append("email", formData.email);
      if (formData.image) data.append("image", formData.image);

      // Step 3: Send to backend
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/events`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to create event.");

      setSuccess(true);
      setTimeout(() => navigate("/creator-dashboard"), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-500 to-gray-900 flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-8">

        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Create New Event
        </h2>

        {error && (
          <div className="bg-red-100 text-red-600 text-sm px-4 py-2 rounded-lg mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 text-green-700 text-sm px-4 py-2 rounded-lg mb-4 text-center">
            Event created successfully! Redirecting...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Event Title</label>
            <input
              type="text"
              name="title"
              placeholder="Enter event title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              placeholder="Describe your event"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              rows="4"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              required
            >
              <option value="">Select category</option>
              <option>Music</option>
              <option>Technology</option>
              <option>Business</option>
              <option>Education</option>
              <option>Sports</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">County</label>
            <select
              name="county"
              value={formData.county}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              required
            >
              <option value="">Select county</option>
              <option>Mombasa</option>
              <option>Nairobi</option>
              <option>Kisumu</option>
              <option>Meru</option>
              <option>Kiambu</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Location</label>
            <input
              type="text"
              name="location"
              placeholder="Enter location"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Time</label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Ticket Price (KES)</label>
              <input
                type="number"
                name="price"
                placeholder="e.g. 1000"
                value={formData.price}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Total Tickets</label>
              <input
                type="number"
                name="tickets"
                placeholder="e.g. 200"
                value={formData.tickets}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Organizer Name</label>
            <input
              type="text"
              name="organizer"
              placeholder="Organizer name"
              value={formData.organizer}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Contact Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter contact email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Event Image</label>
            <input
              type="file"
              name="image"
              onChange={handleChange}
              className="w-full"
              accept="image/*"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition duration-300 mt-4 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Creating Event..." : "Create Event"}
          </button>
        </form>
      </div>
    </div>
  );
}