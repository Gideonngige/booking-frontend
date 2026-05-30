// Pages/EventDetail.jsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import QRCode from "qrcode";
import api from "../Api/api";

function QRCodeImage({ bookingResult }) {
  const [qrSrc, setQrSrc] = useState("");

  useEffect(() => {
    const generateQR = async () => {
      try {
        const booking = bookingResult?.booking || {};
        const event = bookingResult?.event || {};
        
        const qrText = `
Booking ID: ${booking.id || ""}
Event: ${event.title || ""}
Guest: ${booking.guest_name || booking.guestName || ""}
Tickets: ${booking.quantity || ""}
Amount: KES ${booking.total_amount || booking.totalAmount || ""}
`;

        const qr = await QRCode.toDataURL(qrText.trim());
        setQrSrc(qr);
      } catch (err) {
        console.error("QR generation failed:", err);
      }
    };

    if (bookingResult) {
      generateQR();
    }
  }, [bookingResult]);

  return (
    <img
      src={qrSrc}
      alt="QR Code"
      className="w-48 h-48 border-4 border-orange-500 rounded-xl mx-auto"
    />
  );
}

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const savedUser = JSON.parse(localStorage.getItem("user") || "null");
  const isLoggedIn = !!savedUser;

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [quantity, setQuantity] = useState(1);
  const [phone, setPhone] = useState(isLoggedIn ? savedUser.phone_number || "" : "");
  const [guestName, setGuestName] = useState(isLoggedIn ? savedUser.name || "" : "");
  const [guestEmail, setGuestEmail] = useState(isLoggedIn ? savedUser.email || "" : "");

  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  const [bookingResult, setBookingResult] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("idle"); // idle, pending, paid, failed

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await api.get(`/api/events/${id}`);
        setEvent(res.data.event);
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Failed to load event.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const pollPaymentStatus = (bookingId) => {
    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/api/events/bookings/${bookingId}/status/`);

        if (res.data.payment_status === "paid") {
          setPaymentStatus("paid");
          setBookingResult((prev) => {
            if (!prev) return null;
            return {
              ...prev,
              booking: {
                ...prev.booking,
                payment_status: "paid",
              },
            };
          });
          clearInterval(interval);
        }

        if (res.data.payment_status === "failed") {
          setPaymentStatus("failed");
          clearInterval(interval);
        }
      } catch (error) {
        console.error("Polling error:", error);
      }
    }, 5000);

    // Timeout polling after 5 minutes
    setTimeout(() => {
      clearInterval(interval);
    }, 300000);
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    setBookingError(null);

    if (!phone.match(/^(\+254|0)[17]\d{8}$/)) {
      setBookingError("Enter a valid Kenyan phone number e.g. 0712345678");
      return;
    }

    setBookingLoading(true);

    try {
      const res = await api.post("/api/events/book/", {
        userId: isLoggedIn ? savedUser.id : null,
        eventId: event.id,
        quantity,
        phoneNumber: phone,
        guestName,
        guestEmail,
      });

      setBookingResult(res.data);
      setPaymentStatus("pending");
      pollPaymentStatus(res.data.booking.id);

      setEvent((prev) => ({
        ...prev,
        availableTickets: Number(prev.availableTickets) - Number(quantity),
      }));
    } catch (err) {
      setBookingError(err.response?.data?.message || err.message || "Booking failed.");
    } finally {
      setBookingLoading(false);
    }
  };

  const handleDownloadQR = async () => {
    try {
      const booking = bookingResult.booking;
      const qrText = `
Booking ID: ${booking.id}
Event: ${bookingResult.event.title}
Guest: ${booking.guest_name || booking.guestName}
Tickets: ${booking.quantity}
Amount: KES ${booking.total_amount || booking.totalAmount}
`;

      const qrImage = await QRCode.toDataURL(qrText.trim());
      const link = document.createElement("a");
      link.href = qrImage;
      link.download = `ticket-${booking.id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("QR generation failed:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading event...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

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
        {/* Left Side Content */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow p-6 grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400 text-sm">Date</p>
              <p className="font-semibold">
                {new Date(event.date).toLocaleDateString("en-KE", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
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

        {/* Right Side Sidebar */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-2xl shadow p-6 sticky top-6">
            
            {/* 1. STATE: PAYMENT IS PENDING (WAITING FOR USER IN-INPUT PIN) */}
            {bookingResult && paymentStatus === "pending" && (
              <div className="text-center space-y-4">
                <div className="text-5xl animate-pulse">📱</div>
                <h3 className="text-xl font-bold text-gray-800">Waiting for Payment</h3>
                <p className="text-gray-500 text-sm">An M-Pesa prompt has been sent to:</p>
                <p className="font-bold text-orange-500">{phone}</p>
                <p className="text-xs text-gray-400">Enter your M-Pesa PIN to complete booking.</p>
                <div className="animate-spin h-10 w-10 border-4 border-orange-500 border-t-transparent rounded-full mx-auto"></div>
              </div>
            )}

            {/* 2. STATE: PAYMENT IS COMPLETED successfully (SHOW QR CODE) */}
            {bookingResult && paymentStatus === "paid" && (
              <div className="text-center space-y-4">
                <div className="text-4xl">🎉</div>
                <h3 className="text-lg font-bold text-green-600">Payment Successful!</h3>
                <p className="text-sm text-gray-500">
                  {bookingResult.booking.guestName || bookingResult.booking.guest_name} —{" "}
                  {bookingResult.booking.quantity} ticket(s)
                </p>

                <div className="flex justify-center my-2">
                  <QRCodeImage bookingResult={bookingResult} />
                </div>

                <p className="text-xs text-gray-400">Show this QR code at the entrance</p>

                <button
                  onClick={handleDownloadQR}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition"
                >
                  Download Ticket
                </button>

                <div className="bg-gray-50 rounded-lg p-3 text-left text-sm space-y-1">
                  <p>
                    <span className="text-gray-400">Event:</span>{" "}
                    <span className="font-semibold">{bookingResult.event.title}</span>
                  </p>
                  <p>
                    <span className="text-gray-400">Date:</span>{" "}
                    {new Date(bookingResult.event.date).toLocaleDateString("en-KE")}
                  </p>
                  <p>
                    <span className="text-gray-400">Total Paid:</span>{" "}
                    <span className="text-orange-500 font-bold">
                      KES {Number(bookingResult.booking.totalAmount || bookingResult.booking.total_amount).toLocaleString()}
                    </span>
                  </p>
                </div>
              </div>
            )}

            {/* 3. STATE: PAYMENT FAILED */}
            {bookingResult && paymentStatus === "failed" && (
              <div className="text-center space-y-4">
                <div className="text-5xl">❌</div>
                <h3 className="text-xl font-bold text-red-500">Payment Failed</h3>
                <p className="text-sm text-gray-500">Your M-Pesa payment was not completed.</p>
                <button
                  onClick={() => {
                    setBookingResult(null);
                    setPaymentStatus("idle");
                  }}
                  className="w-full bg-orange-500 text-white font-bold py-2 rounded-lg hover:bg-orange-600"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* 4. DEFAULT VIEWS: BEFORE SUBMITTING BOOKING */}
            {!bookingResult && (
              <>
                {isPast ? (
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
                      <span className="text-green-600 font-semibold">
                        {event.availableTickets} tickets
                      </span>
                    </div>
                    <hr />
                    <button
                      onClick={() => setShowBookingForm(true)}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition"
                    >
                      Book Now
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleBooking} className="space-y-3">
                    <h3 className="font-bold text-gray-800 text-lg">Book Tickets</h3>
                    {bookingError && (
                      <div className="bg-red-100 text-red-600 text-sm px-3 py-2 rounded-lg">
                        {bookingError}
                      </div>
                    )}

                    {/* Name */}
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

                    {/* Email */}
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

                    {/* Quantity */}
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1 text-sm">Tickets</label>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                          className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 font-bold"
                        >
                          -
                        </button>
                        <span className="text-lg font-bold w-6 text-center">{quantity}</span>
                        <button
                          type="button"
                          onClick={() => setQuantity((q) => Math.min(event.availableTickets, q + 1))}
                          className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 font-bold"
                        >
                          +
                        </button>
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
                      {bookingLoading
                        ? "Processing..."
                        : `Confirm Booking — KES ${totalCost.toLocaleString()}`}
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowBookingForm(false)}
                      className="w-full text-gray-400 hover:text-gray-600 text-sm text-center block pt-1"
                    >
                      Cancel
                    </button>
                  </form>
                )}
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}