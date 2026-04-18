// Pages/EventDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { auth } from "../firebase/config";
import { useAuthContext } from "../context/AuthContext";

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuthContext();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Booking state
  const [quantity, setQuantity] = useState(1);
  const [phone, setPhone] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/events/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Event not found.");
        setEvent(data.event);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const handleBooking = async (e) => {
    e.preventDefault();
    setBookingError(null);

    if (!currentUser) {
      navigate("/login");
      return;
    }

    // Validate Kenyan phone number
    if (!phone.match(/^(\+254|0)[17]\d{8}$/)) {
      setBookingError("Enter a valid Kenyan phone number e.g. 0712345678");
      return;
    }

    setBookingLoading(true);

    try {
      const token = await auth.currentUser.getIdToken();

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/events/book`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          eventId: event.id,
          quantity,
          phoneNumber: phone,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Booking failed.");

      setBookingSuccess(true);

      // Update available tickets in UI
      setEvent((prev) => ({
        ...prev,
        availableTickets: prev.availableTickets - quantity,
      }));
    } catch (err) {
      setBookingError(err.message);
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <p className="text-gray-500 text-lg">Loading event...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <p className="text-red-500 text-lg">{error}</p>
    </div>
  );

  const isSoldOut = Number(event.availableTickets) === 0;
  const isPast = new Date(event.date) < new Date();
  const totalCost = Number(event.price) * quantity;

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Event Banner */}
      <div className="relative w-full h-72 md:h-96">
        <img
          src={event.image || "https://images.unsplash.com/photo-1507874457470-272b3c8d8ee2?w=800"}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6">
          <div>
            <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              {event.category}
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-white mt-2">
              {event.title}
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 grid md:grid-cols-3 gap-8">

        {/* Left — Event Details */}
        <div className="md:col-span-2 space-y-6">

          {/* Quick Info */}
          <div className="bg-white rounded-2xl shadow p-6 grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400 text-sm">Date</p>
              <p className="font-semibold text-gray-800">
                {new Date(event.date).toLocaleDateString("en-KE", {
                  weekday: "long", day: "numeric", month: "long", year: "numeric",
                })}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Time</p>
              <p className="font-semibold text-gray-800">{event.time}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Location</p>
              <p className="font-semibold text-gray-800">{event.location}, {event.county}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Organizer</p>
              <p className="font-semibold text-gray-800">{event.organizerName}</p>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-3">About this Event</h2>
            <p className="text-gray-600 leading-relaxed">{event.description}</p>
          </div>

          {/* Contact */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-3">Contact</h2>
            <p className="text-gray-600">{event.contactEmail}</p>
          </div>
        </div>

        {/* Right — Booking Card */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-2xl shadow p-6 sticky top-6">

            <p className="text-3xl font-bold text-orange-500">
              Ksh {Number(event.price).toLocaleString()}
            </p>
            <p className="text-sm text-gray-400 mt-1">per ticket</p>

            <div className="mt-4 flex justify-between text-sm text-gray-600">
              <span>Available tickets</span>
              <span className={`font-semibold ${isSoldOut ? "text-red-500" : "text-green-600"}`}>
                {isSoldOut ? "Sold Out" : event.availableTickets}
              </span>
            </div>

            <hr className="my-4" />

            {bookingSuccess ? (
              <div className="bg-green-100 text-green-700 text-sm px-4 py-3 rounded-lg text-center">
                ✅ Booking confirmed! <br />
                <span className="text-xs text-green-600">
                  Check your email for confirmation.
                </span>
                <button
                  onClick={() => navigate("/")}
                  className="block mt-3 w-full bg-orange-500 text-white py-2 rounded-lg font-semibold hover:bg-orange-600 transition"
                >
                  Browse More Events
                </button>
              </div>
            ) : isPast ? (
              <p className="text-center text-gray-400 font-semibold">This event has ended.</p>
            ) : isSoldOut ? (
              <p className="text-center text-red-500 font-semibold">Tickets are sold out.</p>
            ) : !showBookingForm ? (
              <button
                onClick={() => {
                  if (!currentUser) { navigate("/login"); return; }
                  setShowBookingForm(true);
                }}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition"
              >
                Book Now
              </button>
            ) : (
              <form onSubmit={handleBooking} className="space-y-4">

                {bookingError && (
                  <div className="bg-red-100 text-red-600 text-sm px-3 py-2 rounded-lg">
                    {bookingError}
                  </div>
                )}

                {/* Quantity */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-1 text-sm">
                    Number of Tickets
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 font-bold text-lg"
                    >
                      -
                    </button>
                    <span className="text-lg font-bold w-6 text-center">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.min(event.availableTickets, q + 1))}
                      className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 font-bold text-lg"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-1 text-sm">
                    M-Pesa Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 0712345678"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-sm"
                    required
                  />
                </div>

                {/* Total */}
                <div className="bg-orange-50 rounded-lg p-3 flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Total</span>
                  <span className="font-bold text-orange-500 text-lg">
                    KES {totalCost.toLocaleString()}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {bookingLoading ? "Processing..." : `Pay KES ${totalCost.toLocaleString()}`}
                </button>

                <button
                  type="button"
                  onClick={() => setShowBookingForm(false)}
                  className="w-full text-gray-400 hover:text-gray-600 text-sm"
                >
                  Cancel
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}