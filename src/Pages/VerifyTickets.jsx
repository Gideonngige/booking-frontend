// Pages/VerifyTickets.jsx

import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Html5QrcodeScanner } from "html5-qrcode";
import { FaTicketAlt, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { MdWarning } from "react-icons/md";
import api from "../Api/api";

export default function VerifyTickets() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [scanResult, setScanResult] = useState(null);
  const [scanStatus, setScanStatus] = useState(null);

  const [scanning, setScanning] = useState(false);

  const [manualId, setManualId] = useState("");
  const [manualLoading, setManualLoading] = useState(false);

  const scannerRef = useRef(null);

  const savedUser = JSON.parse(localStorage.getItem("user") || "{}");

  // Fetch event + bookings
  const fetchBookings = async () => {
    try {
      setLoading(true);

      const response = await api.post("/api/events/organizer/", {
        event_id: eventId,
        user_id: savedUser.user_id,
      });

      setEvent(response.data.event);
      setBookings(response.data.bookings);
      setStats(response.data.stats);

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Failed to load event data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [eventId]);

  // Start QR Scanner
  const startScanner = () => {
    setScanning(true);

    setTimeout(() => {
      scannerRef.current = new Html5QrcodeScanner(
        "qr-reader",
        {
          fps: 10,
          qrbox: {
            width: 250,
            height: 250,
          },
        }
      );

      scannerRef.current.render(
        async (decodedText) => {
          scannerRef.current.clear();
          setScanning(false);

          await verifyQRCode(decodedText);
        },
        () => {}
      );
    }, 100);
  };

  // Stop Scanner
  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
    }

    setScanning(false);
  };

  // Verify QR
  const verifyQRCode = async (rawData) => {
    try {
      let bookingId;

      try {
        const parsed = JSON.parse(rawData);
        bookingId = parsed.bookingId;
      } catch {
        bookingId = rawData.trim();
      }

      if (!bookingId) {
        setScanStatus("error");
        setScanResult({
          message: "Invalid QR Code.",
        });

        return;
      }

      const response = await api.post("/api/events/verify/", {
        booking_id: bookingId,
        event_id: eventId,
        user_id: savedUser.user_id,
      });

      const data = response.data;

      if (data.valid) {
        setScanStatus("success");
      } else if (data.booking?.status === "used") {
        setScanStatus("warning");
      } else {
        setScanStatus("error");
      }

      setScanResult(data);

      fetchBookings();

    } catch (err) {
      setScanStatus("error");

      setScanResult({
        message:
          err.response?.data?.message ||
          "Verification failed.",
      });
    }
  };

  // Manual verify
  const handleManualVerify = async (e) => {
    e.preventDefault();

    if (!manualId.trim()) return;

    setManualLoading(true);

    await verifyQRCode(manualId);

    setManualId("");

    setManualLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-500">
          Loading event data...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-red-500 text-lg">
            {error}
          </p>

          <button
            onClick={() => navigate("/creator-dashboard")}
            className="mt-4 text-orange-500 hover:underline"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-orange-500 to-gray-900">

      {/* Header */}
      <div className="text-white px-6 py-8">
        <button
          onClick={() => navigate("/creator-dashboard")}
          className="text-orange-100 hover:text-white text-sm mb-2"
        >
          ← Back to Dashboard
        </button>

        <h1 className="text-3xl font-bold">
          Verify Tickets
        </h1>

        {event && (
          <p className="text-orange-100 mt-2">
            {event.title}
          </p>
        )}
      </div>

      <div className="px-4 pb-8 space-y-6">

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

            <StatCard
              title="Total"
              value={stats.total}
            />

            <StatCard
              title="Confirmed"
              value={stats.confirmed}
            />

            <StatCard
              title="Used"
              value={stats.used}
            />

            <StatCard
              title="Cancelled"
              value={stats.cancelled}
            />
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">

          {/* Scanner */}
          <div className="bg-white rounded-2xl shadow p-6">

            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Scan Ticket
            </h2>

            {!scanning ? (
              <button
                onClick={startScanner}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg"
              >
                Start Scanner
              </button>
            ) : (
              <>
                <div
                  id="qr-reader"
                  className="rounded-lg overflow-hidden"
                />

                <button
                  onClick={stopScanner}
                  className="w-full mt-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 rounded-lg"
                >
                  Stop Scanner
                </button>
              </>
            )}

            {/* Manual verify */}
            <div className="border-t mt-6 pt-6">

              <p className="text-sm text-gray-500 mb-2">
                Verify manually
              </p>

              <form
                onSubmit={handleManualVerify}
                className="flex gap-2"
              >

                <input
                  type="text"
                  value={manualId}
                  onChange={(e) =>
                    setManualId(e.target.value)
                  }
                  placeholder="Enter booking ID"
                  className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                />

                <button
                  type="submit"
                  disabled={manualLoading}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 rounded-lg"
                >
                  {manualLoading ? "..." : "Verify"}
                </button>

              </form>
            </div>
          </div>

          {/* Result */}
          <div className="bg-white rounded-2xl shadow p-6">

            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Verification Result
            </h2>

            {!scanResult ? (
              <div className="text-center py-10 text-gray-400">

                <FaTicketAlt className="mx-auto text-5xl mb-3" />

                <p>
                  Scan ticket to verify
                </p>
              </div>
            ) : (
              <div
                className={`rounded-xl p-4 ${
                  scanStatus === "success"
                    ? "bg-green-50 border border-green-400"
                    : scanStatus === "warning"
                    ? "bg-yellow-50 border border-yellow-400"
                    : "bg-red-50 border border-red-400"
                }`}
              >

                <div className="flex justify-center mb-3">

                  {scanStatus === "success" && (
                    <FaCheckCircle className="text-green-500 text-5xl" />
                  )}

                  {scanStatus === "warning" && (
                    <MdWarning className="text-yellow-500 text-5xl" />
                  )}

                  {scanStatus === "error" && (
                    <FaTimesCircle className="text-red-500 text-5xl" />
                  )}

                </div>

                <p className="text-center font-bold text-lg mb-4">
                  {scanResult.message}
                </p>

                {scanResult.booking && (
                  <div className="space-y-2 text-sm">

                    <Row
                      label="Name"
                      value={scanResult.booking.guest_name}
                    />

                    <Row
                      label="Email"
                      value={scanResult.booking.guest_email}
                    />

                    <Row
                      label="Phone"
                      value={scanResult.booking.phone_number}
                    />

                    <Row
                      label="Tickets"
                      value={scanResult.booking.quantity}
                    />

                    <Row
                      label="Amount"
                      value={`KES ${Number(
                        scanResult.booking.total_amount
                      ).toLocaleString()}`}
                    />

                    <Row
                      label="Status"
                      value={scanResult.booking.status}
                    />
                  </div>
                )}

                <button
                  onClick={() => {
                    setScanResult(null);
                    setScanStatus(null);
                  }}
                  className="w-full mt-5 bg-white border border-gray-200 hover:bg-gray-50 py-2 rounded-lg font-semibold"
                >
                  Scan Next Ticket
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bookings */}
        <div className="bg-white rounded-2xl shadow overflow-hidden">

          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-bold text-gray-800">
              Attendance List
            </h2>
          </div>

          <div className="overflow-x-auto">

            <table className="w-full text-sm">

              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">

                <tr>
                  <th className="px-6 py-3 text-left">
                    Name
                  </th>

                  <th className="px-6 py-3 text-left">
                    Contact
                  </th>

                  <th className="px-6 py-3 text-left">
                    Tickets
                  </th>

                  <th className="px-6 py-3 text-left">
                    Amount
                  </th>

                  <th className="px-6 py-3 text-left">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y">

                {bookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="hover:bg-gray-50"
                  >

                    <td className="px-6 py-4 font-semibold">
                      {booking.guest_name}
                    </td>

                    <td className="px-6 py-4 text-gray-500">
                      <p>{booking.guest_email}</p>
                      <p>{booking.phone_number}</p>
                    </td>

                    <td className="px-6 py-4">
                      {booking.quantity}
                    </td>

                    <td className="px-6 py-4 text-orange-500 font-semibold">
                      KES{" "}
                      {Number(
                        booking.total_amount
                      ).toLocaleString()}
                    </td>

                    <td className="px-6 py-4">

                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          booking.status === "used"
                            ? "bg-green-100 text-green-600"
                            : booking.status === "confirmed"
                            ? "bg-blue-100 text-blue-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {booking.status}
                      </span>

                    </td>
                  </tr>
                ))}

              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="bg-white rounded-xl shadow p-4 text-center">
      <p className="text-gray-400 text-sm">
        {title}
      </p>

      <p className="text-2xl font-bold text-orange-500 mt-1">
        {value}
      </p>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">
        {label}
      </span>

      <span className="font-semibold">
        {value}
      </span>
    </div>
  );
}