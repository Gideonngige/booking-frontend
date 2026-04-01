// CreateEventPage.jsx
import React, { useState } from "react";

export default function CreateEvent() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    date: "",
    time: "",
    price: "",
    tickets: "",
    organizer: "",
    email: "",
    image: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Event Data:", formData);

    // TODO: send to backend (API)
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-500 to-gray-900 flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-8">
        
        {/* Header */}
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Create New Event
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Title */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Event Title
            </label>
            <input
              type="text"
              name="title"
              placeholder="Enter event title"
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              placeholder="Describe your event"
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              rows="4"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Category
            </label>
            <select
              name="category"
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

          {/* Location */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              name="location"
              placeholder="Enter location"
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              required
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                name="date"
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Time
              </label>
              <input
                type="time"
                name="time"
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                required
              />
            </div>
          </div>

          {/* Price & Tickets */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Ticket Price (KES)
              </label>
              <input
                type="number"
                name="price"
                placeholder="e.g. 1000"
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Total Tickets
              </label>
              <input
                type="number"
                name="tickets"
                placeholder="e.g. 200"
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                required
              />
            </div>
          </div>

          {/* Organizer */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Organizer Name
            </label>
            <input
              type="text"
              name="organizer"
              placeholder="Organizer name"
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Contact Email
            </label>
            <input
              type="email"
              name="email"
              placeholder="Enter contact email"
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              required
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Event Image
            </label>
            <input
              type="file"
              name="image"
              onChange={handleChange}
              className="w-full"
              accept="image/*"
              required
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition duration-300 mt-4"
          >
            Create Event
          </button>
        </form>
      </div>
    </div>
  );
}