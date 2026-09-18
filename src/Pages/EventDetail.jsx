// Pages/EventDetail.jsx

import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import QRCode from "qrcode";
import { jsPDF } from "jspdf";
import Swal from "sweetalert2";
import { Helmet } from "react-helmet-async";
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  CreditCard,
  Download,
  Loader2,
  Mail,
  MapPin,
  Minus,
  Plus,
  RefreshCw,
  Share2,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Tag,
  Ticket,
  User,
  Users,
  X,
  XCircle,
} from "lucide-react";

import api from "../Api/api";

/* =========================================================
   CONSTANTS
========================================================= */

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1507874457470-272b3c8d8ee2?w=1600";

/* =========================================================
   HELPERS
========================================================= */

function formatMoney(value) {
  return Number(value || 0).toLocaleString("en-KE");
}

function formatDate(date) {
  if (!date) return "Date TBA";

  try {
    return new Date(`${date}T00:00:00`).toLocaleDateString("en-KE", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return date;
  }
}

function formatShortDate(date) {
  if (!date) return "Date TBA";

  try {
    return new Date(`${date}T00:00:00`).toLocaleDateString("en-KE", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return date;
  }
}

function formatTime(time) {
  if (!time) return "Time TBA";

  try {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString("en-KE", {
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return time;
  }
}

function getBookingReference(bookingResult) {
  const booking = bookingResult?.booking || {};

  return booking.bookingReference || booking.booking_reference || "";
}

function getVerificationNumber(bookingReference) {
  if (!bookingReference) return "N/A";

  const cleaned = String(bookingReference)
    .replace(/-/g, "")
    .toUpperCase();

  return `KE-${cleaned.slice(0, 4)}-${cleaned.slice(-6)}`;
}

function getEventAvailableTickets(event) {
  return Number(
    event?.availableTickets ??
      event?.available_tickets ??
      0
  );
}

function getEventOrganizer(event) {
  return (
    event?.organizerName ||
    event?.organizer_name ||
    "Event Organizer"
  );
}

function getBookingGuestName(bookingResult) {
  const booking = bookingResult?.booking || {};

  return (
    booking.guestName ||
    booking.guest_name ||
    "Guest"
  );
}

function getBookingTotal(bookingResult) {
  const booking = bookingResult?.booking || {};

  return Number(
    booking.totalAmount ??
      booking.total_amount ??
      0
  );
}

function getBookingOriginalAmount(bookingResult) {
  const booking = bookingResult?.booking || {};

  return Number(
    booking.originalAmount ??
      booking.original_amount ??
      0
  );
}

function getBookingDiscount(bookingResult) {
  const booking = bookingResult?.booking || {};

  return Number(
    booking.discountAmount ??
      booking.discount_amount ??
      0
  );
}

/* =========================================================
   QR CODE
========================================================= */

function QRCodeImage({
  bookingResult,
  size = "large",
}) {
  const [qrSrc, setQrSrc] = useState("");

  useEffect(() => {
    let active = true;

    const generateQR = async () => {
      try {
        const bookingReference =
          getBookingReference(bookingResult);

        if (!bookingReference) return;

        /*
          IMPORTANT:
          Keep personal information out of the QR.
          The backend verifies the booking reference.
        */
        const qrText =
          `KARIBU:TICKET:${bookingReference}`;

        const qr = await QRCode.toDataURL(qrText, {
          width: 800,
          margin: 2,
          errorCorrectionLevel: "H",
        });

        if (active) {
          setQrSrc(qr);
        }
      } catch (error) {
        console.error(
          "QR generation failed:",
          error
        );
      }
    };

    if (bookingResult) {
      generateQR();
    }

    return () => {
      active = false;
    };
  }, [bookingResult]);

  const dimension =
    size === "small"
      ? "w-36 h-36"
      : "w-44 h-44 sm:w-48 sm:h-48";

  if (!qrSrc) {
    return (
      <div
        className={`${dimension} rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto`}
      >
        <div className="text-center">
          <Loader2
            size={25}
            className="animate-spin text-orange-500 mx-auto"
          />

          <p className="text-[10px] text-gray-400 mt-2">
            Generating QR...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="inline-flex bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
      <img
        src={qrSrc}
        alt="Karibu Event Ticket QR Code"
        className={`${dimension} object-contain`}
      />
    </div>
  );
}

/* =========================================================
   INFO ITEM
========================================================= */

function EventInfoItem({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="flex gap-3">
      <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center flex-shrink-0">
        <Icon size={18} />
      </div>

      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-[0.14em] font-black text-gray-400">
          {label}
        </p>

        <p className="text-sm font-bold text-gray-800 mt-1 leading-5">
          {value || "—"}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   TICKET DETAIL
========================================================= */

function TicketDetail({
  label,
  value,
}) {
  return (
    <div>
      <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.14em] font-black text-gray-400">
        {label}
      </p>

      <p className="text-xs sm:text-sm font-black text-gray-800 mt-1 break-words">
        {value || "—"}
      </p>
    </div>
  );
}

/* =========================================================
   DIGITAL TICKET
========================================================= */

function DigitalTicket({
  bookingResult,
  event,
  onDownload,
  downloading,
}) {
  const booking =
    bookingResult?.booking || {};

  const eventData =
    bookingResult?.event ||
    event ||
    {};

  const bookingReference =
    getBookingReference(bookingResult);

  const verificationNumber =
    getVerificationNumber(
      bookingReference
    );

  const guest =
    getBookingGuestName(
      bookingResult
    );

  const amount =
    getBookingTotal(
      bookingResult
    );

  const discount =
    getBookingDiscount(
      bookingResult
    );

  const quantity =
    Number(booking.quantity || 1);

  const [copied, setCopied] =
    useState(false);

  const copyVerification = async () => {
    try {
      await navigator.clipboard.writeText(
        verificationNumber
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch {
      Swal.fire({
        icon: "error",
        title: "Unable to copy",
        text: "Please copy the verification number manually.",
        confirmButtonColor: "#f97316",
      });
    }
  };

  return (
    <div className="space-y-5">
      {/* SUCCESS */}

      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-green-50 text-green-600 flex items-center justify-center mx-auto">
          <CheckCircle2 size={32} />
        </div>

        <h3 className="text-2xl font-black text-gray-900 mt-4">
          You're going!
        </h3>

        <p className="text-sm text-gray-500 mt-1">
          Your booking has been confirmed.
        </p>
      </div>

      {/* TICKET */}

      <div className="overflow-hidden rounded-[26px] border border-gray-200 bg-white shadow-[0_20px_60px_-30px_rgba(0,0,0,0.25)]">
        {/* TICKET HEADER */}

        <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-orange-500 to-orange-600 px-5 py-5 text-white">
          <div className="absolute -right-12 -top-12 w-36 h-36 rounded-full border-[20px] border-white/10" />

          <div className="absolute right-12 -bottom-14 w-28 h-28 rounded-full bg-white/5" />

          <div className="relative flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2">
                <Ticket size={15} />

                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-100">
                  Karibu Event
                </p>
              </div>

              <h4 className="font-black text-lg sm:text-xl mt-3 leading-tight line-clamp-2">
                {eventData.title}
              </h4>

              <p className="text-xs text-orange-100 mt-2">
                Official event ticket
              </p>
            </div>

            <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center flex-shrink-0 border border-white/10">
              <ShieldCheck size={23} />
            </div>
          </div>
        </div>

        {/* DETAILS */}

        <div className="p-5">
          <div className="grid grid-cols-2 gap-x-5 gap-y-5">
            <TicketDetail
              label="Date"
              value={formatShortDate(
                eventData.date
              )}
            />

            <TicketDetail
              label="Time"
              value={formatTime(
                eventData.time
              )}
            />

            <TicketDetail
              label="Attendee"
              value={guest}
            />

            <TicketDetail
              label="Tickets"
              value={`${quantity} ${
                quantity === 1
                  ? "Ticket"
                  : "Tickets"
              }`}
            />
          </div>

          <div className="mt-5 pt-5 border-t border-dashed border-gray-200">
            <div className="flex gap-3">
              <MapPin
                size={17}
                className="text-orange-500 mt-0.5 flex-shrink-0"
              />

              <div>
                <p className="text-[10px] uppercase tracking-[0.14em] font-black text-gray-400">
                  Venue
                </p>

                <p className="text-sm font-bold text-gray-800 mt-1">
                  {eventData.location ||
                    "Venue TBA"}

                  {eventData.county
                    ? `, ${eventData.county}`
                    : ""}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* PERFORATION */}

        <div className="relative h-6 flex items-center">
          <div className="absolute -left-3 w-6 h-6 rounded-full bg-[#f6f7f9] border-r border-gray-200" />

          <div className="absolute -right-3 w-6 h-6 rounded-full bg-[#f6f7f9] border-l border-gray-200" />

          <div className="w-full mx-5 border-t-2 border-dashed border-gray-200" />
        </div>

        {/* QR */}

        <div className="px-5 pt-3 pb-6 text-center">
          <QRCodeImage
            bookingResult={bookingResult}
          />

          <div className="mt-4">
            <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 border border-green-100 rounded-full px-3 py-1.5 text-[10px] font-black">
              <ShieldCheck size={13} />
              VERIFIED TICKET
            </span>

            <p className="text-[9px] uppercase tracking-[0.18em] font-black text-gray-400 mt-5">
              Verification Number
            </p>

            <button
              type="button"
              onClick={
                copyVerification
              }
              className="inline-flex items-center gap-2 mt-1 group"
            >
              <span className="font-mono text-lg sm:text-xl tracking-wider font-black text-gray-900">
                {verificationNumber}
              </span>

              {copied ? (
                <Check
                  size={15}
                  className="text-green-500"
                />
              ) : (
                <Copy
                  size={14}
                  className="text-gray-300 group-hover:text-orange-500 transition"
                />
              )}
            </button>

            <p className="text-[10px] text-gray-400 mt-2">
              Present this QR code at the event entrance.
            </p>
          </div>
        </div>

        {/* TICKET FOOTER */}

        <div className="bg-gray-50 border-t border-gray-100 px-5 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[9px] text-gray-400 font-black uppercase tracking-wider">
                Amount Paid
              </p>

              <p className="font-black text-gray-900 mt-1">
                {amount <= 0
                  ? "FREE"
                  : `KES ${formatMoney(
                      amount
                    )}`}
              </p>
            </div>

            {discount > 0 && (
              <div className="text-center">
                <p className="text-[9px] text-gray-400 font-black uppercase tracking-wider">
                  Saved
                </p>

                <p className="font-black text-green-600 mt-1">
                  KES{" "}
                  {formatMoney(
                    discount
                  )}
                </p>
              </div>
            )}

            <div className="text-right">
              <p className="text-[9px] text-gray-400 font-black uppercase tracking-wider">
                Status
              </p>

              <p className="text-green-600 font-black text-xs mt-1">
                CONFIRMED
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* DOWNLOAD */}

      <button
        type="button"
        onClick={onDownload}
        disabled={downloading}
        className="w-full h-13 min-h-[52px] rounded-2xl bg-gray-900 hover:bg-black text-white font-black text-sm flex items-center justify-center gap-2 transition disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {downloading ? (
          <>
            <Loader2
              size={18}
              className="animate-spin"
            />
            Creating PDF...
          </>
        ) : (
          <>
            <Download size={18} />
            Download PDF Ticket
          </>
        )}
      </button>

      <p className="text-center text-[11px] text-gray-400 leading-5 px-4">
        Save the PDF ticket to your phone and present
        the QR code when entering the event.
      </p>
    </div>
  );
}

/* =========================================================
   EVENT DETAIL PAGE
========================================================= */

export default function EventDetail() {
  const { id } = useParams();

  const navigate =
    useNavigate();

  /* =======================================================
     USER
  ======================================================= */

  let savedUser = null;

  try {
    savedUser = JSON.parse(
      localStorage.getItem("user") ||
        "null"
    );
  } catch {
    savedUser = null;
  }

  const isLoggedIn =
    !!savedUser;

  /* =======================================================
     EVENT STATE
  ======================================================= */

  const [event, setEvent] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);

  /* =======================================================
     BOOKING
  ======================================================= */

  const [quantity, setQuantity] =
    useState(1);

  const [phone, setPhone] =
    useState(
      isLoggedIn
        ? savedUser?.phone_number ||
            ""
        : ""
    );

  const [guestName, setGuestName] =
    useState(
      isLoggedIn
        ? savedUser?.name ||
            savedUser?.full_name ||
            ""
        : ""
    );

  const [guestEmail, setGuestEmail] =
    useState(
      isLoggedIn
        ? savedUser?.email || ""
        : ""
    );

  const [
    bookingLoading,
    setBookingLoading,
  ] = useState(false);

  const [
    bookingError,
    setBookingError,
  ] = useState(null);

  const [
    bookingResult,
    setBookingResult,
  ] = useState(null);

  const [
    showBookingForm,
    setShowBookingForm,
  ] = useState(false);

  const [
    paymentStatus,
    setPaymentStatus,
  ] = useState("idle");

  const [
    downloadingTicket,
    setDownloadingTicket,
  ] = useState(false);

  /* =======================================================
     PROMO
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
     POLLING
  ======================================================= */

  const pollingIntervalRef =
    useRef(null);

  const pollingTimeoutRef =
    useRef(null);

  /* =======================================================
     FETCH EVENT
  ======================================================= */

  const fetchEvent = async (
    showError = true
  ) => {
    try {
      const res =
        await api.get(
          `/api/events/${id}`
        );

      const eventData =
        res.data?.event ||
        res.data;

      setEvent(eventData);

      setError(null);

      return eventData;
    } catch (err) {
      const message =
        err.response?.data
          ?.message ||
        err.message ||
        "Failed to load event.";

      setError(message);

      if (showError) {
        Swal.fire({
          icon: "error",
          title:
            "Failed to load event",
          text: message,
          confirmButtonColor:
            "#f97316",
        });
      }

      return null;
    }
  };

  useEffect(() => {
    const loadEvent =
      async () => {
        setLoading(true);

        await fetchEvent();

        setLoading(false);
      };

    loadEvent();
  }, [id]);

  /* =======================================================
     POLLING CLEANUP
  ======================================================= */

  const stopPaymentPolling = () => {
    if (
      pollingIntervalRef.current
    ) {
      clearInterval(
        pollingIntervalRef.current
      );

      pollingIntervalRef.current =
        null;
    }

    if (
      pollingTimeoutRef.current
    ) {
      clearTimeout(
        pollingTimeoutRef.current
      );

      pollingTimeoutRef.current =
        null;
    }
  };

  useEffect(() => {
    return () => {
      stopPaymentPolling();
    };
  }, []);

  /* =======================================================
     RESET PRICING WHEN QUANTITY CHANGES
  ======================================================= */

  useEffect(() => {
    if (!event) return;

    const originalAmount =
      Number(event.price || 0) *
      Number(quantity || 1);

    if (appliedPromo) {
      setAppliedPromo(null);
      setPromoCode("");
    }

    setPricing({
      originalAmount,
      discountAmount: 0,
      finalAmount:
        originalAmount,
    });
  }, [
    quantity,
    event?.price,
  ]);

  /* =======================================================
     PRICING
  ======================================================= */

  const originalTotal = event
    ? Number(event.price || 0) *
      Number(quantity || 1)
    : 0;

  const totalCost =
    appliedPromo
      ? Number(
          pricing.finalAmount ||
            0
        )
      : originalTotal;

  /* =======================================================
     EVENT STATUS
  ======================================================= */

  const availableTickets =
    getEventAvailableTickets(
      event
    );

  const totalTickets =
    Number(
      event?.totalTickets ??
        event?.total_tickets ??
        0
    );

  const isSoldOut =
    availableTickets <= 0;

  let isPast = false;

  if (event?.date) {
    const eventDate =
      new Date(
        `${event.date}T${
          event.time ||
          "23:59:59"
        }`
      );

    isPast =
      eventDate < new Date();
  }

  const soldTickets =
    totalTickets > 0
      ? Math.max(
          0,
          totalTickets -
            availableTickets
        )
      : 0;

  const soldPercentage =
    totalTickets > 0
      ? Math.min(
          100,
          Math.round(
            (soldTickets /
              totalTickets) *
              100
          )
        )
      : 0;

  /* =======================================================
     PROMO CODE
  ======================================================= */

  const handleApplyPromo =
    async () => {
      if (
        !promoCode.trim()
      ) {
        Swal.fire({
          icon: "warning",
          title:
            "Enter Promo Code",
          text:
            "Please enter a promo code first.",
          confirmButtonColor:
            "#f97316",
        });

        return;
      }

      if (!event) return;

      setPromoLoading(true);

      try {
        const res =
          await api.post(
            "/api/promo-codes/validate/",
            {
              event_id:
                event.id,

              code: promoCode
                .trim()
                .toUpperCase(),

              quantity,
            }
          );

        const data =
          res.data;

        if (!data.valid) {
          throw new Error(
            data.message ||
              "Promo code is invalid."
          );
        }

        setAppliedPromo(
          data.promo
        );

        setPricing({
          originalAmount:
            Number(
              data.pricing
                .original_amount
            ),

          discountAmount:
            Number(
              data.pricing
                .discount_amount
            ),

          finalAmount:
            Number(
              data.pricing
                .final_amount
            ),
        });

        setPromoCode(
          data.promo.code
        );

        Swal.fire({
          icon: "success",
          title:
            "Promo Applied!",
          text: `You saved KES ${formatMoney(
            data.pricing
              .discount_amount
          )}`,
          confirmButtonColor:
            "#f97316",
          timer: 1800,
          showConfirmButton:
            false,
        });
      } catch (err) {
        console.error(
          "Promo validation error:",
          err
        );

        setAppliedPromo(null);

        setPricing({
          originalAmount:
            originalTotal,
          discountAmount: 0,
          finalAmount:
            originalTotal,
        });

        Swal.fire({
          icon: "error",
          title:
            "Promo Code Not Applied",
          text:
            err.response?.data
              ?.message ||
            err.message ||
            "This promo code cannot be used.",
          confirmButtonColor:
            "#f97316",
        });
      } finally {
        setPromoLoading(false);
      }
    };

  const handleRemovePromo =
    () => {
      setPromoCode("");

      setAppliedPromo(null);

      setPricing({
        originalAmount:
          originalTotal,
        discountAmount: 0,
        finalAmount:
          originalTotal,
      });
    };

  /* =======================================================
     PAYMENT POLLING
  ======================================================= */

  const pollPaymentStatus = (
    bookingId
  ) => {
    stopPaymentPolling();

    const checkStatus =
      async () => {
        try {
          const res =
            await api.get(
              `/api/events/bookings/${bookingId}/status/`
            );

          const data =
            res.data;

          /* SUCCESS */

          if (
            data.payment_status ===
              "paid" &&
            data.booking_status ===
              "confirmed"
          ) {
            setPaymentStatus(
              "paid"
            );

            setBookingResult(
              (prev) => {
                if (!prev) {
                  return null;
                }

                return {
                  ...prev,

                  booking: {
                    ...prev.booking,

                    payment_status:
                      "paid",

                    status:
                      "confirmed",

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

                    original_amount:
                      Number(
                        data.original_amount
                      ),

                    discountAmount:
                      Number(
                        data.discount_amount
                      ),

                    discount_amount:
                      Number(
                        data.discount_amount
                      ),
                  },
                };
              }
            );

            stopPaymentPolling();

            Swal.fire({
              icon: "success",
              title:
                "Payment Successful!",
              text:
                "Your booking has been confirmed and your ticket is ready.",
              confirmButtonColor:
                "#f97316",
            });

            await fetchEvent(
              false
            );

            return;
          }

          /* EXPIRED */

          if (
            data.booking_status ===
            "expired"
          ) {
            setPaymentStatus(
              "expired"
            );

            stopPaymentPolling();

            await fetchEvent(
              false
            );

            Swal.fire({
              icon: "warning",
              title:
                "Booking Expired",
              text:
                "The payment window expired and your reserved tickets were released.",
              confirmButtonColor:
                "#f97316",
            });

            return;
          }

          /* FAILED */

          if (
            data.payment_status ===
              "failed" ||
            data.booking_status ===
              "cancelled"
          ) {
            setPaymentStatus(
              "failed"
            );

            stopPaymentPolling();

            await fetchEvent(
              false
            );

            Swal.fire({
              icon: "error",
              title:
                "Payment Failed",
              text:
                "Your payment was unsuccessful and your reserved tickets have been released.",
              confirmButtonColor:
                "#f97316",
            });
          }
        } catch (err) {
          console.error(
            "Payment polling error:",
            err
          );
        }
      };

    checkStatus();

    pollingIntervalRef.current =
      setInterval(
        checkStatus,
        5000
      );

    pollingTimeoutRef.current =
      setTimeout(() => {
        stopPaymentPolling();

        fetchEvent(false);
      }, 300000);
  };

  /* =======================================================
     BOOK EVENT
  ======================================================= */

  const handleBooking =
    async (e) => {
      e.preventDefault();

      setBookingError(null);

      if (
        !guestName.trim()
      ) {
        setBookingError(
          "Please enter your full name."
        );

        return;
      }

      if (
        !guestEmail.trim()
      ) {
        setBookingError(
          "Please enter your email address."
        );

        return;
      }

      const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (
        !emailRegex.test(
          guestEmail.trim()
        )
      ) {
        setBookingError(
          "Please enter a valid email address."
        );

        return;
      }

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

      if (
        quantity <= 0 ||
        quantity >
          availableTickets
      ) {
        setBookingError(
          "Invalid ticket quantity."
        );

        return;
      }

      setBookingLoading(true);

      try {
        const res =
          await api.post(
            "/api/events/book/",
            {
              userId:
                isLoggedIn
                  ? savedUser?.user_id ??
                    savedUser?.id ??
                    null
                  : null,

              eventId:
                event.id,

              quantity,

              phoneNumber:
                phone.trim(),

              guestName:
                guestName.trim(),

              guestEmail:
                guestEmail
                  .trim()
                  .toLowerCase(),

              promoCode:
                appliedPromo
                  ? appliedPromo.code
                  : null,
            }
          );

        const data =
          res.data;

        setBookingResult(
          data
        );

        /*
          Optimistic inventory update.
          Backend remains source of truth.
        */
        setEvent((prev) => {
          if (!prev) {
            return prev;
          }

          const currentAvailable =
            getEventAvailableTickets(
              prev
            );

          const newAvailable =
            Math.max(
              0,
              currentAvailable -
                Number(quantity)
            );

          return {
            ...prev,
            availableTickets:
              newAvailable,
            available_tickets:
              newAvailable,
          };
        });

        /* FREE EVENT */

        if (
          Number(
            data.booking
              ?.totalAmount ??
              data.booking
                ?.total_amount ??
              totalCost
          ) <= 0 &&
          data.booking?.status ===
            "confirmed"
        ) {
          setPaymentStatus(
            "paid"
          );

          Swal.fire({
            icon: "success",
            title:
              "Booking Confirmed!",
            text:
              "Your free ticket is ready.",
            confirmButtonColor:
              "#f97316",
          });

          return;
        }

        /* M-PESA */

        setPaymentStatus(
          "pending"
        );

        if (
          data.booking?.id
        ) {
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
          err.response?.data
            ?.message ||
          err.message ||
          "An unexpected error occurred. Please try again.";

        setBookingError(
          message
        );

        Swal.fire({
          icon: "error",
          title:
            "Booking Failed",
          text: message,
          confirmButtonColor:
            "#f97316",
        });

        await fetchEvent(
          false
        );
      } finally {
        setBookingLoading(
          false
        );
      }
    };

  /* =======================================================
     DOWNLOAD PDF TICKET
  ======================================================= */

  const handleDownloadTicket =
    async () => {
      try {
        if (
          !bookingResult?.booking
        ) {
          return;
        }

        setDownloadingTicket(
          true
        );

        const booking =
          bookingResult.booking;

        const eventData =
          bookingResult?.event ||
          event;

        const bookingReference =
          getBookingReference(
            bookingResult
          );

        if (
          !bookingReference
        ) {
          Swal.fire({
            icon: "error",
            title:
              "Ticket unavailable",
            text:
              "The booking reference could not be found.",
            confirmButtonColor:
              "#f97316",
          });

          return;
        }

        const verificationNumber =
          getVerificationNumber(
            bookingReference
          );

        const qrText =
          `KARIBU:TICKET:${bookingReference}`;

        const qrImage =
          await QRCode.toDataURL(
            qrText,
            {
              width: 1200,
              margin: 2,
              errorCorrectionLevel:
                "H",
            }
          );

        const guest =
          getBookingGuestName(
            bookingResult
          );

        const bookingQuantity =
          Number(
            booking.quantity ||
              1
          );

        const amount =
          getBookingTotal(
            bookingResult
          );

        const discount =
          getBookingDiscount(
            bookingResult
          );

        const eventTitle =
          eventData?.title ||
          "Karibu Event";

        const eventLocation =
          eventData?.location ||
          "Venue TBA";

        const eventCounty =
          eventData?.county ||
          "";

        const eventDate =
          eventData?.date;

        const eventTime =
          eventData?.time;

        /* =============================================
           CREATE PDF
        ============================================= */

        const pdf =
          new jsPDF({
            orientation:
              "landscape",
            unit: "mm",
            format: [
              210,
              105,
            ],
          });

        const width =
          pdf.internal.pageSize.getWidth();

        const height =
          pdf.internal.pageSize.getHeight();

        /* BACKGROUND */

        pdf.setFillColor(
          245,
          246,
          248
        );

        pdf.rect(
          0,
          0,
          width,
          height,
          "F"
        );

        /* SHADOW */

        pdf.setFillColor(
          225,
          225,
          225
        );

        pdf.roundedRect(
          7,
          8,
          width - 12,
          height - 12,
          4,
          4,
          "F"
        );

        /* TICKET */

        pdf.setFillColor(
          255,
          255,
          255
        );

        pdf.roundedRect(
          6,
          6,
          width - 12,
          height - 12,
          4,
          4,
          "F"
        );

        /* LEFT BRAND */

        pdf.setFillColor(
          249,
          115,
          22
        );

        pdf.roundedRect(
          6,
          6,
          48,
          height - 12,
          4,
          4,
          "F"
        );

        pdf.rect(
          45,
          6,
          9,
          height - 12,
          "F"
        );

        /* BRAND */

        pdf.setTextColor(
          255,
          255,
          255
        );

        pdf.setFont(
          "helvetica",
          "bold"
        );

        pdf.setFontSize(
          18
        );

        pdf.text(
          "KARIBU",
          14,
          20
        );

        pdf.setFontSize(
          10
        );

        pdf.text(
          "EVENT",
          14,
          26
        );

        pdf.setFont(
          "helvetica",
          "normal"
        );

        pdf.setFontSize(
          6.5
        );

        pdf.text(
          "Discover. Book. Experience.",
          14,
          32
        );

        /* ADMIT */

        pdf.setFont(
          "helvetica",
          "bold"
        );

        pdf.setFontSize(
          7
        );

        pdf.text(
          "ADMIT",
          14,
          53
        );

        pdf.setFontSize(
          28
        );

        pdf.text(
          String(
            bookingQuantity
          ),
          14,
          67
        );

        pdf.setFontSize(
          6.5
        );

        pdf.text(
          bookingQuantity ===
            1
            ? "ATTENDEE"
            : "ATTENDEES",
          14,
          74
        );

        pdf.setFont(
          "helvetica",
          "normal"
        );

        pdf.setFontSize(
          5.5
        );

        pdf.text(
          "Valid only for the event",
          14,
          86
        );

        pdf.text(
          "shown on this ticket.",
          14,
          90
        );

        /* PERFORATION */

        pdf.setDrawColor(
          215,
          215,
          215
        );

        pdf.setLineDashPattern(
          [2, 2],
          0
        );

        pdf.line(
          58,
          12,
          58,
          height - 12
        );

        pdf.setLineDashPattern(
          [],
          0
        );

        /* OFFICIAL */

        pdf.setFont(
          "helvetica",
          "bold"
        );

        pdf.setFontSize(
          6.5
        );

        pdf.setTextColor(
          249,
          115,
          22
        );

        pdf.text(
          "OFFICIAL EVENT TICKET",
          65,
          16
        );

        /* TITLE */

        pdf.setTextColor(
          25,
          25,
          25
        );

        pdf.setFontSize(
          16
        );

        const titleLines =
          pdf.splitTextToSize(
            eventTitle,
            80
          );

        pdf.text(
          titleLines.slice(
            0,
            2
          ),
          65,
          25
        );

        let y =
          titleLines.length >
          1
            ? 41
            : 35;

        /* DATE */

        pdf.setFont(
          "helvetica",
          "normal"
        );

        pdf.setFontSize(
          5.5
        );

        pdf.setTextColor(
          145,
          145,
          145
        );

        pdf.text(
          "DATE & TIME",
          65,
          y
        );

        pdf.setTextColor(
          40,
          40,
          40
        );

        pdf.setFont(
          "helvetica",
          "bold"
        );

        pdf.setFontSize(
          7.5
        );

        pdf.text(
          `${formatShortDate(
            eventDate
          )}  |  ${formatTime(
            eventTime
          )}`,
          65,
          y + 5
        );

        /* VENUE */

        pdf.setFont(
          "helvetica",
          "normal"
        );

        pdf.setFontSize(
          5.5
        );

        pdf.setTextColor(
          145,
          145,
          145
        );

        pdf.text(
          "VENUE",
          65,
          y + 13
        );

        pdf.setFont(
          "helvetica",
          "bold"
        );

        pdf.setFontSize(
          7
        );

        pdf.setTextColor(
          40,
          40,
          40
        );

        const venue =
          eventCounty
            ? `${eventLocation}, ${eventCounty}`
            : eventLocation;

        const venueLines =
          pdf.splitTextToSize(
            venue,
            75
          );

        pdf.text(
          venueLines.slice(
            0,
            1
          ),
          65,
          y + 18
        );

        /* ATTENDEE */

        pdf.setFont(
          "helvetica",
          "normal"
        );

        pdf.setFontSize(
          5.5
        );

        pdf.setTextColor(
          145,
          145,
          145
        );

        pdf.text(
          "ATTENDEE",
          65,
          y + 27
        );

        pdf.setFont(
          "helvetica",
          "bold"
        );

        pdf.setFontSize(
          8
        );

        pdf.setTextColor(
          40,
          40,
          40
        );

        const guestLines =
          pdf.splitTextToSize(
            guest,
            50
          );

        pdf.text(
          guestLines.slice(
            0,
            1
          ),
          65,
          y + 32
        );

        /* AMOUNT */

        pdf.setFont(
          "helvetica",
          "normal"
        );

        pdf.setFontSize(
          5.5
        );

        pdf.setTextColor(
          145,
          145,
          145
        );

        pdf.text(
          "AMOUNT PAID",
          119,
          y + 27
        );

        pdf.setFont(
          "helvetica",
          "bold"
        );

        pdf.setFontSize(
          8
        );

        pdf.setTextColor(
          40,
          40,
          40
        );

        pdf.text(
          amount <= 0
            ? "FREE"
            : `KES ${formatMoney(
                amount
              )}`,
          119,
          y + 32
        );

        /* VERIFICATION BOX */

        pdf.setFillColor(
          255,
          247,
          237
        );

        pdf.roundedRect(
          65,
          height - 28,
          82,
          14,
          2,
          2,
          "F"
        );

        pdf.setTextColor(
          160,
          90,
          30
        );

        pdf.setFont(
          "helvetica",
          "normal"
        );

        pdf.setFontSize(
          5
        );

        pdf.text(
          "VERIFICATION NUMBER",
          69,
          height - 22
        );

        pdf.setFont(
          "helvetica",
          "bold"
        );

        pdf.setFontSize(
          10
        );

        pdf.setTextColor(
          249,
          115,
          22
        );

        pdf.text(
          verificationNumber,
          69,
          height - 17
        );

        /* QR */

        pdf.addImage(
          qrImage,
          "PNG",
          158,
          17,
          35,
          35
        );

        pdf.setFont(
          "helvetica",
          "bold"
        );

        pdf.setFontSize(
          6
        );

        pdf.setTextColor(
          45,
          45,
          45
        );

        pdf.text(
          "SCAN TO VERIFY",
          175.5,
          57,
          {
            align: "center",
          }
        );

        pdf.setFont(
          "helvetica",
          "normal"
        );

        pdf.setFontSize(
          5
        );

        pdf.setTextColor(
          145,
          145,
          145
        );

        pdf.text(
          "Present this QR code",
          175.5,
          61,
          {
            align: "center",
          }
        );

        pdf.text(
          "at the event entrance.",
          175.5,
          64,
          {
            align: "center",
          }
        );

        /* BOOKING REFERENCE */

        pdf.setFontSize(
          4.5
        );

        pdf.text(
          "BOOKING REFERENCE",
          175.5,
          73,
          {
            align: "center",
          }
        );

        pdf.setFont(
          "courier",
          "normal"
        );

        pdf.setFontSize(
          4.4
        );

        const referenceLines =
          pdf.splitTextToSize(
            String(
              bookingReference
            ),
            35
          );

        pdf.text(
          referenceLines.slice(
            0,
            2
          ),
          175.5,
          77,
          {
            align: "center",
          }
        );

        /* DISCOUNT */

        if (discount > 0) {
          pdf.setFont(
            "helvetica",
            "bold"
          );

          pdf.setFontSize(
            5
          );

          pdf.setTextColor(
            22,
            163,
            74
          );

          pdf.text(
            `You saved KES ${formatMoney(
              discount
            )}`,
            175.5,
            87,
            {
              align: "center",
            }
          );
        }

        /* FOOTER */

        pdf.setFont(
          "helvetica",
          "normal"
        );

        pdf.setFontSize(
          4.8
        );

        pdf.setTextColor(
          150,
          150,
          150
        );

        pdf.text(
          "Issued securely by Karibu Event  |  karibuevent.online",
          65,
          height - 7
        );

        /* DOWNLOAD */

        const safeTitle =
          eventTitle
            .replace(
              /[^a-z0-9]/gi,
              "-"
            )
            .replace(
              /-+/g,
              "-"
            )
            .replace(
              /^-|-$|/g,
              ""
            )
            .toLowerCase();

        pdf.save(
          `${
            safeTitle ||
            "karibu-event"
          }-ticket-${verificationNumber}.pdf`
        );
      } catch (err) {
        console.error(
          "Ticket PDF generation failed:",
          err
        );

        Swal.fire({
          icon: "error",
          title:
            "Ticket download failed",
          text:
            "We couldn't generate your PDF ticket. Please try again.",
          confirmButtonColor:
            "#f97316",
        });
      } finally {
        setDownloadingTicket(
          false
        );
      }
    };

  /* =======================================================
     TRY AGAIN
  ======================================================= */

  const handleTryAgain =
    async () => {
      stopPaymentPolling();

      setBookingResult(
        null
      );

      setPaymentStatus(
        "idle"
      );

      setBookingError(
        null
      );

      setAppliedPromo(
        null
      );

      setPromoCode("");

      setQuantity(1);

      setShowBookingForm(
        true
      );

      await fetchEvent(
        false
      );
    };

  /* =======================================================
     SHARE
  ======================================================= */

  const handleShare =
    async () => {
      const shareUrl =
        `https://www.karibuevent.online/events/${event.id}`;

      const shareData = {
        title: event.title,
        text: `Check out ${event.title} on Karibu Event.`,
        url: shareUrl,
      };

      try {
        if (
          navigator.share
        ) {
          await navigator.share(
            shareData
          );

          return;
        }

        await navigator.clipboard.writeText(
          shareUrl
        );

        Swal.fire({
          icon: "success",
          title:
            "Link copied",
          text:
            "The event link has been copied to your clipboard.",
          confirmButtonColor:
            "#f97316",
          timer: 1600,
          showConfirmButton:
            false,
        });
      } catch (err) {
        if (
          err?.name ===
          "AbortError"
        ) {
          return;
        }

        console.error(
          "Share failed:",
          err
        );
      }
    };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f7f9] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center mx-auto">
            <Loader2
              size={25}
              className="animate-spin text-orange-500"
            />
          </div>

          <p className="font-bold text-gray-700 mt-4">
            Loading event
          </p>

          <p className="text-xs text-gray-400 mt-1">
            Getting everything ready...
          </p>
        </div>
      </div>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (
    error ||
    !event
  ) {
    return (
      <div className="min-h-screen bg-[#f6f7f9] flex items-center justify-center px-4">
        <div className="bg-white border border-gray-100 rounded-[28px] shadow-sm p-8 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle
              size={30}
            />
          </div>

          <h2 className="text-xl font-black text-gray-900 mt-5">
            Event unavailable
          </h2>

          <p className="text-sm text-gray-500 leading-6 mt-2">
            {error ||
              "This event could not be loaded."}
          </p>

          <div className="grid grid-cols-2 gap-3 mt-6">
            <button
              type="button"
              onClick={() =>
                navigate(-1)
              }
              className="h-11 rounded-xl border border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 transition"
            >
              Go Back
            </button>

            <button
              type="button"
              onClick={() =>
                window.location.reload()
              }
              className="h-11 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-screen bg-[#f6f7f9] text-gray-900">
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
          TOP ACTION BAR
      =================================================== */}

      <div className="absolute top-0 left-0 right-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex justify-between items-center">
          <button
            type="button"
            onClick={() =>
              navigate(-1)
            }
            className="h-11 px-4 rounded-xl bg-black/30 hover:bg-black/45 backdrop-blur-md text-white border border-white/15 flex items-center gap-2 text-sm font-bold transition"
          >
            <ArrowLeft size={17} />

            <span className="hidden sm:inline">
              Back
            </span>
          </button>

          <button
            type="button"
            onClick={
              handleShare
            }
            className="h-11 px-4 rounded-xl bg-black/30 hover:bg-black/45 backdrop-blur-md text-white border border-white/15 flex items-center gap-2 text-sm font-bold transition"
          >
            <Share2 size={17} />

            <span className="hidden sm:inline">
              Share Event
            </span>
          </button>
        </div>
      </div>

      {/* ===================================================
          HERO
      =================================================== */}

      <section className="relative">
        <div className="h-[420px] sm:h-[480px] lg:h-[540px] relative overflow-hidden bg-gray-900">
          <img
            src={
              event.image ||
              FALLBACK_IMAGE
            }
            alt={event.title}
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src =
                FALLBACK_IMAGE;
            }}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/20" />

          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />

          <div className="absolute inset-x-0 bottom-0">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-9 sm:pb-11 lg:pb-14">
              <div className="max-w-4xl">
                <div className="flex flex-wrap gap-2">
                  {event.category && (
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-orange-500 text-white text-[11px] font-black shadow-sm">
                      {event.category}
                    </span>
                  )}

                  {isPast ? (
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-white/15 backdrop-blur text-white border border-white/15 text-[11px] font-black">
                      Event Ended
                    </span>
                  ) : isSoldOut ? (
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-red-500 text-white text-[11px] font-black">
                      Sold Out
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur text-white border border-white/15 text-[11px] font-black">
                      <Sparkles
                        size={12}
                      />
                      Tickets Available
                    </span>
                  )}
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-[52px] font-black text-white mt-4 leading-[1.05] tracking-tight">
                  {event.title}
                </h1>

                <div className="flex flex-wrap gap-x-6 gap-y-3 mt-6 text-sm text-white/90">
                  <div className="flex items-center gap-2">
                    <CalendarDays
                      size={17}
                      className="text-orange-400"
                    />

                    <span className="font-medium">
                      {formatShortDate(
                        event.date
                      )}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock
                      size={17}
                      className="text-orange-400"
                    />

                    <span className="font-medium">
                      {formatTime(
                        event.time
                      )}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin
                      size={17}
                      className="text-orange-400"
                    />

                    <span className="font-medium">
                      {event.location}

                      {event.county
                        ? `, ${event.county}`
                        : ""}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================
          MAIN
      =================================================== */}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_400px] xl:grid-cols-[minmax(0,1fr)_420px] gap-7 lg:gap-10 items-start">
          {/* =================================================
              LEFT
          ================================================= */}

          <div className="space-y-6">
            {/* EVENT INFO */}

            <section className="bg-white border border-gray-100 rounded-[26px] p-5 sm:p-7 shadow-sm">
              <div className="grid sm:grid-cols-2 gap-6">
                <EventInfoItem
                  icon={
                    CalendarDays
                  }
                  label="Date"
                  value={formatDate(
                    event.date
                  )}
                />

                <EventInfoItem
                  icon={Clock}
                  label="Time"
                  value={formatTime(
                    event.time
                  )}
                />

                <EventInfoItem
                  icon={MapPin}
                  label="Venue"
                  value={`${event.location || "Venue TBA"}${
                    event.county
                      ? `, ${event.county}`
                      : ""
                  }`}
                />

                <EventInfoItem
                  icon={User}
                  label="Organizer"
                  value={getEventOrganizer(
                    event
                  )}
                />
              </div>
            </section>

            {/* ABOUT */}

            <section className="bg-white border border-gray-100 rounded-[26px] p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-2 text-orange-500">
                <Sparkles
                  size={15}
                />

                <p className="text-[10px] uppercase tracking-[0.18em] font-black">
                  About the event
                </p>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mt-2">
                Event Details
              </h2>

              <p className="text-gray-600 leading-7 whitespace-pre-line mt-5 text-[15px]">
                {event.description ||
                  "More information about this event will be available soon."}
              </p>
            </section>

            {/* VENUE / ORGANIZER */}

            <div className="grid md:grid-cols-2 gap-6">
              <section className="bg-white border border-gray-100 rounded-[26px] p-6 shadow-sm">
                <div className="w-11 h-11 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center">
                  <MapPin
                    size={20}
                  />
                </div>

                <h3 className="font-black text-gray-900 text-lg mt-4">
                  Event Venue
                </h3>

                <p className="text-sm font-bold text-gray-700 mt-2">
                  {event.location ||
                    "Venue TBA"}
                </p>

                {event.county && (
                  <p className="text-sm text-gray-400 mt-1">
                    {event.county},{" "}
                    Kenya
                  </p>
                )}

                <p className="text-xs text-gray-400 leading-5 mt-4">
                  Check your ticket and event updates before travelling to the venue.
                </p>
              </section>

              <section className="bg-white border border-gray-100 rounded-[26px] p-6 shadow-sm">
                <div className="w-11 h-11 bg-gray-900 text-white rounded-xl flex items-center justify-center">
                  <Users
                    size={20}
                  />
                </div>

                <h3 className="font-black text-gray-900 text-lg mt-4">
                  Organized by
                </h3>

                <p className="text-sm font-bold text-gray-700 mt-2">
                  {getEventOrganizer(
                    event
                  )}
                </p>

                <div className="inline-flex items-center gap-1.5 text-green-600 bg-green-50 px-2.5 py-1 rounded-full text-[10px] font-black mt-3">
                  <ShieldCheck
                    size={12}
                  />
                  VERIFIED EVENT
                </div>
              </section>
            </div>

            {/* SAFE BOOKING */}

            <section className="bg-gray-900 text-white rounded-[26px] p-6 sm:p-7 overflow-hidden relative">
              <div className="absolute -right-12 -top-12 w-40 h-40 border-[25px] border-white/5 rounded-full" />

              <div className="relative flex flex-col sm:flex-row gap-5 sm:items-center">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <ShieldCheck
                    size={23}
                    className="text-orange-400"
                  />
                </div>

                <div>
                  <h3 className="font-black text-lg">
                    Secure ticket booking
                  </h3>

                  <p className="text-sm text-gray-400 leading-6 mt-1 max-w-2xl">
                    Payments are processed through M-Pesa. After confirmation, your secure QR ticket becomes available for download.
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* =================================================
              RIGHT / BOOKING CARD
          ================================================= */}

          <aside className="lg:sticky lg:top-6">
            <div className="bg-white border border-gray-100 rounded-[28px] shadow-[0_20px_70px_-35px_rgba(0,0,0,0.28)] overflow-hidden">
              {/* =============================================
                  PAYMENT PENDING
              ============================================= */}

              {bookingResult &&
                paymentStatus ===
                  "pending" && (
                  <div className="p-6 sm:p-7 text-center">
                    <div className="relative w-20 h-20 mx-auto">
                      <div className="absolute inset-0 bg-orange-100 rounded-full animate-ping opacity-50" />

                      <div className="relative w-20 h-20 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center">
                        <Smartphone
                          size={34}
                        />
                      </div>
                    </div>

                    <h3 className="text-2xl font-black text-gray-900 mt-6">
                      Check your phone
                    </h3>

                    <p className="text-sm text-gray-500 leading-6 mt-2">
                      We've sent an M-Pesa payment request to
                    </p>

                    <p className="font-black text-orange-500 text-lg mt-1">
                      {phone}
                    </p>

                    <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5 mt-5">
                      <p className="text-[10px] uppercase tracking-wider font-black text-orange-400">
                        Amount to Pay
                      </p>

                      <p className="font-black text-gray-900 text-2xl mt-1">
                        KES{" "}
                        {formatMoney(
                          bookingResult
                            .booking
                            ?.totalAmount ??
                            bookingResult
                              .booking
                              ?.total_amount ??
                            totalCost
                        )}
                      </p>
                    </div>

                    <div className="flex items-start gap-3 bg-gray-50 rounded-2xl p-4 text-left mt-5">
                      <Clock
                        size={17}
                        className="text-orange-500 mt-0.5 flex-shrink-0"
                      />

                      <p className="text-xs text-gray-500 leading-5">
                        Your tickets are temporarily reserved for approximately 5 minutes. Enter your M-Pesa PIN to complete payment.
                      </p>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-xs font-bold text-gray-400 mt-5">
                      <Loader2
                        size={15}
                        className="animate-spin text-orange-500"
                      />

                      Waiting for confirmation...
                    </div>

                    <p className="text-[10px] text-gray-400 mt-4">
                      Keep this page open while we confirm your payment.
                    </p>
                  </div>
                )}

              {/* =============================================
                  SUCCESS
              ============================================= */}

              {bookingResult &&
                paymentStatus ===
                  "paid" && (
                  <div className="p-5 sm:p-6">
                    <DigitalTicket
                      bookingResult={
                        bookingResult
                      }
                      event={event}
                      onDownload={
                        handleDownloadTicket
                      }
                      downloading={
                        downloadingTicket
                      }
                    />
                  </div>
                )}

              {/* =============================================
                  FAILED
              ============================================= */}

              {bookingResult &&
                paymentStatus ===
                  "failed" && (
                  <div className="p-7 text-center">
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
                      <XCircle
                        size={30}
                      />
                    </div>

                    <h3 className="text-2xl font-black text-gray-900 mt-5">
                      Payment failed
                    </h3>

                    <p className="text-sm text-gray-500 leading-6 mt-2">
                      Your M-Pesa payment was not completed. Your reserved tickets have been released.
                    </p>

                    <button
                      type="button"
                      onClick={
                        handleTryAgain
                      }
                      className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 mt-6 transition"
                    >
                      <RefreshCw
                        size={16}
                      />
                      Try Again
                    </button>
                  </div>
                )}

              {/* =============================================
                  EXPIRED
              ============================================= */}

              {bookingResult &&
                paymentStatus ===
                  "expired" && (
                  <div className="p-7 text-center">
                    <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto">
                      <Clock
                        size={30}
                      />
                    </div>

                    <h3 className="text-2xl font-black text-gray-900 mt-5">
                      Booking expired
                    </h3>

                    <p className="text-sm text-gray-500 leading-6 mt-2">
                      The payment window expired before payment was confirmed. Your reserved tickets have been released.
                    </p>

                    <button
                      type="button"
                      onClick={
                        handleTryAgain
                      }
                      className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 mt-6 transition"
                    >
                      <RefreshCw
                        size={16}
                      />
                      Book Again
                    </button>
                  </div>
                )}

              {/* =============================================
                  DEFAULT
              ============================================= */}

              {!bookingResult && (
                <>
                  {isPast ? (
                    <div className="p-7 text-center">
                      <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto">
                        <CalendarDays
                          size={29}
                        />
                      </div>

                      <h3 className="text-xl font-black text-gray-900 mt-5">
                        This event has ended
                      </h3>

                      <p className="text-sm text-gray-500 mt-2">
                        Ticket sales are no longer available.
                      </p>
                    </div>
                  ) : isSoldOut ? (
                    <div className="p-7 text-center">
                      <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
                        <Ticket
                          size={29}
                        />
                      </div>

                      <h3 className="text-xl font-black text-gray-900 mt-5">
                        Sold out
                      </h3>

                      <p className="text-sm text-gray-500 mt-2">
                        There are currently no tickets remaining for this event.
                      </p>
                    </div>
                  ) : !showBookingForm ? (
                    /* =======================================
                       BOOK NOW
                    ======================================= */

                    <div>
                      <div className="p-6 sm:p-7">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.16em] font-black text-gray-400">
                              Ticket Price
                            </p>

                            <p className="text-3xl font-black text-gray-900 mt-1">
                              {Number(
                                event.price
                              ) <= 0
                                ? "FREE"
                                : `KES ${formatMoney(
                                    event.price
                                  )}`}
                            </p>

                            {Number(
                              event.price
                            ) > 0 && (
                              <p className="text-xs text-gray-400 mt-1">
                                per ticket
                              </p>
                            )}
                          </div>

                          <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center">
                            <Ticket
                              size={22}
                            />
                          </div>
                        </div>

                        <div className="mt-6 space-y-4">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500">
                              Tickets available
                            </span>

                            <span className="font-black text-green-600">
                              {availableTickets}
                            </span>
                          </div>

                          {totalTickets >
                            0 && (
                            <div>
                              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-orange-500 rounded-full transition-all"
                                  style={{
                                    width: `${soldPercentage}%`,
                                  }}
                                />
                              </div>

                              <div className="flex justify-between text-[10px] text-gray-400 mt-2">
                                <span>
                                  {
                                    soldTickets
                                  }{" "}
                                  sold
                                </span>

                                <span>
                                  {
                                    totalTickets
                                  }{" "}
                                  total
                                </span>
                              </div>
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            setShowBookingForm(
                              true
                            )
                          }
                          className="w-full h-13 min-h-[52px] bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 mt-6 transition shadow-lg shadow-orange-500/15"
                        >
                          <Ticket
                            size={17}
                          />
                          Book Tickets
                        </button>
                      </div>

                      <div className="bg-gray-50 border-t border-gray-100 px-6 py-4">
                        <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-gray-400">
                          <ShieldCheck
                            size={13}
                            className="text-green-500"
                          />

                          Secure booking powered by Karibu Event
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* =======================================
                       BOOKING FORM
                    ======================================= */

                    <form
                      onSubmit={
                        handleBooking
                      }
                    >
                      {/* HEADER */}

                      <div className="px-6 pt-6 pb-5 border-b border-gray-100">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.16em] font-black text-orange-500">
                              Secure Checkout
                            </p>

                            <h3 className="font-black text-gray-900 text-xl mt-1">
                              Book your tickets
                            </h3>

                            <p className="text-xs text-gray-400 mt-1">
                              Complete your details below.
                            </p>
                          </div>

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
                            className="w-9 h-9 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-400 flex items-center justify-center transition disabled:opacity-50"
                          >
                            <X
                              size={17}
                            />
                          </button>
                        </div>
                      </div>

                      <div className="p-6 space-y-5">
                        {/* ERROR */}

                        {bookingError && (
                          <div className="bg-red-50 border border-red-100 text-red-600 rounded-xl p-3 flex gap-2.5">
                            <AlertCircle
                              size={16}
                              className="mt-0.5 flex-shrink-0"
                            />

                            <p className="text-xs leading-5 font-medium">
                              {
                                bookingError
                              }
                            </p>
                          </div>
                        )}

                        {/* NAME */}

                        <div>
                          <label className="block text-[11px] uppercase tracking-wider text-gray-500 font-black mb-2">
                            Full Name
                          </label>

                          <div className="relative">
                            <User
                              size={17}
                              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300"
                            />

                            <input
                              type="text"
                              value={
                                guestName
                              }
                              onChange={(
                                e
                              ) =>
                                setGuestName(
                                  e.target
                                    .value
                                )
                              }
                              placeholder="Your full name"
                              className="w-full h-12 pl-11 pr-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 transition text-sm"
                              required
                            />
                          </div>
                        </div>

                        {/* EMAIL */}

                        <div>
                          <label className="block text-[11px] uppercase tracking-wider text-gray-500 font-black mb-2">
                            Email Address
                          </label>

                          <div className="relative">
                            <Mail
                              size={17}
                              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300"
                            />

                            <input
                              type="email"
                              value={
                                guestEmail
                              }
                              onChange={(
                                e
                              ) =>
                                setGuestEmail(
                                  e.target
                                    .value
                                )
                              }
                              placeholder="you@example.com"
                              className="w-full h-12 pl-11 pr-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 transition text-sm"
                              required
                            />
                          </div>
                        </div>

                        {/* QUANTITY */}

                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <label className="text-[11px] uppercase tracking-wider text-gray-500 font-black">
                              Number of Tickets
                            </label>

                            <span className="text-[10px] text-green-600 font-black">
                              {
                                availableTickets
                              }{" "}
                              available
                            </span>
                          </div>

                          <div className="bg-gray-50 border border-gray-200 rounded-xl p-2 flex items-center justify-between">
                            <button
                              type="button"
                              disabled={
                                quantity <=
                                1
                              }
                              onClick={() =>
                                setQuantity(
                                  (
                                    q
                                  ) =>
                                    Math.max(
                                      1,
                                      q -
                                        1
                                    )
                                )
                              }
                              className="w-10 h-10 rounded-lg bg-white border border-gray-200 hover:border-orange-300 hover:text-orange-500 flex items-center justify-center transition disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              <Minus
                                size={17}
                              />
                            </button>

                            <div className="text-center">
                              <p className="font-black text-xl text-gray-900">
                                {
                                  quantity
                                }
                              </p>

                              <p className="text-[9px] text-gray-400 font-bold uppercase">
                                {quantity ===
                                1
                                  ? "ticket"
                                  : "tickets"}
                              </p>
                            </div>

                            <button
                              type="button"
                              disabled={
                                quantity >=
                                availableTickets
                              }
                              onClick={() =>
                                setQuantity(
                                  (
                                    q
                                  ) =>
                                    Math.min(
                                      availableTickets,
                                      q +
                                        1
                                    )
                                )
                              }
                              className="w-10 h-10 rounded-lg bg-white border border-gray-200 hover:border-orange-300 hover:text-orange-500 flex items-center justify-center transition disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              <Plus
                                size={17}
                              />
                            </button>
                          </div>
                        </div>

                        {/* M-PESA */}

                        <div>
                          <label className="block text-[11px] uppercase tracking-wider text-gray-500 font-black mb-2">
                            M-Pesa Number
                          </label>

                          <div className="relative">
                            <Smartphone
                              size={17}
                              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300"
                            />

                            <input
                              type="tel"
                              value={
                                phone
                              }
                              onChange={(
                                e
                              ) =>
                                setPhone(
                                  e.target
                                    .value
                                )
                              }
                              placeholder="0712345678"
                              className="w-full h-12 pl-11 pr-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 transition text-sm"
                              required
                            />
                          </div>

                          <p className="text-[10px] text-gray-400 mt-2 leading-4">
                            The M-Pesa payment prompt will be sent to this number.
                          </p>
                        </div>

                        {/* PROMO */}

                        <div>
                          <label className="block text-[11px] uppercase tracking-wider text-gray-500 font-black mb-2">
                            Promo Code{" "}
                            <span className="normal-case tracking-normal font-medium text-gray-300">
                              — optional
                            </span>
                          </label>

                          {!appliedPromo ? (
                            <div className="flex gap-2">
                              <div className="relative flex-1 min-w-0">
                                <Tag
                                  size={16}
                                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300"
                                />

                                <input
                                  type="text"
                                  value={
                                    promoCode
                                  }
                                  onChange={(
                                    e
                                  ) =>
                                    setPromoCode(
                                      e.target.value.toUpperCase()
                                    )
                                  }
                                  placeholder="EARLYBIRD20"
                                  className="w-full h-11 pl-10 pr-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 transition text-xs uppercase font-bold"
                                />
                              </div>

                              <button
                                type="button"
                                onClick={
                                  handleApplyPromo
                                }
                                disabled={
                                  promoLoading ||
                                  !promoCode.trim()
                                }
                                className="h-11 px-4 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-black transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                              >
                                {promoLoading && (
                                  <Loader2
                                    size={13}
                                    className="animate-spin"
                                  />
                                )}

                                {promoLoading
                                  ? "Checking"
                                  : "Apply"}
                              </button>
                            </div>
                          ) : (
                            <div className="bg-green-50 border border-green-100 rounded-xl p-3 flex items-center justify-between gap-3">
                              <div className="flex gap-2.5">
                                <div className="w-8 h-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <Check
                                    size={15}
                                  />
                                </div>

                                <div>
                                  <p className="text-green-800 font-black text-xs">
                                    {
                                      appliedPromo.code
                                    }
                                  </p>

                                  <p className="text-green-600 text-[10px] mt-0.5">
                                    {appliedPromo.discount_type ===
                                    "percentage"
                                      ? `${Number(
                                          appliedPromo.discount_value
                                        )}% discount applied`
                                      : `KES ${formatMoney(
                                          appliedPromo.discount_value
                                        )} discount applied`}
                                  </p>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={
                                  handleRemovePromo
                                }
                                className="text-red-500 hover:text-red-600 text-[10px] font-black"
                              >
                                Remove
                              </button>
                            </div>
                          )}
                        </div>

                        {/* SUMMARY */}

                        <div className="bg-orange-50/70 border border-orange-100 rounded-2xl p-4 space-y-3">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">
                              {quantity}{" "}
                              ticket
                              {quantity >
                              1
                                ? "s"
                                : ""}
                            </span>

                            <span className="font-bold text-gray-700">
                              KES{" "}
                              {formatMoney(
                                originalTotal
                              )}
                            </span>
                          </div>

                          {appliedPromo && (
                            <>
                              <div className="flex justify-between text-xs">
                                <span className="text-green-600">
                                  Discount
                                </span>

                                <span className="text-green-600 font-black">
                                  - KES{" "}
                                  {formatMoney(
                                    pricing.discountAmount
                                  )}
                                </span>
                              </div>

                              <div className="flex justify-between text-[10px]">
                                <span className="text-gray-400">
                                  Promo
                                </span>

                                <span className="text-gray-500 font-bold">
                                  {
                                    appliedPromo.code
                                  }
                                </span>
                              </div>

                              <div className="border-t border-orange-200" />
                            </>
                          )}

                          <div className="flex justify-between items-end">
                            <div>
                              <p className="text-[10px] uppercase tracking-wider font-black text-gray-400">
                                Total
                              </p>

                              <p className="text-[10px] text-gray-400 mt-0.5">
                                Final amount
                              </p>
                            </div>

                            <span className="font-black text-orange-500 text-xl">
                              {totalCost <=
                              0
                                ? "FREE"
                                : `KES ${formatMoney(
                                    totalCost
                                  )}`}
                            </span>
                          </div>
                        </div>

                        {/* SUBMIT */}

                        <button
                          type="submit"
                          disabled={
                            bookingLoading ||
                            availableTickets <=
                              0
                          }
                          className="w-full min-h-[52px] bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-orange-500/15 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {bookingLoading ? (
                            <>
                              <Loader2
                                size={17}
                                className="animate-spin"
                              />

                              Processing...
                            </>
                          ) : totalCost <=
                            0 ? (
                            <>
                              <Ticket
                                size={17}
                              />
                              Confirm Free Booking
                            </>
                          ) : (
                            <>
                              <CreditCard
                                size={17}
                              />

                              Pay KES{" "}
                              {formatMoney(
                                totalCost
                              )}
                            </>
                          )}
                        </button>

                        <div className="flex items-start gap-2 justify-center">
                          <ShieldCheck
                            size={13}
                            className="text-green-500 mt-0.5 flex-shrink-0"
                          />

                          <p className="text-[10px] text-gray-400 text-center leading-4">
                            Tickets are temporarily reserved while you complete payment.
                          </p>
                        </div>
                      </div>
                    </form>
                  )}
                </>
              )}
            </div>
          </aside>
        </div>
      </main>

      {/* ===================================================
          MOBILE BOTTOM BOOKING BAR
          Only when card is still in default state
      =================================================== */}

      {!bookingResult &&
        !showBookingForm &&
        !isPast &&
        !isSoldOut && (
          <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-gray-200 px-4 py-3 shadow-[0_-10px_40px_-20px_rgba(0,0,0,0.3)]">
            <div className="max-w-lg mx-auto flex items-center gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-[9px] uppercase tracking-wider text-gray-400 font-black">
                  Ticket price
                </p>

                <p className="text-lg font-black text-gray-900 truncate">
                  {Number(
                    event.price
                  ) <= 0
                    ? "FREE"
                    : `KES ${formatMoney(
                        event.price
                      )}`}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowBookingForm(
                    true
                  );

                  window.scrollTo({
                    top:
                      document.body
                        .scrollHeight,
                    behavior:
                      "smooth",
                  });
                }}
                className="h-12 px-7 bg-orange-500 text-white rounded-xl font-black text-sm flex items-center gap-2 shadow-lg shadow-orange-500/20"
              >
                <Ticket
                  size={16}
                />
                Book Now
              </button>
            </div>
          </div>
        )}

      {/* SPACE FOR MOBILE BAR */}

      {!bookingResult &&
        !showBookingForm &&
        !isPast &&
        !isSoldOut && (
          <div className="lg:hidden h-20" />
        )}
    </div>
  );
}