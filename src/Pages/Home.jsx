import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config/env';

function Home() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    county: "",
    category: "",
    minPrice: "",
    maxPrice: "",
    date: "",
  });

  const navigate = useNavigate();

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      // Build query string from filters — only include non-empty values
      const params = new URLSearchParams();
      if (filters.search) params.append("search", filters.search);
      if (filters.county) params.append("county", filters.county);
      if (filters.category) params.append("category", filters.category);
      if (filters.minPrice) params.append("minPrice", filters.minPrice);
      if (filters.maxPrice) params.append("maxPrice", filters.maxPrice);
      if (filters.date) params.append("date", filters.date);

      const res = await fetch(
        `${API_URL}/get_all_events?${params.toString()}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch events.");
      setEvents(data.events);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch on first load
  useEffect(() => {
    fetchEvents();
  }, []);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = () => {
    fetchEvents();
  };

  const handleClearFilters = () => {
    setFilters({ search: "", county: "", category: "", minPrice: "", maxPrice: "", date: "" });
    // Fetch all events after clearing
    setTimeout(fetchEvents, 0);
  };

  const Filters = () => (
  <div className="bg-white shadow-lg rounded-2xl p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">

    <input
      className="border p-2 rounded w-full text-sm"
      placeholder="Event Name"
      name="search"
      value={filters.search}
      onChange={handleFilterChange}
    />

    <input
      className="border p-2 rounded w-full text-sm"
      placeholder="County"
      name="county"
      value={filters.county}
      onChange={handleFilterChange}
    />

    <select
      className="border p-2 rounded w-full text-sm text-gray-600"
      name="category"
      value={filters.category}
      onChange={handleFilterChange}
    >
      <option value="">All Types</option>
      <option value="Music">Music</option>
      <option value="Technology">Technology</option>
      <option value="Business">Business</option>
      <option value="Education">Education</option>
      <option value="Sports">Sports</option>
    </select>

    <input
      className="border p-2 rounded w-full text-sm"
      placeholder="Min Price"
      name="minPrice"
      type="number"
      value={filters.minPrice}
      onChange={handleFilterChange}
    />

    <input
      className="border p-2 rounded w-full text-sm"
      placeholder="Max Price"
      name="maxPrice"
      type="number"
      value={filters.maxPrice}
      onChange={handleFilterChange}
    />

    <input
      type="date"
      className="border p-2 rounded w-full text-sm text-gray-600"
      name="date"
      value={filters.date}
      onChange={handleFilterChange}
    />

    {/* Buttons span both columns on mobile */}
    <div className="col-span-2 md:col-span-1 flex gap-2">
      <button
        onClick={handleSearch}
        className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded transition text-sm"
      >
        Search
      </button>
      <button
        onClick={handleClearFilters}
        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 rounded transition text-sm"
      >
        Clear
      </button>
    </div>
  </div>
);


const shareEvent = async (eventId, eventTitle) => {
  const shareUrl = `${window.location.origin}/events/${eventId}`;

  try {
    if (navigator.share) {
      await navigator.share({
        title: eventTitle,
        text: `Check out this event: ${eventTitle}`,
        url: shareUrl,
      });
    } else {
      await navigator.clipboard.writeText(shareUrl);
      alert("Event link copied to clipboard!");
    }
  } catch (error) {
    console.log(error);
  }
};

  // EVENT CARD
  const EventCard = ({ event }) => (
  <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:scale-105 transition cursor-pointer">

    <div
      onClick={() => navigate(`/events/${event.id}`)}
      className="cursor-pointer"
    >
      <img
        src={
          event.image ||
          "https://images.unsplash.com/photo-1507874457470-272b3c8d8ee2?w=800"
        }
        alt={event.title}
        className="w-full h-40 object-cover"
      />

      <div className="p-4">
        <span className="text-xs bg-orange-100 text-orange-500 font-semibold px-2 py-1 rounded-full">
          {event.category}
        </span>

        <h3 className="font-bold text-lg mt-2">
          {event.title}
        </h3>

        <p className="text-sm text-gray-500">
          📍 {event.location}, {event.county}
        </p>

        <p className="text-sm text-gray-500">
          📅{" "}
          {new Date(event.date).toLocaleDateString(
            "en-KE",
            {
              day: "numeric",
              month: "short",
              year: "numeric",
            }
          )}
        </p>

        <div className="flex justify-between items-center mt-3">
          <p className="font-semibold text-orange-500">
            Ksh {Number(event.price).toLocaleString()}
          </p>

          <span className="text-xs text-gray-400">
            {event.available_tickets} tickets left
          </span>
        </div>
      </div>
    </div>

    {/* Share Button */}
    <div className="px-4 pb-4">
      <button
        onClick={(e) => {
          e.stopPropagation();
          shareEvent(event.id, event.title);
        }}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg text-sm font-semibold"
      >
        Share Event
      </button>
    </div>

  </div>
);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">

      {/* HERO */}
      <div className="bg-gradient-to-r from-orange-500 to-gray-900 text-white p-10 text-center">
        <h1 className="text-4xl font-bold">Discover Amazing Events</h1>
        <p className="mt-2 text-orange-100">Find, book and enjoy events near you</p>
      </div>

      {/* FILTERS */}
      <div className="p-6 -mt-10">
        <Filters />
      </div>

      {/* EVENTS GRID */}
      {loading ? (
        <div className="text-center py-20 text-gray-500">Loading events...</div>
      ) : error ? (
        <div className="text-center py-20 text-red-500">{error}</div>
      ) : events.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg">No events found.</p>
          <button
            onClick={handleClearFilters}
            className="mt-3 text-orange-500 hover:underline font-semibold"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;