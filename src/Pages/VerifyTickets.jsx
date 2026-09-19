// Pages/VerifyTickets.jsx

import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";
import {
  FaTicketAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaQrcode,
  FaUsers,
} from "react-icons/fa";
import { MdWarning } from "react-icons/md";
import api from "../Api/api";
import Swal from "sweetalert2";

export default function VerifyTickets() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  /* =========================================================
     STATE
  ========================================================= */

  const [event, setEvent] = useState(null);
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /*
    scanStatus:
    null
    success
    warning
    error
  */
  const [scanResult, setScanResult] = useState(null);
  const [scanStatus, setScanStatus] = useState(null);

  const [scanning, setScanning] = useState(false);
  const [verifying, setVerifying] = useState(false);

  /*
    Manual verification now uses booking_reference
    instead of numeric booking ID.
  */
  const [manualReference, setManualReference] = useState("");
  const [manualLoading, setManualLoading] = useState(false);

  // const scannerRef = useRef(null);
  // const scanLockedRef = useRef(false);

  const scannerRef = useRef(null);
const scanLockedRef = useRef(false);

  /* =========================================================
     CURRENT USER
  ========================================================= */

  let savedUser = {};

  try {
    savedUser = JSON.parse(
      localStorage.getItem("user") || "{}"
    );
  } catch {
    savedUser = {};
  }

  /* =========================================================
     FETCH EVENT + BOOKINGS
  ========================================================= */

  const fetchBookings = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }

      setError(null);

      /*
        Ideally this endpoint should use request.user
        on Django rather than user_id from the frontend.

        For now we keep user_id here because your existing
        organizer endpoint currently expects it.
      */

      const response = await api.post(
        "/api/events/organizer/",
        {
          event_id: eventId,
          user_id:
            savedUser?.user_id ??
            savedUser?.id ??
            null,
        }
      );

      setEvent(response.data.event);

      setBookings(
        response.data.bookings || []
      );

      setStats(
        response.data.stats || null
      );
    } catch (err) {
      console.error(
        "Failed to fetch event bookings:",
        err
      );

      const message =
        err.response?.data?.message ||
        "Failed to load event data.";

      setError(message);

      if (!showLoading) {
        Swal.fire({
          icon: "error",
          title: "Unable to refresh",
          text: message,
          confirmButtonColor: "#f97316",
        });
      }
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [eventId]);

  /* =========================================================
     CLEANUP SCANNER
  ========================================================= */

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current
          .clear()
          .catch(() => {});

        scannerRef.current = null;
      }
    };
  }, []);

  /* =========================================================
     EXTRACT BOOKING REFERENCE FROM QR
  ========================================================= */

  const extractBookingReference = (rawData) => {
    if (!rawData) {
      return null;
    }

    const value = String(rawData).trim();

    if (!value) {
      return null;
    }

    /*
      New QR format:

      KARIBU:TICKET:
      550e8400-e29b-41d4-a716-446655440000
    */

    const prefix = "KARIBU:TICKET:";

    if (
      value
        .toUpperCase()
        .startsWith(prefix)
    ) {
      const reference = value
        .substring(prefix.length)
        .trim();

      return reference || null;
    }

    /*
      Allow manual entry of the raw UUID itself.
    */

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (uuidRegex.test(value)) {
      return value;
    }

    /*
      Temporary compatibility:
      If an older QR contains JSON with a
      bookingReference field, accept it.
    */

    try {
      const parsed = JSON.parse(value);

      const reference =
        parsed.bookingReference ||
        parsed.booking_reference;

      if (reference) {
        return String(reference).trim();
      }
    } catch {
      // Not JSON — continue.
    }

    return null;
  };

  /* =========================================================
     VERIFY BOOKING REFERENCE
  ========================================================= */

  const verifyBookingReference = async (
    bookingReference
  ) => {
    if (!bookingReference) {
      setScanStatus("error");

      setScanResult({
        valid: false,
        message:
          "Invalid ticket. Booking reference is missing.",
      });

      return;
    }

    if (verifying) {
      return;
    }

    setVerifying(true);

    try {
      /*
        IMPORTANT:

        We no longer send:
          booking_id
          user_id

        The backend should authenticate the organizer
        using request.user and verify ownership of eventId.
      */

      const response = await api.post(
        "/api/events/verify/",
        {
          booking_reference:
            bookingReference,

          event_id: eventId,
        }
      );

      const data = response.data;

      /* =====================================================
         SUCCESS
      ===================================================== */

      if (data.valid === true) {
        setScanStatus("success");

        setScanResult(data);

        await fetchBookings(false);

        return;
      }

      /* =====================================================
         ALREADY USED
      ===================================================== */

      if (
        data.booking?.status === "used"
      ) {
        setScanStatus("warning");

        setScanResult(data);

        return;
      }

      /* =====================================================
         INVALID
      ===================================================== */

      setScanStatus("error");

      setScanResult(data);
    } catch (err) {
      console.error(
        "Ticket verification failed:",
        err
      );

      const data =
        err.response?.data;

      /*
        If Django returns booking details with
        the error, use them to determine whether
        this is an already-used ticket.
      */

      if (
        data?.booking?.status ===
        "used"
      ) {
        setScanStatus("warning");

        setScanResult({
          ...data,
          message:
            data.message ||
            "This ticket has already been used.",
        });

        return;
      }

      setScanStatus("error");

      setScanResult({
        valid: false,

        message:
          data?.message ||
          "Ticket verification failed.",
      });
    } finally {
      setVerifying(false);
    }
  };

  /* =========================================================
     VERIFY RAW QR
  ========================================================= */

  const verifyQRCode = async (rawData) => {
    const bookingReference =
      extractBookingReference(rawData);

    if (!bookingReference) {
      setScanStatus("error");

      setScanResult({
        valid: false,

        message:
          "Invalid Karibu Event ticket QR code.",
      });

      return;
    }

    await verifyBookingReference(
      bookingReference
    );
  };

  /* =========================================================
     START SCANNER
  ========================================================= */

const startScanner = async () => {
  if (scanning || scannerRef.current) {
    return;
  }

  setScanResult(null);
  setScanStatus(null);
  scanLockedRef.current = false;

  // Camera requires HTTPS, except localhost
  const isSecure =
    window.isSecureContext ||
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  if (!isSecure) {
    Swal.fire({
      icon: "warning",
      title: "Secure Connection Required",
      text: "Camera access requires HTTPS. Use the deployed HTTPS website or localhost.",
      confirmButtonColor: "#f97316",
    });

    return;
  }

  if (!navigator.mediaDevices?.getUserMedia) {
    Swal.fire({
      icon: "error",
      title: "Camera Not Supported",
      text: "Your browser does not support camera access.",
      confirmButtonColor: "#f97316",
    });

    return;
  }

  try {
    /*
      Render the scanner container first.
    */
    setScanning(true);

    /*
      Wait for React to render:

      <div id="qr-reader" />
    */
    await new Promise((resolve) =>
      setTimeout(resolve, 300)
    );

    const readerElement =
      document.getElementById("qr-reader");

    if (!readerElement) {
      throw new Error(
        "QR scanner container was not found."
      );
    }

    /*
      Create scanner.
    */
    const scanner =
      new Html5Qrcode("qr-reader");

    scannerRef.current = scanner;

    /*
      IMPORTANT:

      html5-qrcode accepts:

      { facingMode: "environment" }

      or:

      { facingMode: { exact: "environment" } }

      Do NOT use:
      { facingMode: { ideal: "environment" } }
    */

    await scanner.start(
      {
        facingMode: "environment",
      },

      {
        fps: 10,

        qrbox: (viewfinderWidth, viewfinderHeight) => {
          const minEdge = Math.min(
            viewfinderWidth,
            viewfinderHeight
          );

          const size = Math.floor(
            minEdge * 0.7
          );

          return {
            width: size,
            height: size,
          };
        },

        aspectRatio: 1.333334,
      },

      /*
        QR SUCCESS
      */
      async (decodedText) => {
        if (scanLockedRef.current) {
          return;
        }

        /*
          Lock immediately because the camera may
          detect the same QR multiple times.
        */
        scanLockedRef.current = true;

        console.log(
          "QR CODE DETECTED:",
          decodedText
        );

        try {
          await stopScanner();

          await verifyQRCode(
            decodedText
          );
        } catch (error) {
          console.error(
            "QR verification error:",
            error
          );
        }
      },

      /*
        QR SCAN FAILURE

        This callback runs continuously while the
        camera is open and no QR is detected.

        Do NOT show an error here.
      */
      () => {}
    );
  } catch (err) {
    console.error(
      "CAMERA START ERROR:",
      err
    );

    /*
      Clean scanner
    */
    try {
      if (scannerRef.current) {
        if (
          scannerRef.current.isScanning
        ) {
          await scannerRef.current.stop();
        }

        scannerRef.current.clear();

        scannerRef.current = null;
      }
    } catch (cleanupError) {
      console.warn(
        "Scanner cleanup error:",
        cleanupError
      );
    }

    setScanning(false);

    scanLockedRef.current = false;

    /*
      Friendly error message
    */
    let message =
      "Unable to open the camera.";

    const errorName =
      err?.name || "";

    const errorMessage =
      String(
        err?.message || err || ""
      );

    /*
      Permission denied / dismissed
    */
    if (
      errorName === "NotAllowedError" ||
      errorName ===
        "PermissionDeniedError" ||
      errorMessage
        .toLowerCase()
        .includes("permission")
    ) {
      message =
        "Camera permission was denied or dismissed. Allow camera access for Karibu Event in your browser and try again.";
    }

    /*
      Camera missing
    */
    else if (
      errorName === "NotFoundError" ||
      errorName ===
        "DevicesNotFoundError"
    ) {
      message =
        "No camera was found on this device.";
    }

    /*
      Camera busy
    */
    else if (
      errorName === "NotReadableError" ||
      errorName ===
        "TrackStartError"
    ) {
      message =
        "The camera is being used by another application. Close other apps using the camera and try again.";
    }

    /*
      Unsupported camera constraint
    */
    else if (
      errorName ===
        "OverconstrainedError"
    ) {
      message =
        "The requested camera is not available on this device.";
    }

    /*
      Other error
    */
    else if (errorMessage) {
      message = errorMessage;
    }

    Swal.fire({
      icon: "error",
      title: "Camera Could Not Start",
      text: message,
      confirmButtonColor: "#f97316",
    });
  }
};


/* =========================================================
   STOP SCANNER
========================================================= */

const stopScanner = async () => {
  const scanner =
    scannerRef.current;

  if (!scanner) {
    setScanning(false);
    scanLockedRef.current = false;
    return;
  }

  try {
    /*
      Stop camera stream
    */
    if (scanner.isScanning) {
      await scanner.stop();
    }
  } catch (err) {
    console.warn(
      "Scanner stop warning:",
      err
    );
  }

  try {
    /*
      Clear scanner UI
    */
    scanner.clear();
  } catch (err) {
    console.warn(
      "Scanner clear warning:",
      err
    );
  }

  scannerRef.current = null;

  setScanning(false);

  scanLockedRef.current = false;
};

  /* =========================================================
     MANUAL VERIFY
  ========================================================= */

  const handleManualVerify = async (e) => {
    e.preventDefault();

    const value =
      manualReference.trim();

    if (!value) {
      Swal.fire({
        icon: "warning",
        title: "Booking Reference Required",
        text:
          "Enter the booking reference before verifying.",
        confirmButtonColor: "#f97316",
      });

      return;
    }

    const bookingReference =
      extractBookingReference(
        value
      );

    if (!bookingReference) {
      setScanStatus("error");

      setScanResult({
        valid: false,

        message:
          "Invalid booking reference.",
      });

      return;
    }

    setManualLoading(true);

    setScanResult(null);
    setScanStatus(null);

    try {
      await verifyBookingReference(
        bookingReference
      );

      setManualReference("");
    } finally {
      setManualLoading(false);
    }
  };

  /* =========================================================
     SCAN NEXT
  ========================================================= */

  const handleScanNext = () => {
    setScanResult(null);
    setScanStatus(null);

    scanLockedRef.current =
      false;

    startScanner();
  };

    /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return <VerifyTicketsLoading />;
  }

  /* =========================================================
     ERROR
  ========================================================= */

  if (error) {
    return (
      <div className="min-h-screen bg-[#f7f7f8] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white border border-gray-100 rounded-3xl p-8 text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto">
            <FaTimesCircle className="text-3xl" />
          </div>

          <h2 className="text-xl font-black text-gray-900 mt-5">
            Unable to Load Event
          </h2>

          <p className="text-sm text-gray-400 mt-2">
            {error}
          </p>

          <div className="grid grid-cols-2 gap-3 mt-7">
            <button
              type="button"
              onClick={() => navigate("/creator-dashboard")}
              className="h-11 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition"
            >
              Dashboard
            </button>

            <button
              type="button"
              onClick={() => fetchBookings()}
              className="h-11 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-bold transition"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================
     CALCULATED VALUES
  ========================================================= */

  const totalBookings = Number(stats?.total ?? bookings.length ?? 0);
  const confirmedBookings = Number(stats?.confirmed ?? 0);
  const checkedInBookings = Number(stats?.used ?? 0);
  const cancelledBookings = Number(stats?.cancelled ?? 0);

  const attendanceRate =
    confirmedBookings + checkedInBookings > 0
      ? Math.round(
          (checkedInBookings /
            (confirmedBookings + checkedInBookings)) *
            100
        )
      : 0;

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="min-h-screen bg-[#f7f7f8]">
      {/* =====================================================
          TOP NAVIGATION
      ===================================================== */}

      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-100">
        <div className="max-w-7xl mx-auto h-20 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => navigate("/creator-dashboard")}
              className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:text-orange-500 hover:border-orange-200 transition"
            >
              ←
            </button>

            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.16em] text-orange-500">
                Ticket Verification
              </p>

              <h1 className="font-black text-gray-900 text-lg sm:text-xl truncate">
                {event?.title || "Verify Tickets"}
              </h1>
            </div>
          </div>

          <button
            type="button"
            onClick={() => fetchBookings(false)}
            className="h-10 px-4 rounded-xl border border-gray-200 text-gray-600 text-sm font-bold hover:bg-gray-50 transition flex items-center gap-2"
          >
            <span>↻</span>

            <span className="hidden sm:inline">
              Refresh
            </span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 lg:py-9">
        {/* ===================================================
            EVENT HERO
        =================================================== */}

        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 via-orange-600 to-gray-900">
          <div className="absolute -top-32 -right-28 w-96 h-96 rounded-full bg-white/5" />

          <div className="absolute -bottom-40 right-24 w-80 h-80 rounded-full border border-white/10" />

          <div className="relative px-6 py-8 sm:p-9 lg:p-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-7">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 text-orange-50 px-3 py-1.5 rounded-full text-xs font-bold">
                  <FaQrcode />

                  Live Check-in
                </div>

                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white mt-5">
                  Scan. Verify. Welcome.
                </h2>

                <p className="text-orange-100/90 mt-3 max-w-xl text-sm sm:text-base leading-6">
                  Verify attendee QR tickets securely and track event
                  check-ins in real time.
                </p>

                {event && (
                  <div className="mt-5">
                    <p className="text-xs uppercase tracking-wider font-bold text-orange-200">
                      Currently checking in
                    </p>

                    <p className="font-bold text-white mt-1">
                      {event.title}
                    </p>
                  </div>
                )}
              </div>

              <div className="lg:text-right">
                <p className="text-xs uppercase tracking-wider font-bold text-orange-200">
                  Attendance
                </p>

                <p className="text-4xl sm:text-5xl font-black text-white mt-2">
                  {attendanceRate}%
                </p>

                <p className="text-sm text-orange-100 mt-2">
                  {checkedInBookings.toLocaleString()} checked in
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================
            STATS
        =================================================== */}

        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6">
          <ModernStatCard
            title="Bookings"
            value={totalBookings}
            description="Total event bookings"
            icon={<FaUsers />}
          />

          <ModernStatCard
            title="Confirmed"
            value={confirmedBookings}
            description="Valid unused tickets"
            icon={<FaTicketAlt />}
          />

          <ModernStatCard
            title="Checked In"
            value={checkedInBookings}
            description={`${attendanceRate}% attendance`}
            icon={<FaCheckCircle />}
          />

          <ModernStatCard
            title="Cancelled"
            value={cancelledBookings}
            description="Cancelled bookings"
            icon={<FaTimesCircle />}
          />
        </section>

        {/* ===================================================
            CHECK-IN PROGRESS
        =================================================== */}

        <section className="bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 mt-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h3 className="font-black text-gray-900">
                Check-in Progress
              </h3>

              <p className="text-xs text-gray-400 mt-1">
                Live attendance progress for this event
              </p>
            </div>

            <p className="font-black text-xl text-orange-500">
              {attendanceRate}%
            </p>
          </div>

          <div className="h-3 bg-gray-100 rounded-full overflow-hidden mt-5">
            <div
              className="h-full bg-orange-500 rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, attendanceRate)}%`,
              }}
            />
          </div>

          <div className="flex justify-between mt-2 text-xs text-gray-400">
            <span>
              {checkedInBookings.toLocaleString()} checked in
            </span>

            <span>
              {(
                confirmedBookings + checkedInBookings
              ).toLocaleString()} valid tickets
            </span>
          </div>
        </section>

        {/* ===================================================
            SCANNER WORKSPACE
        =================================================== */}

        <section className="grid xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-5 mt-5">
          {/* =================================================
              SCANNER
          ================================================= */}

          <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
                  <FaQrcode className="text-xl" />
                </div>

                <div>
                  <h2 className="font-black text-gray-900">
                    QR Ticket Scanner
                  </h2>

                  <p className="text-xs text-gray-400 mt-1">
                    Scan the QR code displayed on the attendee's ticket.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              {!scanning ? (
                <div>
                  <div className="min-h-[300px] sm:min-h-[350px] rounded-2xl bg-gray-950 flex flex-col items-center justify-center text-center px-6 relative overflow-hidden">
                    {/* Scanner corner design */}

                    <div className="absolute top-10 left-10 w-12 h-12 border-l-4 border-t-4 border-orange-500 rounded-tl-lg" />

                    <div className="absolute top-10 right-10 w-12 h-12 border-r-4 border-t-4 border-orange-500 rounded-tr-lg" />

                    <div className="absolute bottom-10 left-10 w-12 h-12 border-l-4 border-b-4 border-orange-500 rounded-bl-lg" />

                    <div className="absolute bottom-10 right-10 w-12 h-12 border-r-4 border-b-4 border-orange-500 rounded-br-lg" />

                    <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center text-orange-400">
                      <FaQrcode className="text-4xl" />
                    </div>

                    <h3 className="text-white font-black text-lg mt-5">
                      Ready to Scan
                    </h3>

                    <p className="text-gray-400 text-sm mt-2 max-w-xs">
                      Start the camera and position the attendee's QR code
                      inside the scanning area.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={startScanner}
                    disabled={verifying}
                    className="w-full h-12 mt-4 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <FaQrcode />

                    Start QR Scanner
                  </button>
                </div>
              ) : (
                <div>
                  <div className="relative bg-gray-950 rounded-2xl overflow-hidden min-h-[350px]">
                    <div
                      id="qr-reader"
                      className="w-full overflow-hidden"
                    />
                  </div>

                  <div className="flex items-center justify-center gap-2 mt-4">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />

                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
                    </span>

                    <span className="text-xs font-semibold text-gray-500">
                      Camera active — point at the ticket QR code
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={stopScanner}
                    className="w-full h-11 mt-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-bold transition"
                  >
                    Stop Scanner
                  </button>
                </div>
              )}

              {/* ===============================================
                  MANUAL ENTRY
              =============================================== */}

              <div className="border-t border-gray-100 mt-6 pt-6">
                <div className="flex items-center gap-2">
                  <FaTicketAlt className="text-orange-500" />

                  <h3 className="font-black text-gray-800 text-sm">
                    Manual Verification
                  </h3>
                </div>

                <p className="text-xs text-gray-400 mt-2">
                  If the QR code cannot be scanned, enter the ticket's
                  booking reference manually.
                </p>

                <form
                  onSubmit={handleManualVerify}
                  className="mt-4"
                >
                  <label className="block text-xs font-bold text-gray-600 mb-2">
                    Booking Reference
                  </label>

                  <div className="relative">
                    <FaTicketAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />

                    <input
                      type="text"
                      value={manualReference}
                      onChange={(e) =>
                        setManualReference(e.target.value)
                      }
                      placeholder="550e8400-e29b-41d4-a716-446655440000"
                      className="w-full h-12 pl-11 pr-4 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-500/10 transition"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={
                      manualLoading ||
                      verifying ||
                      !manualReference.trim()
                    }
                    className="w-full h-11 mt-3 bg-gray-900 hover:bg-black text-white rounded-xl font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    {manualLoading
                      ? "Verifying Ticket..."
                      : "Verify Booking Reference"}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* =================================================
              RESULT
          ================================================= */}

          <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gray-50 text-gray-600 flex items-center justify-center">
                  <FaTicketAlt className="text-xl" />
                </div>

                <div>
                  <h2 className="font-black text-gray-900">
                    Verification Result
                  </h2>

                  <p className="text-xs text-gray-400 mt-1">
                    Ticket validity and attendee information.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              {verifying ? (
                <div className="min-h-[480px] flex flex-col items-center justify-center text-center">
                  <div className="w-14 h-14 rounded-full border-4 border-orange-100 border-t-orange-500 animate-spin" />

                  <h3 className="font-black text-gray-800 mt-5">
                    Verifying Ticket
                  </h3>

                  <p className="text-sm text-gray-400 mt-2">
                    Checking booking and payment information...
                  </p>
                </div>
              ) : !scanResult ? (
                <div className="min-h-[480px] flex flex-col items-center justify-center text-center px-5">
                  <div className="w-20 h-20 rounded-3xl bg-gray-50 text-gray-300 flex items-center justify-center">
                    <FaTicketAlt className="text-4xl" />
                  </div>

                  <h3 className="font-black text-gray-700 mt-5">
                    Waiting for a Ticket
                  </h3>

                  <p className="text-sm text-gray-400 max-w-xs mt-2 leading-6">
                    Scan an attendee's QR code or enter their booking
                    reference to see verification details.
                  </p>
                </div>
              ) : (
                <VerificationResult
                  scanResult={scanResult}
                  scanStatus={scanStatus}
                  onNext={handleScanNext}
                />
              )}
            </div>
          </div>
        </section>

        {/* ===================================================
            ATTENDANCE LIST
        =================================================== */}

        <section className="bg-white border border-gray-100 rounded-3xl overflow-hidden mt-5">
          <div className="p-5 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <FaUsers className="text-orange-500" />

                <h2 className="font-black text-gray-900">
                  Attendance List
                </h2>
              </div>

              <p className="text-xs text-gray-400 mt-1">
                View confirmed bookings and live check-in status.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() =>
                  navigate(`/event/${eventId}/attendees`)
                }
                className="h-10 px-4 border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-bold text-gray-600"
              >
                View Attendees
              </button>

              <button
                type="button"
                onClick={() => fetchBookings(false)}
                className="h-10 px-4 bg-orange-50 hover:bg-orange-100 text-orange-600 rounded-xl text-xs font-bold"
              >
                Refresh
              </button>
            </div>
          </div>

          {bookings.length === 0 ? (
            <div className="py-16 px-5 text-center">
              <div className="w-14 h-14 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto">
                <FaUsers className="text-xl" />
              </div>

              <h3 className="font-black text-gray-700 mt-4">
                No bookings yet
              </h3>

              <p className="text-sm text-gray-400 mt-2">
                Confirmed attendee bookings will appear here.
              </p>
            </div>
          ) : (
            <>
              {/* DESKTOP */}

              <div className="hidden md:block overflow-x-auto">
                <table className="w-full min-w-[850px]">
                  <thead className="bg-gray-50/80">
                    <tr className="text-[10px] uppercase tracking-wider text-gray-400">
                      <th className="px-5 py-4 text-left">
                        Attendee
                      </th>

                      <th className="px-4 py-4 text-left">
                        Contact
                      </th>

                      <th className="px-4 py-4 text-left">
                        Tickets
                      </th>

                      <th className="px-4 py-4 text-left">
                        Amount
                      </th>

                      <th className="px-4 py-4 text-left">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {bookings.map((booking) => (
                      <tr
                        key={booking.id}
                        className="hover:bg-gray-50/70 transition"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <AttendeeAvatar
                              name={booking.guest_name || "Guest"}
                            />

                            <div className="min-w-0">
                              <p className="font-bold text-gray-800 text-sm">
                                {booking.guest_name || "Guest"}
                              </p>

                              {booking.booking_reference && (
                                <p className="font-mono text-[9px] text-gray-400 mt-1 max-w-[180px] truncate">
                                  {booking.booking_reference}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <p className="text-xs text-gray-600">
                            {booking.guest_email || "—"}
                          </p>

                          <p className="text-xs text-gray-400 mt-1">
                            {booking.phone_number || "—"}
                          </p>
                        </td>

                        <td className="px-4 py-4">
                          <span className="font-black text-gray-800">
                            {booking.quantity ?? 0}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <p className="font-bold text-gray-800 text-sm">
                            KES{" "}
                            {Number(
                              booking.total_amount ?? 0
                            ).toLocaleString("en-KE")}
                          </p>
                        </td>

                        <td className="px-4 py-4">
                          <StatusBadge status={booking.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* MOBILE */}

              <div className="md:hidden divide-y divide-gray-100">
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="p-4"
                  >
                    <div className="flex items-start gap-3">
                      <AttendeeAvatar
                        name={booking.guest_name || "Guest"}
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-bold text-gray-800 text-sm truncate">
                              {booking.guest_name || "Guest"}
                            </p>

                            <p className="text-xs text-gray-400 mt-1 truncate">
                              {booking.phone_number || booking.guest_email || "—"}
                            </p>
                          </div>

                          <p className="font-black text-gray-800 text-sm whitespace-nowrap">
                            KES{" "}
                            {Number(
                              booking.total_amount ?? 0
                            ).toLocaleString("en-KE")}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 mt-3">
                          <StatusBadge status={booking.status} />

                          <span className="bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full text-[10px] font-bold">
                            {booking.quantity ?? 0}{" "}
                            ticket
                            {Number(booking.quantity) !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>

        {/* ===================================================
            CHECK-IN TIPS
        =================================================== */}

        <section className="grid md:grid-cols-3 gap-4 mt-5 mb-6">
          <TipCard
            number="01"
            title="Scan the ticket"
            text="Ask the attendee to display their Karibu Event QR ticket."
          />

          <TipCard
            number="02"
            title="Confirm details"
            text="Check the attendee name and ticket quantity after verification."
          />

          <TipCard
            number="03"
            title="One scan only"
            text="A successfully verified ticket is marked as used to prevent reuse."
          />
        </section>
      </main>
    </div>
  );
}

/* =========================================================
   VERIFICATION RESULT
========================================================= */

function VerificationResult({
  scanResult,
  scanStatus,
  onNext,
}) {
  const success =
    scanStatus === "success";

  const warning =
    scanStatus === "warning";

  const booking =
    scanResult?.booking;

  return (
    <div>
      <div
        className={`rounded-2xl border p-6 text-center ${
          success
            ? "bg-green-50 border-green-100"
            : warning
            ? "bg-yellow-50 border-yellow-100"
            : "bg-red-50 border-red-100"
        }`}
      >
        <div
          className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto ${
            success
              ? "bg-green-100 text-green-600"
              : warning
              ? "bg-yellow-100 text-yellow-600"
              : "bg-red-100 text-red-500"
          }`}
        >
          {success ? (
            <FaCheckCircle className="text-4xl" />
          ) : warning ? (
            <MdWarning className="text-4xl" />
          ) : (
            <FaTimesCircle className="text-4xl" />
          )}
        </div>

        <p
          className={`font-black text-2xl mt-5 ${
            success
              ? "text-green-700"
              : warning
              ? "text-yellow-700"
              : "text-red-600"
          }`}
        >
          {success
            ? "Ticket Verified"
            : warning
            ? "Already Checked In"
            : "Invalid Ticket"}
        </p>

        <p className="text-sm text-gray-600 mt-2 max-w-md mx-auto">
          {scanResult?.message}
        </p>
      </div>

      {booking && (
        <div className="border border-gray-100 rounded-2xl mt-4 overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <p className="text-[10px] uppercase tracking-wider font-black text-gray-400">
              Attendee
            </p>

            <div className="flex items-center gap-3 mt-3">
              <AttendeeAvatar
                name={booking.guest_name || "Guest"}
                large
              />

              <div className="min-w-0">
                <p className="font-black text-gray-900">
                  {booking.guest_name || "Guest"}
                </p>

                <p className="text-xs text-gray-400 mt-1 truncate">
                  {booking.guest_email || booking.phone_number || "—"}
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 space-y-4">
            <ResultRow
              label="Phone"
              value={booking.phone_number || "—"}
            />

            <ResultRow
              label="Tickets"
              value={booking.quantity ?? "—"}
            />

            <ResultRow
              label="Amount"
              value={`KES ${Number(
                booking.total_amount ?? 0
              ).toLocaleString("en-KE")}`}
            />

            {booking.booking_reference && (
              <ResultRow
                label="Reference"
                value={booking.booking_reference}
                mono
              />
            )}

            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-gray-400">
                Status
              </span>

              <StatusBadge
                status={booking.status}
              />
            </div>

            {booking.checked_in_at && (
              <ResultRow
                label="Checked In"
                value={new Date(
                  booking.checked_in_at
                ).toLocaleString("en-KE")}
              />
            )}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={onNext}
        className="w-full h-12 mt-4 bg-gray-900 hover:bg-black text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 transition"
      >
        <FaQrcode />

        Scan Next Ticket
      </button>
    </div>
  );
}

/* =========================================================
   MODERN STAT CARD
========================================================= */

function ModernStatCard({
  title,
  value,
  description,
  icon,
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5">
      <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center text-lg">
        {icon}
      </div>

      <p className="text-xl sm:text-2xl font-black text-gray-900 mt-4">
        {Number(value || 0).toLocaleString("en-KE")}
      </p>

      <p className="text-xs sm:text-sm font-bold text-gray-700 mt-1">
        {title}
      </p>

      <p className="text-[10px] sm:text-xs text-gray-400 mt-1">
        {description}
      </p>
    </div>
  );
}

/* =========================================================
   ATTENDEE AVATAR
========================================================= */

function AttendeeAvatar({
  name,
  large = false,
}) {
  const initials =
    String(name || "Guest")
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) =>
        part.charAt(0).toUpperCase()
      )
      .join("") || "G";

  return (
    <div
      className={`${
        large
          ? "w-12 h-12 text-sm"
          : "w-10 h-10 text-xs"
      } rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center font-black flex-shrink-0`}
    >
      {initials}
    </div>
  );
}

/* =========================================================
   RESULT ROW
========================================================= */

function ResultRow({
  label,
  value,
  mono = false,
}) {
  return (
    <div className="flex justify-between gap-5">
      <span className="text-sm text-gray-400 flex-shrink-0">
        {label}
      </span>

      <span
        className={`font-bold text-gray-700 text-sm text-right break-all ${
          mono ? "font-mono text-xs" : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}

/* =========================================================
   TIP CARD
========================================================= */

function TipCard({
  number,
  title,
  text,
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5">
      <span className="text-xs font-black text-orange-500">
        {number}
      </span>

      <h3 className="font-black text-gray-800 mt-3">
        {title}
      </h3>

      <p className="text-xs text-gray-400 mt-2 leading-5">
        {text}
      </p>
    </div>
  );
}

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({ status }) {
  const value =
    String(status || "").toLowerCase();

  const styles = {
    confirmed:
      "bg-blue-50 text-blue-600",

    used:
      "bg-green-50 text-green-600",

    pending:
      "bg-yellow-50 text-yellow-700",

    cancelled:
      "bg-red-50 text-red-500",

    expired:
      "bg-gray-100 text-gray-500",

    refunded:
      "bg-purple-50 text-purple-600",
  };

  const labels = {
    confirmed: "Confirmed",
    used: "Checked In",
    pending: "Pending",
    cancelled: "Cancelled",
    expired: "Expired",
    refunded: "Refunded",
  };

  return (
    <span
      className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold ${
        styles[value] ||
        "bg-gray-100 text-gray-500"
      }`}
    >
      {labels[value] ||
        status ||
        "Unknown"}
    </span>
  );
}

/* =========================================================
   LOADING
========================================================= */

function VerifyTicketsLoading() {
  return (
    <div className="min-h-screen bg-[#f7f7f8] animate-pulse">
      <div className="h-20 bg-white border-b border-gray-100" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="h-56 bg-gray-200 rounded-3xl" />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-36 bg-white border border-gray-100 rounded-2xl"
            />
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-5 mt-5">
          <div className="h-[600px] bg-white border border-gray-100 rounded-3xl" />

          <div className="h-[600px] bg-white border border-gray-100 rounded-3xl" />
        </div>
      </div>
    </div>
  );
}