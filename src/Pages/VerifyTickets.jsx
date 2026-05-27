// Pages/VerifyTickets.jsx
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Html5QrcodeScanner } from "html5-qrcode";
import { FaTicketAlt } from "react-icons/fa";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { MdWarning } from "react-icons/md";
import { MdQrCodeScanner } from "react-icons/md";

export default function VerifyTickets() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [scanResult, setScanResult] = useState(null); // last scan result
  const [scanStatus, setScanStatus] = useState(null); // "success" | "error" | "warning"
  const [scanning, setScanning] = useState(false);
  const [manualId, setManualId] = useState("");
  const [manualLoading, setManualLoading] = useState(false);

  const scannerRef = useRef(null);

  // Fetch event bookings and stats
  const fetchBookings = async () => {
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/events/organizer`,
        { 
            headers: { 
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ eventId: eventId, userId: JSON.parse(localStorage.getItem("user")).id }),
            method: "POST",
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setEvent(data.event);
      setBookings(data.bookings);
      setStats(data.stats);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [eventId]);

  // Start QR scanner
  const startScanner = () => {
    setScanning(true);
    setScanResult(null);

    setTimeout(() => {
      scannerRef.current = new Html5QrcodeScanner("qr-reader", {
        fps: 10,
        qrbox: { width: 250, height: 250 },
      });

      scannerRef.current.render(
        async (decodedText) => {
          // Stop scanner after successful scan
          scannerRef.current.clear();
          setScanning(false);
          await verifyQRCode(decodedText);
        },
        (err) => {
          // Scanning errors are normal — ignore them
        }
      );
    }, 100);
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
    }
    setScanning(false);
  };

  // Verify ticket from QR data or manual input
  const verifyQRCode = async (rawData) => {
    try {
      let bookingId;

      // QR code contains JSON — parse it
      try {
        const parsed = JSON.parse(rawData);
        bookingId = parsed.bookingId;
      } catch {
        // If not JSON, treat the raw string as bookingId directly
        bookingId = rawData.trim();
      }

      if (!bookingId) {
        setScanStatus("error");
        setScanResult({ message: "Invalid QR code format." });
        return;
      }

      const token = await auth.currentUser.getIdToken();
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/events/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bookingId, eventId, userId: JSON.parse(localStorage.getItem("user")).id }),
      });

      const data = await res.json();

      if (data.valid) {
        setScanStatus("success");
      } else if (data.booking?.status === "used") {
        setScanStatus("warning");
      } else {
        setScanStatus("error");
      }

      setScanResult(data);

      // Refresh stats after verification
      fetchBookings();
    } catch (err) {
      setScanStatus("error");
      setScanResult({ message: "Verification failed. Try again." });
    }
  };

  const handleManualVerify = async (e) => {
    e.preventDefault();
    if (!manualId.trim()) return;
    setManualLoading(true);
    await verifyQRCode(manualId.trim());
    setManualId("");
    setManualLoading(false);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <p className="text-gray-500">Loading event data...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <p className="text-red-500 text-lg">{error}</p>
        <button onClick={() => navigate("/creator-dashboard")}
          className="mt-4 text-orange-500 hover:underline">
          Back to Dashboard
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-r from-orange-500  to-gray-900">

      {/* Header */}
      <div className="text-white px-6 py-8">
        <button onClick={() => navigate("/creator-dashboard")}
          className="text-orange-100 hover:text-white text-sm mb-2 flex items-center gap-1">
          Back to Dashboard
        </button>
        <h1 className="text-2xl font-bold">Ticket Verification</h1>
        {event && (
          <p className="text-orange-100 text-sm mt-1">
            {event.title} — {new Date(event.date).toLocaleDateString("en-KE", {
              weekday: "long", day: "numeric", month: "long",
            })} at {event.time}
          </p>
        )}
      </div>

      <div className="mx-auto px-4 py-6 space-y-6">

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Total Bookings", value: stats.total, color: "text-gray-800" },
              { label: "Confirmed", value: stats.confirmed, color: "text-blue-500" },
              { label: "Checked In", value: stats.used, color: "text-green-500" },
              { label: "Cancelled", value: stats.cancelled, color: "text-red-500" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-xl shadow p-4 text-center">
                <p className="text-xs text-gray-400">{stat.label}</p>
                <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">

          {/* Scanner */}
          <div className="bg-white rounded-2xl shadow p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-800">Scan QR Code</h2>

            {!scanning ? (
              <button
                onClick={startScanner}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition"
              >
                Start Camera Scanner
              </button>
            ) : (
              <>
                <div id="qr-reader" className="w-full rounded-lg overflow-hidden" />
                <button
                  onClick={stopScanner}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 rounded-lg transition"
                >
                  Stop Scanner
                </button>
              </>
            )}

            {/* Manual entry */}
            <div className="border-t pt-4">
              <p className="text-sm text-gray-500 mb-2">Or enter Booking ID manually:</p>
              <form onSubmit={handleManualVerify} className="flex gap-2">
                <input
                  type="text"
                  value={manualId}
                  onChange={(e) => setManualId(e.target.value)}
                  placeholder="Paste booking ID..."
                  className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-sm"
                />
                <button
                  type="submit"
                  disabled={manualLoading}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded-lg transition disabled:opacity-60"
                >
                  {manualLoading ? "..." : "Verify"}
                </button>
              </form>
            </div>
          </div>

          {/* Scan Result */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Verification Result</h2>

            {!scanResult ? (
              <div className="text-center py-10 text-gray-300">
                <FaTicketAlt className="text-5xl mb-3 text-orange-400 mx-auto" />
                <p className="text-sm">Scan a ticket to see result here</p>
              </div>
            ) : (
              <div className={`rounded-xl p-4 ${
                scanStatus === "success"
                  ? "bg-green-50 border-2 border-green-400"
                  : scanStatus === "warning"
                  ? "bg-yellow-50 border-2 border-yellow-400"
                  : "bg-red-50 border-2 border-red-400"
              }`}>
                {/* Status Icon */}
                <div className="text-center mb-3">
                  <span className="text-5xl">
                    <div className="flex justify-center mb-2">
  {scanStatus === "success" && (
    <FaCheckCircle className="text-5xl text-green-500" />
  )}
  {scanStatus === "warning" && (
    <MdWarning className="text-5xl text-yellow-500" />
  )}
  {scanStatus === "error" && (
    <FaTimesCircle className="text-5xl text-red-500" />
  )}
</div>
                  </span>
                  <p className={`font-bold text-lg mt-2 ${
                    scanStatus === "success"
                      ? "text-green-600"
                      : scanStatus === "warning"
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}>
                    {scanResult.message}
                  </p>
                </div>

                {/* Booking Details */}
                {scanResult.booking && (
                  <div className="space-y-2 text-sm mt-3 border-t pt-3">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Name</span>
                      <span className="font-semibold">{scanResult.booking.guestName || "Registered User"}</span>
                    </div>
                    {scanResult.booking.guestEmail && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Email</span>
                        <span className="font-semibold">{scanResult.booking.guestEmail}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-500">Tickets</span>
                      <span className="font-semibold">{scanResult.booking.quantity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Amount</span>
                      <span className="font-semibold text-orange-500">
                        Ksh {Number(scanResult.booking.totalAmount).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Status</span>
                      <span className={`font-semibold capitalize ${
                        scanResult.booking.status === "used" ? "text-green-600" : "text-red-500"
                      }`}>
                        {scanResult.booking.status}
                      </span>
                    </div>
                  </div>
                )}

                {/* Scan another */}
                <button
                  onClick={() => { setScanResult(null); setScanStatus(null); }}
                  className="w-full mt-4 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 font-semibold py-2 rounded-lg transition text-sm"
                >
                  Scan Next Ticket
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Attendance List */}
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-800">Attendance List</h2>
            <span className="text-sm text-gray-400">{bookings.length} bookings</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3 text-left">Name</th>
                  <th className="px-6 py-3 text-left">Contact</th>
                  <th className="px-6 py-3 text-left">Tickets</th>
                  <th className="px-6 py-3 text-left">Amount</th>
                  <th className="px-6 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 font-semibold">
                      {booking.guestName || "Registered User"}
                    </td>
                    <td className="px-6 py-3 text-gray-500">
                      <p>{booking.guestEmail}</p>
                      <p>{booking.phoneNumber}</p>
                    </td>
                    <td className="px-6 py-3">{booking.quantity}</td>
                    <td className="px-6 py-3 text-orange-500 font-semibold">
                      Ksh {Number(booking.totalAmount).toLocaleString()}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        booking.status === "used"
                          ? "bg-green-100 text-green-600"
                          : booking.status === "confirmed"
                          ? "bg-blue-100 text-blue-600"
                          : "bg-red-100 text-red-600"
                      }`}>
                        {booking.status === "used" ? "Checked In" : booking.status}
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