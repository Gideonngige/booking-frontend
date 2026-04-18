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

  const [quantity, setQuantity] = useState(1);
  const [phone, setPhone] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  const [bookingResult, setBookingResult] = useState(null); // holds booking + qr
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

    if (!phone.match(/^(\+254|0)[17]\d{8}$/)) {
      setBookingError("Enter a valid Kenyan phone number e.g. 0712345678");
      return;
    }

    setBookingLoading(true);

    try {
      // Attach token only if logged in
      const headers = { "Content-Type": "application/json" };
      if (currentUser) {
        const token = await auth.currentUser.getIdToken();
        headers.Authorization = `Bearer ${token}`;
      }

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/events/book`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          userId: currentUser ? JSON.parse(localStorage.getItem("user")).id : null,
          eventId: event.id,
          quantity,
          phoneNumber: phone,
          guestName: currentUser ? null : guestName,
          guestEmail: currentUser ? null : guestEmail,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Booking failed.");

      setBookingResult(data);
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

  const handleDownloadQR = () => {
    const link = document.createElement("a");
    link.href = bookingResult.booking.qrCode;
    link.download = `ticket-${bookingResult.booking.id}.png`;
    link.click();
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Loading event...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-red-500">{error}</p>
    </div>
  );

  const isSoldOut = Number(event.availableTickets) === 0;
  const isPast = new Date(event.date) < new Date();
  const totalCost = Number(event.price) * quantity;

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Banner */}
      <div className="relative w-full h-72 md:h-96">
        <img
          src={event.image || "https://images.unsplash.com/photo-1507874457470-272b3c8d8ee2?w=800"}
          alt={event.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = "https://images.unsplash.com/photo-1507874457470-272b3c8d8ee2?w=800";
          }}
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6">
          <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
            {event.category}
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-white mt-2">{event.title}</h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 grid md:grid-cols-3 gap-8">

        {/* Left — Details */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow p-6 grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400 text-sm">Date</p>
              <p className="font-semibold">{new Date(event.date).toLocaleDateString("en-KE", {
                weekday: "long", day: "numeric", month: "long", year: "numeric",
              })}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Time</p>
              <p className="font-semibold">{event.time}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Location</p>
              <p className="font-semibold">{event.location}, {event.county}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Organizer</p>
              <p className="font-semibold">{event.organizerName}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-3">About this Event</h2>
            <p className="text-gray-600 leading-relaxed">{event.description}</p>
          </div>
        </div>

        {/* Right — Booking Card */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-2xl shadow p-6 sticky top-6">

            {/* Success — show QR */}
            {bookingResult ? (
              <div className="text-center space-y-4">
                <div className="text-4xl">🎉</div>
                <h3 className="text-lg font-bold text-gray-800">Booking Confirmed!</h3>
                <p className="text-sm text-gray-500">
                  {bookingResult.booking.guestName || "Your ticket"} — {bookingResult.booking.quantity} ticket(s)
                </p>

                {/* QR Code */}
                <div className="flex justify-center">
                  <img
                    src={bookingResult.booking.qrCode}
                    alt="QR Code"
                    className="w-48 h-48 border-4 border-orange-500 rounded-xl"
                  />
                </div>

                <p className="text-xs text-gray-400">
                  Show this QR code at the entrance
                </p>

                <button
                  onClick={handleDownloadQR}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition"
                >
                  Download Ticket
                </button>

                <div className="bg-gray-50 rounded-lg p-3 text-left text-sm space-y-1">
                  <p><span className="text-gray-400">Event:</span> <span className="font-semibold">{bookingResult.event.title}</span></p>
                  <p><span className="text-gray-400">Date:</span> {new Date(bookingResult.event.date).toLocaleDateString("en-KE")}</p>
                  <p><span className="text-gray-400">Total Paid:</span> <span className="text-orange-500 font-bold">KES {Number(bookingResult.booking.totalAmount).toLocaleString()}</span></p>
                </div>
              </div>

            ) : isPast ? (
              <p className="text-center text-gray-400 font-semibold">This event has ended.</p>

            ) : isSoldOut ? (
              <p className="text-center text-red-500 font-semibold">Tickets are sold out.</p>

            ) : !showBookingForm ? (
              <div className="space-y-3">
                <p className="text-3xl font-bold text-orange-500">
                  Ksh {Number(event.price).toLocaleString()}
                </p>
                <p className="text-sm text-gray-400">per ticket</p>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Available</span>
                  <span className="text-green-600 font-semibold">{event.availableTickets} tickets</span>
                </div>
                <hr />
                <button
                  onClick={() => setShowBookingForm(true)}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition"
                >
                  Book Now
                </button>
                <p className="text-center text-xs text-gray-400">
                  Already have an account?{" "}
                  <span
                    onClick={() => navigate("/login")}
                    className="text-orange-500 cursor-pointer hover:underline"
                  >
                    Login
                  </span>
                </p>
              </div>

            ) : (
              <form onSubmit={handleBooking} className="space-y-3">
                <h3 className="font-bold text-gray-800 text-lg">Book Tickets</h3>

                {bookingError && (
                  <div className="bg-red-100 text-red-600 text-sm px-3 py-2 rounded-lg">
                    {bookingError}
                  </div>
                )}

                {/* Guest fields — only shown if not logged in */}
                {!currentUser && (
                  <>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1 text-sm">Full Name</label>
                      <input
                        type="text"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        placeholder="Your full name"
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1 text-sm">Email</label>
                      <input
                        type="email"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-sm"
                        required
                      />
                    </div>
                  </>
                )}

                {/* Quantity */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-1 text-sm">Tickets</label>
                  <div className="flex items-center gap-3">
                    <button type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 font-bold"
                    >-</button>
                    <span className="text-lg font-bold w-6 text-center">{quantity}</span>
                    <button type="button"
                      onClick={() => setQuantity((q) => Math.min(event.availableTickets, q + 1))}
                      className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 font-bold"
                    >+</button>
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-1 text-sm">M-Pesa Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0712345678"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-sm"
                    required
                  />
                </div>

                {/* Total */}
                <div className="bg-orange-50 rounded-lg p-3 flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Total</span>
                  <span className="font-bold text-orange-500">KES {totalCost.toLocaleString()}</span>
                </div>

                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {bookingLoading ? "Processing..." : `Confirm Booking — KES ${totalCost.toLocaleString()}`}
                </button>

                <button type="button"
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