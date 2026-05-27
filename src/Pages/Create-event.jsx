// CreateEventPage.jsx
import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import api from "../Api/api";

export default function CreateEvent() {

  // Get logged in user
  const user = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : null;

  // Redirect if not logged in
  if (!user) {
    return <Navigate to="/login" />;
  }

  // Only organizers
  if (user.role !== "organizer") {
    return <Navigate to="/" />;
  }

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    county: "",
    location: "",
    date: "",
    time: "",
    price: "",
    total_tickets: "",
    organizer_name: "",
    contact_email: "",
    image: null,
  });

  const [imagePreview, setImagePreview] = useState("");

  const [error, setError] = useState(null);

  const [success, setSuccess] = useState(false);

  const [loading, setLoading] = useState(false);

  // Handle changes
  const handleChange = (e) => {

    const { name, value, files } = e.target;

    // Handle image upload
    if (name === "image") {

      const file = files[0];

      setFormData({
        ...formData,
        image: file,
      });

      // Preview image
      if (file) {
        setImagePreview(URL.createObjectURL(file));
      }

      return;
    }

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Submit
  const handleSubmit = async (e) => {

    e.preventDefault();

    setError(null);

    setSuccess(false);

    setLoading(true);

    try {

      // Use FormData for file upload
      const data = new FormData();

      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("category", formData.category);
      data.append("county", formData.county);
      data.append("location", formData.location);
      data.append("date", formData.date);
      data.append("time", formData.time);
      data.append("price", formData.price);
      data.append("total_tickets", formData.total_tickets);
      data.append("organizer_name", formData.organizer_name);
      data.append("contact_email", formData.contact_email);

      if (formData.image) {
        data.append("image", formData.image);
      }

      const res = await api.post(
        "/create_event/",
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log(res.data);

      setSuccess(true);

      // Redirect
      setTimeout(() => {
        navigate("/creator-dashboard");
      }, 2000);

    } catch (err) {

      console.log(err);

      setError(
        err.response?.data?.message ||
        "Failed to create event"
      );

    } finally {

      setLoading(false);

    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-500 to-gray-900 flex items-center justify-center py-10 px-4">

      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-8">

        {/* Title */}
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Create New Event
        </h2>

        {/* Error */}
        {error && (

          <div className="bg-red-100 text-red-600 text-sm px-4 py-2 rounded-lg mb-4">

            {error}

          </div>

        )}

        {/* Success */}
        {success && (

          <div className="bg-green-100 text-green-700 text-sm px-4 py-2 rounded-lg mb-4 text-center">

            Event created successfully! Redirecting...

          </div>

        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          {/* Title */}
          <div>

            <label className="block font-semibold text-gray-700 mb-1">
              Event Title
            </label>

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

          {/* Description */}
          <div>

            <label className="block font-semibold text-gray-700 mb-1">
              Description
            </label>

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

          {/* Category */}
          <div>

            <label className="block font-semibold text-gray-700 mb-1">
              Category
            </label>

            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              required
            >
              <option value="">Select category</option>

              <option value="Music">
                Music
              </option>

              <option value="Technology">
                Technology
              </option>

              <option value="Business">
                Business
              </option>

              <option value="Education">
                Education
              </option>

              <option value="Sports">
                Sports
              </option>

            </select>

          </div>

          {/* County */}
          <div>

            <label className="block font-semibold text-gray-700 mb-1">
              County
            </label>

            <select
              name="county"
              value={formData.county}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              required
            >
              <option value="">Select county</option>

              <option value="Nairobi">
                Nairobi
              </option>

              <option value="Mombasa">
                Mombasa
              </option>

              <option value="Kisumu">
                Kisumu
              </option>

              <option value="Meru">
                Meru
              </option>

              <option value="Kiambu">
                Kiambu
              </option>

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
              value={formData.location}
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
                value={formData.date}
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
                value={formData.time}
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
                value={formData.price}
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
                name="total_tickets"
                placeholder="e.g. 200"
                value={formData.total_tickets}
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
              name="organizer_name"
              placeholder="Organizer name"
              value={formData.organizer_name}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              required
            />

          </div>

          {/* Contact Email */}
          <div>

            <label className="block font-semibold text-gray-700 mb-1">
              Contact Email
            </label>

            <input
              type="email"
              name="contact_email"
              placeholder="Enter contact email"
              value={formData.contact_email}
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
              accept="image/*"
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              required
            />

          </div>

          {/* Preview */}
          {imagePreview && (
            <div>
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-60 object-cover rounded-xl border"
              />
            </div>
          )}

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition duration-300 mt-4 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading
              ? "Creating Event..."
              : "Create Event"}
          </button>

        </form>

      </div>

    </div>
  );
}