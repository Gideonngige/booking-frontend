// Pages/EventDetail.jsx

import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import QRCode from "qrcode";
import api from "../Api/api";
import Swal from "sweetalert2";
import { Helmet } from "react-helmet-async";
import FloatingParticles from "../Components/Floating-particles";

/* =========================================================
   QR CODE COMPONENT
========================================================= */

function QRCodeImage({ bookingResult }) {
  const [qrSrc, setQrSrc] = useState("");

  useEffect(() => {
    const generateQR = async () => {
      try {
        const booking = bookingResult?.booking || {};

        const bookingReference =
          booking.bookingReference ||
          booking.booking_reference;

        if (!bookingReference) {
          console.error("Booking reference is missing.");
          return;
        }

        // Only encode the secure booking reference.
        // Do not expose guest/payment details in the QR.
        const qrText = `KARIBU:TICKET:${bookingReference}`;

        const qr = await QRCode.toDataURL(qrText, {
          width: 500,
          margin: 2,
        });

        setQrSrc(qr);
      } catch (err) {
        console.error("QR generation failed:", err);

        Swal.fire({
          icon: "error",
          title: "Failed to generate QR code",
          text: "An unexpected error occurred while generating your ticket.",
        });
      }
    };

    if (bookingResult) {
      generateQR();
    }
  }, [bookingResult]);

  if (!qrSrc) {
    return (
      <div className="w-48 h-48 flex items-center justify-center bg-gray-100 rounded-xl mx-auto">
        <span className="text-sm text-gray-400">
          Generating ticket...
        </span>
      </div>
    );
  }

  return (
    <img
      src={qrSrc}
      alt="Karibu Event Ticket QR Code"
      className="w-48 h-48 border-4 border-orange-500 rounded-xl mx-auto"
    />
  );
}

/* =========================================================
   EVENT DETAIL
========================================================= */

export default function EventDetail() {
  const { id } = useParams();

  /* =======================================================
     USER
  ======================================================= */

  let savedUser = null;

  try {
    savedUser = JSON.parse(
      localStorage.getItem("user") || "null"
    );
  } catch {
    savedUser = null;
  }

  const isLoggedIn = !!savedUser;

  /* =======================================================
     EVENT STATE
  ======================================================= */

  const [event, setEvent] = useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);

  /* =======================================================
     BOOKING FORM STATE
  ======================================================= */

  const [quantity, setQuantity] =
    useState(1);

  const [phone, setPhone] = useState(
    isLoggedIn
      ? savedUser?.phone_number || ""
      : ""
  );

  const [guestName, setGuestName] =
    useState(
      isLoggedIn
        ? savedUser?.name || ""
        : ""
    );

  const [guestEmail, setGuestEmail] =
    useState(
      isLoggedIn
        ? savedUser?.email || ""
        : ""
    );

  const [bookingLoading, setBookingLoading] =
    useState(false);

  const [bookingError, setBookingError] =
    useState(null);

  const [bookingResult, setBookingResult] =
    useState(null);

  const [showBookingForm, setShowBookingForm] =
    useState(false);

  /*
    idle
    pending
    paid
    failed
    expired
  */
  const [paymentStatus, setPaymentStatus] =
    useState("idle");

  /* =======================================================
     PROMO CODE STATE
  ======================================================= */

  const [promoCode, setPromoCode] =
    useState("");

  const [promoLoading, setPromoLoading] =
    useState(false);

  const [appliedPromo, setAppliedPromo] =
    useState(null);

  const [pricing, setPricing] =
    useState({
      originalAmount: 0,
      discountAmount: 0,
      finalAmount: 0,
    });

  /* =======================================================
     POLLING REFERENCES
  ======================================================= */

  const pollingIntervalRef = useRef(null);
  const pollingTimeoutRef = useRef(null);

  /* =======================================================
     FETCH EVENT
  ======================================================= */

  const fetchEvent = async (
    showError = true
  ) => {
    try {
      const res = await api.get(
        `/api/events/${id}`
      );

      setEvent(res.data.event);

      setError(null);

      return res.data.event;
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Failed to load event.";

      setError(message);

      if (showError) {
        Swal.fire({
          icon: "error",
          title: "Failed to load event",
          text: message,
        });
      }

      return null;
    }
  };

  useEffect(() => {
    const loadEvent = async () => {
      setLoading(true);

      await fetchEvent();

      setLoading(false);
    };

    loadEvent();
  }, [id]);

  /* =======================================================
     CLEAN UP POLLING
  ======================================================= */

  const stopPaymentPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(
        pollingIntervalRef.current
      );

      pollingIntervalRef.current = null;
    }

    if (pollingTimeoutRef.current) {
      clearTimeout(
        pollingTimeoutRef.current
      );

      pollingTimeoutRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopPaymentPolling();
    };
  }, []);

  /* =======================================================
     RESET PROMO WHEN QUANTITY CHANGES
  ======================================================= */

  useEffect(() => {
    if (!event) return;

    const originalAmount =
      Number(event.price || 0) *
      Number(quantity || 1);

    /*
      Promo calculations are based on quantity.
      If quantity changes, force customer to
      apply the promo again so the displayed
      discount is always correct.
    */

    if (appliedPromo) {
      setAppliedPromo(null);
      setPromoCode("");
    }

    setPricing({
      originalAmount,
      discountAmount: 0,
      finalAmount: originalAmount,
    });
  }, [quantity, event?.price]);

  /* =======================================================
     PRICING
  ======================================================= */

  const originalTotal = event
    ? Number(event.price || 0) *
      Number(quantity || 1)
    : 0;

  const totalCost = appliedPromo
    ? Number(pricing.finalAmount || 0)
    : originalTotal;

  /* =======================================================
     APPLY PROMO CODE
  ======================================================= */

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Enter Promo Code",
        text: "Please enter a promo code first.",
        confirmButtonColor: "#f97316",
      });

      return;
    }

    if (!event) return;

    setPromoLoading(true);

    try {
      const res = await api.post(
        "/api/promo-codes/validate/",
        {
          event_id: event.id,
          code: promoCode
            .trim()
            .toUpperCase(),
          quantity,
        }
      );

      const data = res.data;

      if (!data.valid) {
        throw new Error(
          data.message ||
            "Promo code is invalid."
        );
      }

      setAppliedPromo(data.promo);

      setPricing({
        originalAmount: Number(
          data.pricing.original_amount
        ),

        discountAmount: Number(
          data.pricing.discount_amount
        ),

        finalAmount: Number(
          data.pricing.final_amount
        ),
      });

      setPromoCode(data.promo.code);

      Swal.fire({
        icon: "success",
        title: "Promo Applied 🎉",
        text: `You saved KES ${Number(
          data.pricing.discount_amount
        ).toLocaleString()}`,
        confirmButtonColor: "#f97316",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error(
        "Promo validation error:",
        err
      );

      setAppliedPromo(null);

      setPricing({
        originalAmount: originalTotal,
        discountAmount: 0,
        finalAmount: originalTotal,
      });

      Swal.fire({
        icon: "error",
        title: "Promo Code Not Applied",
        text:
          err.response?.data?.message ||
          err.message ||
          "This promo code cannot be used.",
        confirmButtonColor: "#f97316",
      });
    } finally {
      setPromoLoading(false);
    }
  };

  /* =======================================================
     REMOVE PROMO CODE
  ======================================================= */

  const handleRemovePromo = () => {
    setPromoCode("");

    setAppliedPromo(null);

    setPricing({
      originalAmount: originalTotal,
      discountAmount: 0,
      finalAmount: originalTotal,
    });
  };

  /* =======================================================
     PAYMENT STATUS POLLING
  ======================================================= */

  const pollPaymentStatus = (
    bookingId
  ) => {
    stopPaymentPolling();

    const checkStatus = async () => {
      try {
        const res = await api.get(
          `/api/events/bookings/${bookingId}/status/`
        );

        const data = res.data;

        /* ==========================================
           SUCCESS
        ========================================== */

        if (
          data.payment_status === "paid" &&
          data.booking_status === "confirmed"
        ) {
          setPaymentStatus("paid");

          setBookingResult((prev) => {
            if (!prev) return null;

            return {
              ...prev,

              booking: {
                ...prev.booking,

                payment_status: "paid",

                status: "confirmed",

                bookingReference:
                  data.booking_reference,

                booking_reference:
                  data.booking_reference,

                totalAmount:
                  Number(
                    data.total_amount
                  ),

                total_amount:
                  Number(
                    data.total_amount
                  ),

                originalAmount:
                  Number(
                    data.original_amount
                  ),

                discountAmount:
                  Number(
                    data.discount_amount
                  ),
              },
            };
          });

          stopPaymentPolling();

          Swal.fire({
            icon: "success",
            title: "Payment Successful!",
            text:
              "Your booking has been confirmed. Your ticket is ready.",
            confirmButtonColor: "#f97316",
          });

          await fetchEvent(false);

          return;
        }

        /* ==========================================
           EXPIRED RESERVATION
        ========================================== */

        if (
          data.booking_status ===
          "expired"
        ) {
          setPaymentStatus("expired");

          stopPaymentPolling();

          await fetchEvent(false);

          Swal.fire({
            icon: "warning",
            title: "Booking Expired",
            text:
              "The payment window expired and your reserved tickets were released.",
            confirmButtonColor: "#f97316",
          });

          return;
        }

        /* ==========================================
           FAILED PAYMENT
        ========================================== */

        if (
          data.payment_status ===
            "failed" ||
          data.booking_status ===
            "cancelled"
        ) {
          setPaymentStatus("failed");

          stopPaymentPolling();

          await fetchEvent(false);

          Swal.fire({
            icon: "error",
            title: "Payment Failed",
            text:
              "Your payment was unsuccessful and the reserved tickets have been released.",
            confirmButtonColor: "#f97316",
          });
        }
      } catch (err) {
        console.error(
          "Payment polling error:",
          err
        );

        /*
          Do not immediately stop polling because
          of one temporary network failure.
        */
      }
    };

    // Check immediately instead of waiting 5 sec.
    checkStatus();

    pollingIntervalRef.current =
      setInterval(
        checkStatus,
        5000
      );

    /*
      Stop frontend polling after 5 minutes.
      Backend expiration remains the source
      of truth.
    */
    pollingTimeoutRef.current =
      setTimeout(() => {
        stopPaymentPolling();

        fetchEvent(false);
      }, 300000);
  };

  /* =======================================================
     BOOK EVENT
  ======================================================= */

  const handleBooking = async (e) => {
    e.preventDefault();

    setBookingError(null);

    /* ==========================================
       VALIDATE NAME
    ========================================== */

    if (!guestName.trim()) {
      setBookingError(
        "Please enter your full name."
      );

      return;
    }

    /* ==========================================
       VALIDATE EMAIL
    ========================================== */

    if (!guestEmail.trim()) {
      setBookingError(
        "Please enter your email address."
      );

      return;
    }

    /* ==========================================
       VALIDATE PHONE
    ========================================== */

    if (
      !phone.match(
        /^(\+254|0)[17]\d{8}$/
      )
    ) {
      setBookingError(
        "Enter a valid Kenyan phone number e.g. 0712345678"
      );

      return;
    }

    /* ==========================================
       VALIDATE QUANTITY
    ========================================== */

    if (
      quantity <= 0 ||
      quantity >
        Number(
          event.availableTickets
        )
    ) {
      setBookingError(
        "Invalid ticket quantity."
      );

      return;
    }

    setBookingLoading(true);

    try {
      const res = await api.post(
        "/api/events/book/",
        {
          /*
            Support the current user object,
            while preferring user_id.
          */
          userId: isLoggedIn
            ? savedUser?.user_id ??
              savedUser?.id ??
              null
            : null,

          eventId: event.id,

          quantity,

          phoneNumber: phone.trim(),

          guestName:
            guestName.trim(),

          guestEmail:
            guestEmail.trim(),

          /*
            Never send calculated amount.
            Django calculates the real price.
          */
          promoCode: appliedPromo
            ? appliedPromo.code
            : null,
        }
      );

      const data = res.data;

      setBookingResult(data);

      /*
        Tickets are now reserved on the backend
        as soon as booking is created.
      */

      setEvent((prev) => {
        if (!prev) return prev;

        return {
          ...prev,

          availableTickets: Math.max(
            0,
            Number(
              prev.availableTickets
            ) -
              Number(quantity)
          ),
        };
      });

      /* ==========================================
         FREE BOOKING
      ========================================== */

      if (
        Number(
          data.booking?.totalAmount ??
            data.booking?.total_amount ??
            totalCost
        ) <= 0 &&
        data.booking?.status ===
          "confirmed"
      ) {
        setPaymentStatus("paid");

        return;
      }

      /* ==========================================
         M-PESA PAYMENT
      ========================================== */

      setPaymentStatus("pending");

      if (data.booking?.id) {
        pollPaymentStatus(
          data.booking.id
        );
      }
    } catch (err) {
      console.error(
        "Booking error:",
        err
      );

      const message =
        err.response?.data?.message ||
        err.message ||
        "An unexpected error occurred. Please try again.";

      setBookingError(message);

      Swal.fire({
        icon: "error",
        title: "Booking Failed",
        text: message,
        confirmButtonColor: "#f97316",
      });

      /*
        Backend may have rejected booking because
        inventory changed. Refresh event.
      */
      await fetchEvent(false);
    } finally {
      setBookingLoading(false);
    }
  };

  /* =======================================================
     DOWNLOAD QR TICKET
  ======================================================= */

  const handleDownloadQR = async () => {
    try {
      if (!bookingResult?.booking) {
        return;
      }

      const booking =
        bookingResult.booking;

      const bookingReference =
        booking.bookingReference ||
        booking.booking_reference;

      if (!bookingReference) {
        Swal.fire({
          icon: "error",
          title: "Ticket unavailable",
          text:
            "The booking reference could not be found.",
        });

        return;
      }

      const qrText =
        `KARIBU:TICKET:${bookingReference}`;

      const qrImage =
        await QRCode.toDataURL(
          qrText,
          {
            width: 700,
            margin: 2,
          }
        );

      const link =
        document.createElement("a");

      link.href = qrImage;

      link.download =
        `karibu-ticket-${bookingReference}.png`;

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);
    } catch (err) {
      console.error(
        "QR download failed:",
        err
      );

      Swal.fire({
        icon: "error",
        title: "Failed to download ticket",
        text:
          "An unexpected error occurred. Please try again.",
      });
    }
  };

  /* =======================================================
     TRY AGAIN
  ======================================================= */

  const handleTryAgain = async () => {
    stopPaymentPolling();

    setBookingResult(null);

    setPaymentStatus("idle");

    setBookingError(null);

    setAppliedPromo(null);

    setPromoCode("");

    setQuantity(1);

    setShowBookingForm(true);

    await fetchEvent(false);
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-3" />

          <p className="text-gray-500">
            Loading event...
          </p>
        </div>
      </div>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="bg-white rounded-2xl shadow p-8 text-center max-w-md w-full">
          <div className="text-5xl mb-4">
            ⚠️
          </div>

          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Event unavailable
          </h2>

          <p className="text-red-500">
            {error ||
              "This event could not be loaded."}
          </p>
        </div>
      </div>
    );
  }

  /* =======================================================
     EVENT STATUS
  ======================================================= */

  const availableTickets =
    Number(
      event.availableTickets ?? 0
    );

  const isSoldOut =
    availableTickets <= 0;

  const eventDate =
    new Date(
      `${event.date}T${event.time || "23:59"}`
    );

  const isPast =
    eventDate < new Date();

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-screen bg-gray-100">

      {/* ===================================================
          SEO
      =================================================== */}

      <Helmet>
        <title>
          {event.title} | Karibu Event
        </title>

        <meta
          name="description"
          content={
            event.description ||
            `Book tickets for ${event.title} on Karibu Event.`
          }
        />

        <meta
          property="og:title"
          content={event.title}
        />

        <meta
          property="og:description"
          content={
            event.description ||
            `Book tickets for ${event.title}.`
          }
        />

        <meta
          property="og:image"
          content={event.image}
        />

        <meta
          property="og:url"
          content={`https://www.karibuevent.online/events/${event.id}`}
        />

        <meta
          property="og:type"
          content="website"
        />

        <meta
          name="twitter:card"
          content="summary_large_image"
        />

        <link
          rel="canonical"
          href={`https://www.karibuevent.online/events/${event.id}`}
        />
      </Helmet>

      {/* ===================================================
          FLOATING PARTICLES
      =================================================== */}

      <FloatingParticles />

      {/* ===================================================
          EVENT BANNER
      =================================================== */}

      <div className="relative w-full h-72 md:h-96">

        <img
          src={
            event.image ||
            "https://images.unsplash.com/photo-1507874457470-272b3c8d8ee2?w=800"
          }
          alt={event.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src =
              "https://images.unsplash.com/photo-1507874457470-272b3c8d8ee2?w=800";
          }}
        />

        <div className="absolute inset-0 bg-black/20" />

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/60 to-transparent p-6 md:p-10">

          {event.category && (
            <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              {event.category}
            </span>
          )}

          <h1 className="text-3xl md:text-4xl font-bold text-white mt-2">
            {event.title}
          </h1>

        </div>

      </div>

      {/* ===================================================
          MAIN CONTENT
      =================================================== */}

      <div className="max-w-5xl mx-auto px-4 py-8 grid md:grid-cols-3 gap-8">

        {/* =================================================
            LEFT SIDE
        ================================================= */}

        <div className="md:col-span-2 space-y-6">

          {/* Event Information */}

          <div className="bg-white rounded-2xl shadow p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">

            <div>
              <p className="text-gray-400 text-sm">
                Date
              </p>

              <p className="font-semibold">
                {new Date(
                  `${event.date}T00:00:00`
                ).toLocaleDateString(
                  "en-KE",
                  {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  }
                )}
              </p>
            </div>

            <div>
              <p className="text-gray-400 text-sm">
                Time
              </p>

              <p className="font-semibold">
                {event.time}
              </p>
            </div>

            <div>
              <p className="text-gray-400 text-sm">
                Location
              </p>

              <p className="font-semibold">
                {event.location}
                {event.county
                  ? `, ${event.county}`
                  : ""}
              </p>
            </div>

            <div>
              <p className="text-gray-400 text-sm">
                Organizer
              </p>

              <p className="font-semibold">
                {event.organizerName ||
                  event.organizer_name}
              </p>
            </div>

          </div>

          {/* Description */}

          <div className="bg-white rounded-2xl shadow p-6">

            <h2 className="text-xl font-bold text-gray-800 mb-3">
              About this Event
            </h2>

            <p className="text-gray-600 leading-relaxed whitespace-pre-line">
              {event.description}
            </p>

          </div>

        </div>

        {/* =================================================
            RIGHT SIDE / CHECKOUT
        ================================================= */}

        <div className="md:col-span-1">

          <div className="bg-white rounded-2xl shadow p-6 sticky top-6">

            {/* =============================================
                PAYMENT PENDING
            ============================================= */}

            {bookingResult &&
              paymentStatus ===
                "pending" && (

              <div className="text-center space-y-4">

                <div className="text-5xl animate-pulse">
                  📱
                </div>

                <h3 className="text-xl font-bold text-gray-800">
                  Waiting for Payment
                </h3>

                <p className="text-gray-500 text-sm">
                  An M-Pesa prompt has been sent to:
                </p>

                <p className="font-bold text-orange-500 text-lg">
                  {phone}
                </p>

                <div className="bg-orange-50 border border-orange-100 rounded-xl p-3">

                  <p className="text-sm text-gray-600">
                    Amount
                  </p>

                  <p className="font-bold text-orange-500 text-xl">
                    KES{" "}
                    {Number(
                      bookingResult.booking
                        ?.totalAmount ??
                        bookingResult.booking
                          ?.total_amount ??
                        totalCost
                    ).toLocaleString()}
                  </p>

                </div>

                <p className="text-xs text-gray-400">
                  Enter your M-Pesa PIN to complete the booking.
                  Your tickets are reserved for approximately 5 minutes.
                </p>

                <div className="animate-spin h-10 w-10 border-4 border-orange-500 border-t-transparent rounded-full mx-auto" />

                <p className="text-xs text-gray-400">
                  Please do not refresh this page while payment is being processed.
                </p>

              </div>

            )}

            {/* =============================================
                PAYMENT SUCCESSFUL
            ============================================= */}

            {bookingResult &&
              paymentStatus === "paid" && (

              <div className="text-center space-y-4">

                <div className="text-5xl">
                  🎉
                </div>

                <h3 className="text-xl font-bold text-green-600">
                  Booking Confirmed!
                </h3>

                <p className="text-sm text-gray-500">
                  {bookingResult.booking
                    ?.guestName ||
                    bookingResult.booking
                      ?.guest_name}
                  {" — "}
                  {bookingResult.booking
                    ?.quantity}{" "}
                  ticket(s)
                </p>

                <div className="flex justify-center my-3">

                  <QRCodeImage
                    bookingResult={
                      bookingResult
                    }
                  />

                </div>

                <p className="text-xs text-gray-400">
                  Show this QR code at the entrance.
                </p>

                {(bookingResult.booking
                  ?.bookingReference ||
                  bookingResult.booking
                    ?.booking_reference) && (

                  <div className="bg-gray-50 rounded-lg p-2">

                    <p className="text-[11px] text-gray-400">
                      Booking Reference
                    </p>

                    <p className="text-xs font-semibold text-gray-700 break-all">
                      {bookingResult.booking
                        ?.bookingReference ||
                        bookingResult.booking
                          ?.booking_reference}
                    </p>

                  </div>

                )}

                <button
                  type="button"
                  onClick={
                    handleDownloadQR
                  }
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition"
                >
                  Download Ticket
                </button>

                <div className="bg-gray-50 rounded-lg p-3 text-left text-sm space-y-2">

                  <p>
                    <span className="text-gray-400">
                      Event:
                    </span>{" "}

                    <span className="font-semibold">
                      {bookingResult.event
                        ?.title ||
                        event.title}
                    </span>
                  </p>

                  <p>
                    <span className="text-gray-400">
                      Date:
                    </span>{" "}

                    {new Date(
                      `${
                        bookingResult.event
                          ?.date ||
                        event.date
                      }T00:00:00`
                    ).toLocaleDateString(
                      "en-KE"
                    )}
                  </p>

                  {Number(
                    bookingResult.booking
                      ?.discountAmount ??
                      bookingResult.booking
                        ?.discount_amount ??
                      0
                  ) > 0 && (

                    <p>
                      <span className="text-gray-400">
                        Discount:
                      </span>{" "}

                      <span className="text-green-600 font-semibold">
                        KES{" "}
                        {Number(
                          bookingResult
                            .booking
                            ?.discountAmount ??
                            bookingResult
                              .booking
                              ?.discount_amount ??
                            0
                        ).toLocaleString()}
                      </span>
                    </p>

                  )}

                  <p>
                    <span className="text-gray-400">
                      Total Paid:
                    </span>{" "}

                    <span className="text-orange-500 font-bold">
                      KES{" "}
                      {Number(
                        bookingResult.booking
                          ?.totalAmount ??
                          bookingResult.booking
                            ?.total_amount ??
                          0
                      ).toLocaleString()}
                    </span>
                  </p>

                </div>

              </div>

            )}

            {/* =============================================
                PAYMENT FAILED
            ============================================= */}

            {bookingResult &&
              paymentStatus ===
                "failed" && (

              <div className="text-center space-y-4">

                <div className="text-5xl">
                  ❌
                </div>

                <h3 className="text-xl font-bold text-red-500">
                  Payment Failed
                </h3>

                <p className="text-sm text-gray-500">
                  Your M-Pesa payment was not completed.
                  Your reserved tickets have been released.
                </p>

                <button
                  type="button"
                  onClick={handleTryAgain}
                  className="w-full bg-orange-500 text-white font-bold py-3 rounded-lg hover:bg-orange-600 transition"
                >
                  Try Again
                </button>

              </div>

            )}

            {/* =============================================
                BOOKING EXPIRED
            ============================================= */}

            {bookingResult &&
              paymentStatus ===
                "expired" && (

              <div className="text-center space-y-4">

                <div className="text-5xl">
                  ⏰
                </div>

                <h3 className="text-xl font-bold text-orange-500">
                  Booking Expired
                </h3>

                <p className="text-sm text-gray-500">
                  The payment window expired before payment was confirmed.
                  Your reserved tickets have been released.
                </p>

                <button
                  type="button"
                  onClick={handleTryAgain}
                  className="w-full bg-orange-500 text-white font-bold py-3 rounded-lg hover:bg-orange-600 transition"
                >
                  Book Again
                </button>

              </div>

            )}

            {/* =============================================
                DEFAULT BOOKING VIEW
            ============================================= */}

            {!bookingResult && (
              <>

                {/* EVENT ENDED */}

                {isPast ? (

                  <div className="text-center py-5">

                    <div className="text-4xl mb-3">
                      📅
                    </div>

                    <p className="text-gray-500 font-semibold">
                      This event has ended.
                    </p>

                  </div>

                ) : isSoldOut ? (

                  /* SOLD OUT */

                  <div className="text-center py-5">

                    <div className="text-4xl mb-3">
                      🎟️
                    </div>

                    <p className="text-red-500 font-semibold">
                      Tickets are sold out.
                    </p>

                  </div>

                ) : !showBookingForm ? (

                  /* =======================================
                     BOOK NOW VIEW
                  ======================================= */

                  <div className="space-y-3">

                    <p className="text-3xl font-bold text-orange-500">
                      KES{" "}
                      {Number(
                        event.price
                      ).toLocaleString()}
                    </p>

                    <p className="text-sm text-gray-400">
                      per ticket
                    </p>

                    <div className="flex justify-between text-sm text-gray-600">

                      <span>
                        Available
                      </span>

                      <span className="text-green-600 font-semibold">
                        {availableTickets}{" "}
                        tickets
                      </span>

                    </div>

                    <hr />

                    <button
                      type="button"
                      onClick={() =>
                        setShowBookingForm(
                          true
                        )
                      }
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition"
                    >
                      Book Now
                    </button>

                  </div>

                ) : (

                  /* =======================================
                     BOOKING FORM
                  ======================================= */

                  <form
                    onSubmit={
                      handleBooking
                    }
                    className="space-y-4"
                  >

                    <div>

                      <h3 className="font-bold text-gray-800 text-lg">
                        Book Tickets
                      </h3>

                      <p className="text-xs text-gray-400 mt-1">
                        Complete the details below to reserve your tickets.
                      </p>

                    </div>

                    {/* ERROR */}

                    {bookingError && (

                      <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2 rounded-lg">
                        {bookingError}
                      </div>

                    )}

                    {/* ===================================
                        NAME
                    =================================== */}

                    <div>

                      <label className="block text-gray-700 font-semibold mb-1 text-sm">
                        Full Name
                      </label>

                      <input
                        type="text"
                        value={guestName}
                        onChange={(e) =>
                          setGuestName(
                            e.target.value
                          )
                        }
                        placeholder="Your full name"
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-sm"
                        required
                      />

                    </div>

                    {/* ===================================
                        EMAIL
                    =================================== */}

                    <div>

                      <label className="block text-gray-700 font-semibold mb-1 text-sm">
                        Email
                      </label>

                      <input
                        type="email"
                        value={guestEmail}
                        onChange={(e) =>
                          setGuestEmail(
                            e.target.value
                          )
                        }
                        placeholder="your@email.com"
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-sm"
                        required
                      />

                    </div>

                    {/* ===================================
                        QUANTITY
                    =================================== */}

                    <div>

                      <label className="block text-gray-700 font-semibold mb-2 text-sm">
                        Tickets
                      </label>

                      <div className="flex items-center gap-4">

                        <button
                          type="button"
                          disabled={
                            quantity <= 1
                          }
                          onClick={() =>
                            setQuantity(
                              (q) =>
                                Math.max(
                                  1,
                                  q - 1
                                )
                            )
                          }
                          className="w-9 h-9 rounded-full bg-gray-200 hover:bg-gray-300 font-bold disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          -
                        </button>

                        <span className="text-lg font-bold min-w-6 text-center">
                          {quantity}
                        </span>

                        <button
                          type="button"
                          disabled={
                            quantity >=
                            availableTickets
                          }
                          onClick={() =>
                            setQuantity(
                              (q) =>
                                Math.min(
                                  availableTickets,
                                  q + 1
                                )
                            )
                          }
                          className="w-9 h-9 rounded-full bg-gray-200 hover:bg-gray-300 font-bold disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          +
                        </button>

                      </div>

                    </div>

                    {/* ===================================
                        PHONE
                    =================================== */}

                    <div>

                      <label className="block text-gray-700 font-semibold mb-1 text-sm">
                        M-Pesa Number
                      </label>

                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) =>
                          setPhone(
                            e.target.value
                          )
                        }
                        placeholder="0712345678"
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-sm"
                        required
                      />

                      <p className="text-[11px] text-gray-400 mt-1">
                        The M-Pesa payment prompt will be sent to this number.
                      </p>

                    </div>

                    {/* ===================================
                        PROMO CODE
                    =================================== */}

                    <div>

                      <label className="block text-gray-700 font-semibold mb-1 text-sm">
                        Promo Code
                        <span className="text-gray-400 font-normal ml-1">
                          (optional)
                        </span>
                      </label>

                      {!appliedPromo ? (

                        <div className="flex gap-2">

                          <input
                            type="text"
                            value={promoCode}
                            onChange={(e) =>
                              setPromoCode(
                                e.target.value.toUpperCase()
                              )
                            }
                            placeholder="e.g. EARLYBIRD20"
                            className="flex-1 min-w-0 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-sm uppercase"
                          />

                          <button
                            type="button"
                            onClick={
                              handleApplyPromo
                            }
                            disabled={
                              promoLoading ||
                              !promoCode.trim()
                            }
                            className="bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
                          >
                            {promoLoading
                              ? "Checking..."
                              : "Apply"}
                          </button>

                        </div>

                      ) : (

                        <div className="flex justify-between items-center bg-green-50 border border-green-200 rounded-lg p-3">

                          <div>

                            <p className="text-green-700 font-bold text-sm">
                              ✓{" "}
                              {
                                appliedPromo.code
                              }
                            </p>

                            <p className="text-green-600 text-xs mt-1">

                              {appliedPromo.discount_type ===
                              "percentage"
                                ? `${Number(
                                    appliedPromo.discount_value
                                  )}% discount applied`
                                : `KES ${Number(
                                    appliedPromo.discount_value
                                  ).toLocaleString()} discount applied`}

                            </p>

                          </div>

                          <button
                            type="button"
                            onClick={
                              handleRemovePromo
                            }
                            className="text-red-500 hover:text-red-600 text-xs font-semibold"
                          >
                            Remove
                          </button>

                        </div>

                      )}

                    </div>

                    {/* ===================================
                        PRICE SUMMARY
                    =================================== */}

                    <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 space-y-2">

                      <div className="flex justify-between text-sm">

                        <span className="text-gray-600">
                          {quantity}{" "}
                          ticket
                          {quantity > 1
                            ? "s"
                            : ""}
                        </span>

                        <span className="font-semibold text-gray-700">
                          KES{" "}
                          {originalTotal.toLocaleString()}
                        </span>

                      </div>

                      {appliedPromo && (

                        <>

                          <div className="flex justify-between text-sm">

                            <span className="text-green-600">
                              Discount
                            </span>

                            <span className="text-green-600 font-semibold">
                              - KES{" "}
                              {Number(
                                pricing.discountAmount
                              ).toLocaleString()}
                            </span>

                          </div>

                          <div className="flex justify-between text-xs">

                            <span className="text-gray-400">
                              Promo
                            </span>

                            <span className="text-gray-500 font-medium">
                              {
                                appliedPromo.code
                              }
                            </span>

                          </div>

                          <div className="border-t border-orange-200" />

                        </>

                      )}

                      <div className="flex justify-between items-center pt-1">

                        <span className="text-gray-700 font-semibold">
                          Total
                        </span>

                        <span className="font-bold text-orange-500 text-xl">
                          KES{" "}
                          {Number(
                            totalCost
                          ).toLocaleString()}
                        </span>

                      </div>

                    </div>

                    {/* ===================================
                        CONFIRM BOOKING
                    =================================== */}

                    <button
                      type="submit"
                      disabled={
                        bookingLoading ||
                        availableTickets <=
                          0
                      }
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {bookingLoading
                        ? "Processing..."
                        : totalCost <= 0
                        ? "Confirm Free Booking"
                        : `Confirm Booking — KES ${Number(
                            totalCost
                          ).toLocaleString()}`}
                    </button>

                    <p className="text-[11px] text-gray-400 text-center leading-relaxed">
                      Tickets will be temporarily reserved while you complete payment.
                    </p>

                    {/* ===================================
                        CANCEL
                    =================================== */}

                    <button
                      type="button"
                      disabled={
                        bookingLoading
                      }
                      onClick={() => {
                        setShowBookingForm(
                          false
                        );

                        setBookingError(
                          null
                        );

                        handleRemovePromo();
                      }}
                      className="w-full text-gray-400 hover:text-gray-600 text-sm text-center block pt-1 disabled:opacity-50"
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