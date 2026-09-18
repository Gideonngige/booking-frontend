import React, { useEffect, useMemo, useState } from "react";
import {
  Navigate,
  useNavigate,
} from "react-router-dom";

import {
  FaCalendarAlt,
  FaTicketAlt,
  FaMoneyBillWave,
  FaUsers,
  FaQrcode,
  FaPlus,
  FaEye,
  FaChartLine,
  FaMapMarkerAlt,
  FaClock,
  FaCheckCircle,
  FaHourglassHalf,
  FaTag,
  FaEllipsisV,
  FaSyncAlt,
  FaCalendarCheck,
  FaTimesCircle,
} from "react-icons/fa";

import {
  MdPendingActions,
  MdVerified,
} from "react-icons/md";

import FloatingParticles from "../Components/Floating-particles";
import api from "../Api/api";
import Swal from "sweetalert2";

export default function CreatorDashboard() {
  const navigate = useNavigate();

  /* =========================================================
     USER
  ========================================================= */

  let user = null;

  try {
    user = localStorage.getItem("user")
      ? JSON.parse(localStorage.getItem("user"))
      : null;
  } catch {
    user = null;
  }

  /* =========================================================
     STATE
  ========================================================= */

  const [events, setEvents] = useState([]);

  const [summary, setSummary] = useState({
    total_events: 0,
    tickets_sold: 0,
    available_tickets: 0,
    reserved_tickets: 0,
    checked_in_tickets: 0,
    revenue: 0,
  });

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState(null);

  const [openMenu, setOpenMenu] =
    useState(null);

  /* =========================================================
     REDIRECTS
  ========================================================= */

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (user.role !== "organizer") {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  /* =========================================================
     FETCH ORGANIZER EVENTS
  ========================================================= */

  const fetchEvents = async (
    showMainLoader = false
  ) => {
    try {
      if (showMainLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError(null);

      const res = await api.get(
        "/get_organizer_events/"
      );

      const returnedEvents =
        res.data?.events || [];

      const returnedSummary =
        res.data?.summary || {};

      setEvents(returnedEvents);

      setSummary({
        total_events:
          returnedSummary.total_events ??
          returnedEvents.length,

        tickets_sold:
          Number(
            returnedSummary.tickets_sold ??
              0
          ),

        available_tickets:
          Number(
            returnedSummary.available_tickets ??
              0
          ),

        reserved_tickets:
          Number(
            returnedSummary.reserved_tickets ??
              0
          ),

        checked_in_tickets:
          Number(
            returnedSummary.checked_in_tickets ??
              0
          ),

        revenue:
          Number(
            returnedSummary.revenue ??
              0
          ),
      });
    } catch (err) {
      console.error(
        "Failed to fetch organizer events:",
        err
      );

      const message =
        err.response?.data?.message ||
        "An unexpected error occurred while loading your events.";

      setError(message);

      if (!showMainLoader) {
        Swal.fire({
          icon: "error",
          title: "Unable to refresh",
          text: message,
          confirmButtonColor: "#f97316",
        });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    fetchEvents(true);
  }, []);

  /* =========================================================
     CLOSE ACTION MENU
  ========================================================= */

  useEffect(() => {
    const closeMenu = () => {
      setOpenMenu(null);
    };

    window.addEventListener(
      "click",
      closeMenu
    );

    return () => {
      window.removeEventListener(
        "click",
        closeMenu
      );
    };
  }, []);

  /* =========================================================
     CALCULATED STATISTICS
  ========================================================= */

  const verifiedEvents = useMemo(
    () =>
      events.filter(
        (event) => event.is_verified
      ).length,
    [events]
  );

  const pendingVerificationEvents =
    useMemo(
      () =>
        events.filter(
          (event) => !event.is_verified
        ).length,
      [events]
    );

  /* =========================================================
     BEST PERFORMING EVENT
  ========================================================= */

  const bestEvent = useMemo(() => {
    if (!events.length) {
      return null;
    }

    return events.reduce(
      (best, current) => {
        if (
          Number(
            current.tickets_sold || 0
          ) >
          Number(
            best.tickets_sold || 0
          )
        ) {
          return current;
        }

        return best;
      }
    );
  }, [events]);

  /* =========================================================
     EVENT STATUS
  ========================================================= */

  const getEventStatus = (event) => {
    const eventDate = new Date(
      `${event.date}T${
        event.time || "23:59:59"
      }`
    );

    const now = new Date();

    const soldOut =
      Number(
        event.available_tickets
      ) <= 0;

    if (eventDate < now) {
      return {
        label: "Ended",
        className:
          "bg-gray-100 text-gray-600",
      };
    }

    if (soldOut) {
      return {
        label: "Sold Out",
        className:
          "bg-red-100 text-red-600",
      };
    }

    if (!event.is_verified) {
      return {
        label: "Pending Verification",
        className:
          "bg-yellow-100 text-yellow-700",
      };
    }

    return {
      label: "Active",
      className:
        "bg-green-100 text-green-700",
    };
  };

  /* =========================================================
     FORMAT DATE
  ========================================================= */

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(
      `${date}T00:00:00`
    ).toLocaleDateString(
      "en-KE",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  /* =========================================================
     FORMAT TIME
  ========================================================= */

  const formatTime = (time) => {
    if (!time) {
      return "-";
    }

    try {
      return new Date(
        `2000-01-01T${time}`
      ).toLocaleTimeString(
        "en-KE",
        {
          hour: "2-digit",
          minute: "2-digit",
        }
      );
    } catch {
      return time;
    }
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-orange-500 to-gray-900 flex items-center justify-center">

        <div className="text-center">

          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto" />

          <p className="text-white mt-4 font-medium">
            Loading your dashboard...
          </p>

        </div>

      </div>
    );
  }

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <div className="min-h-screen bg-gray-100">

      {/* =====================================================
          TOP HEADER
      ===================================================== */}

      <div className="relative overflow-hidden bg-gradient-to-r from-orange-500 to-gray-900">

        <FloatingParticles />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

            {/* LEFT */}

            <div>

              <p className="text-orange-100 text-sm font-medium mb-1">
                Organizer Workspace
              </p>

              <h1 className="text-3xl md:text-4xl font-bold text-white">
                Creator Dashboard
              </h1>

              <p className="text-orange-100 text-sm mt-2">
                Welcome back,{" "}
                <span className="font-semibold text-white">
                  {user.name ||
                    user.username ||
                    "Organizer"}
                </span>
              </p>

            </div>

            {/* RIGHT */}

            <div className="flex flex-wrap gap-3">

              <button
                type="button"
                onClick={() =>
                  fetchEvents(false)
                }
                disabled={refreshing}
                className="flex items-center gap-2 bg-white/10 border border-white/20 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-white/20 transition disabled:opacity-50"
              >

                <FaSyncAlt
                  className={
                    refreshing
                      ? "animate-spin"
                      : ""
                  }
                />

                {refreshing
                  ? "Refreshing..."
                  : "Refresh"}

              </button>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/create-event"
                  )
                }
                className="flex items-center gap-2 bg-white text-orange-500 px-5 py-2.5 rounded-xl font-bold hover:bg-orange-50 transition shadow"
              >

                <FaPlus />

                Create Event

              </button>

            </div>

          </div>

          {/* =================================================
              QUICK STATUS
          ================================================= */}

          <div className="flex flex-wrap gap-3 mt-7">

            <div className="bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm text-white flex items-center gap-2">

              <MdVerified className="text-green-300" />

              {verifiedEvents} Verified

            </div>

            <div className="bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm text-white flex items-center gap-2">

              <MdPendingActions className="text-yellow-300" />

              {pendingVerificationEvents} Pending Verification

            </div>

          </div>

        </div>

      </div>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7">

        {/* ===================================================
            ERROR
        =================================================== */}

        {error && (

          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

            <div>

              <p className="font-semibold text-red-700">
                Failed to load dashboard
              </p>

              <p className="text-sm text-red-600 mt-1">
                {error}
              </p>

            </div>

            <button
              type="button"
              onClick={() =>
                fetchEvents(false)
              }
              className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold"
            >
              Try Again
            </button>

          </div>

        )}

        {/* ===================================================
            MAIN STATS
        =================================================== */}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

          <StatCard
            title="Total Events"
            value={
              summary.total_events
            }
            icon={
              <FaCalendarAlt />
            }
            description="Events created"
          />

          <StatCard
            title="Tickets Sold"
            value={
              summary.tickets_sold
            }
            icon={
              <FaTicketAlt />
            }
            description="Successfully paid tickets"
          />

          <StatCard
            title="Checked In"
            value={
              summary.checked_in_tickets
            }
            icon={
              <FaUsers />
            }
            description="Attendees admitted"
          />

          <StatCard
            title="Revenue"
            value={`Ksh ${Number(
              summary.revenue
            ).toLocaleString()}`}
            icon={
              <FaMoneyBillWave />
            }
            description="Successful payments"
          />

        </div>

        {/* ===================================================
            SECONDARY STATS
        =================================================== */}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">

          <MiniStatCard
            title="Available Tickets"
            value={
              summary.available_tickets
            }
            icon={
              <FaTicketAlt />
            }
          />

          <MiniStatCard
            title="Reserved Tickets"
            value={
              summary.reserved_tickets
            }
            icon={
              <FaHourglassHalf />
            }
          />

          <MiniStatCard
            title="Verified Events"
            value={verifiedEvents}
            icon={
              <MdVerified />
            }
          />

        </div>

        {/* ===================================================
            YOUR EVENTS HEADER
        =================================================== */}

        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-visible">

          <div className="px-5 sm:px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

            <div>

              <h2 className="text-xl font-bold text-gray-800">
                Your Events
              </h2>

              <p className="text-sm text-gray-400 mt-1">
                Manage events, tickets,
                promotions and attendees.
              </p>

            </div>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/create-event"
                )
              }
              className="text-orange-500 hover:text-orange-600 font-semibold text-sm"
            >
              + New Event
            </button>

          </div>

          {/* =================================================
              NO EVENTS
          ================================================= */}

          {events.length === 0 ? (

            <div className="text-center py-16 px-4">

              <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto">

                <FaCalendarAlt className="text-orange-500 text-2xl" />

              </div>

              <h3 className="text-lg font-bold text-gray-700 mt-4">
                No events yet
              </h3>

              <p className="text-gray-400 text-sm mt-2 max-w-md mx-auto">
                Create your first event and
                start selling tickets through
                Karibu Event.
              </p>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/create-event"
                  )
                }
                className="mt-5 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-semibold"
              >
                Create Your First Event
              </button>

            </div>

          ) : (

            <>
              {/* =============================================
                  DESKTOP TABLE
              ============================================= */}

              <div className="hidden lg:block overflow-visible">

                <table className="w-full">

                  <thead className="bg-gray-50">

                    <tr className="text-xs uppercase tracking-wide text-gray-500">

                      <th className="px-5 py-3 text-left">
                        Event
                      </th>

                      <th className="px-4 py-3 text-left">
                        Date
                      </th>

                      <th className="px-4 py-3 text-left">
                        Tickets
                      </th>

                      <th className="px-4 py-3 text-left">
                        Revenue
                      </th>

                      <th className="px-4 py-3 text-left">
                        Sales
                      </th>

                      <th className="px-4 py-3 text-left">
                        Status
                      </th>

                      <th className="px-4 py-3 text-right">
                        Actions
                      </th>

                    </tr>

                  </thead>

                  <tbody className="divide-y divide-gray-100">

                    {events.map(
                      (event) => {

                        const status =
                          getEventStatus(
                            event
                          );

                        const sales =
                          Math.min(
                            100,
                            Number(
                              event.sales_percentage ||
                                0
                            )
                          );

                        return (
                          <tr
                            key={event.id}
                            className="hover:bg-gray-50/70 transition"
                          >

                            {/* EVENT */}

                            <td className="px-5 py-4">

                              <div className="flex items-center gap-3">

                                <img
                                  src={
                                    event.image
                                  }
                                  alt={
                                    event.title
                                  }
                                  className="w-12 h-12 rounded-xl object-cover bg-gray-100"
                                  onError={(e) => {
                                    e.currentTarget.style.display =
                                      "none";
                                  }}
                                />

                                <div className="min-w-0">

                                  <p className="font-bold text-gray-800 max-w-[220px] truncate">
                                    {
                                      event.title
                                    }
                                  </p>

                                  <p className="text-xs text-gray-400 mt-1">
                                    {event.category ||
                                      "Event"}
                                  </p>

                                  <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-1">

                                    <FaMapMarkerAlt />

                                    <span className="max-w-[180px] truncate">
                                      {event.location ||
                                        event.county ||
                                        "-"}
                                    </span>

                                  </div>

                                </div>

                              </div>

                            </td>

                            {/* DATE */}

                            <td className="px-4 py-4">

                              <p className="text-sm font-medium text-gray-700">
                                {formatDate(
                                  event.date
                                )}
                              </p>

                              <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">

                                <FaClock />

                                {formatTime(
                                  event.time
                                )}

                              </p>

                            </td>

                            {/* TICKETS */}

                            <td className="px-4 py-4">

                              <p className="text-sm font-bold text-gray-700">
                                {
                                  event.tickets_sold
                                }
                                /
                                {
                                  event.total_tickets
                                }
                              </p>

                              <p className="text-xs text-gray-400 mt-1">
                                {
                                  event.available_tickets
                                }{" "}
                                available
                              </p>

                              {Number(
                                event.reserved_tickets
                              ) > 0 && (

                                <p className="text-xs text-yellow-600 mt-1">
                                  {
                                    event.reserved_tickets
                                  }{" "}
                                  reserved
                                </p>

                              )}

                            </td>

                            {/* REVENUE */}

                            <td className="px-4 py-4">

                              <p className="font-bold text-orange-500">
                                Ksh{" "}
                                {Number(
                                  event.revenue ||
                                    0
                                ).toLocaleString()}
                              </p>

                              <p className="text-xs text-gray-400 mt-1">
                                {
                                  event.successful_bookings
                                }{" "}
                                bookings
                              </p>

                            </td>

                            {/* SALES */}

                            <td className="px-4 py-4 min-w-[130px]">

                              <div className="flex items-center justify-between text-xs mb-1">

                                <span className="text-gray-500">
                                  {sales}%
                                </span>

                              </div>

                              <div className="w-full bg-gray-100 rounded-full h-2">

                                <div
                                  className="bg-orange-500 h-2 rounded-full"
                                  style={{
                                    width: `${sales}%`,
                                  }}
                                />

                              </div>

                              <p className="text-[11px] text-gray-400 mt-1">
                                {
                                  event.checked_in_tickets
                                }{" "}
                                checked in
                              </p>

                            </td>

                            {/* STATUS */}

                            <td className="px-4 py-4">

                              <span
                                className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${status.className}`}
                              >
                                {
                                  status.label
                                }
                              </span>

                              <div className="mt-2">

                                {event.is_verified ? (

                                  <span className="text-[11px] text-green-600 flex items-center gap-1">

                                    <FaCheckCircle />

                                    Verified

                                  </span>

                                ) : (

                                  <span className="text-[11px] text-yellow-600 flex items-center gap-1">

                                    <MdPendingActions />

                                    Awaiting approval

                                  </span>

                                )}

                              </div>

                            </td>

                            {/* ACTIONS */}

                            <td className="px-4 py-4 text-right relative">

                              <button
                                type="button"
                                onClick={(
                                  e
                                ) => {
                                  e.stopPropagation();

                                  setOpenMenu(
                                    openMenu ===
                                      event.id
                                      ? null
                                      : event.id
                                  );
                                }}
                                className="w-9 h-9 inline-flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500"
                              >
                                <FaEllipsisV />
                              </button>

                              {openMenu ===
                                event.id && (

                                <EventActionMenu
                                  event={
                                    event
                                  }
                                  navigate={
                                    navigate
                                  }
                                  close={() =>
                                    setOpenMenu(
                                      null
                                    )
                                  }
                                />

                              )}

                            </td>

                          </tr>
                        );
                      }
                    )}

                  </tbody>

                </table>

              </div>

              {/* =============================================
                  MOBILE / TABLET CARDS
              ============================================= */}

              <div className="lg:hidden p-4 space-y-4">

                {events.map(
                  (event) => {

                    const status =
                      getEventStatus(
                        event
                      );

                    const sales =
                      Math.min(
                        100,
                        Number(
                          event.sales_percentage ||
                            0
                        )
                      );

                    return (
                      <div
                        key={event.id}
                        className="border border-gray-100 rounded-2xl overflow-hidden"
                      >

                        {/* IMAGE */}

                        {event.image && (

                          <img
                            src={event.image}
                            alt={event.title}
                            className="w-full h-40 object-cover"
                          />

                        )}

                        <div className="p-4">

                          {/* TITLE */}

                          <div className="flex justify-between gap-3">

                            <div>

                              <h3 className="font-bold text-gray-800 text-lg">
                                {
                                  event.title
                                }
                              </h3>

                              <p className="text-xs text-gray-400 mt-1">
                                {event.category ||
                                  "Event"}
                              </p>

                            </div>

                            <span
                              className={`h-fit px-2.5 py-1 rounded-full text-xs font-semibold ${status.className}`}
                            >
                              {
                                status.label
                              }
                            </span>

                          </div>

                          {/* LOCATION */}

                          <div className="mt-4 space-y-2 text-sm text-gray-500">

                            <p className="flex items-center gap-2">

                              <FaCalendarAlt className="text-orange-500" />

                              {formatDate(
                                event.date
                              )}

                              <span>
                                •
                              </span>

                              {formatTime(
                                event.time
                              )}

                            </p>

                            <p className="flex items-center gap-2">

                              <FaMapMarkerAlt className="text-orange-500" />

                              {event.location ||
                                event.county ||
                                "-"}

                            </p>

                          </div>

                          {/* NUMBERS */}

                          <div className="grid grid-cols-3 gap-2 mt-5">

                            <SmallMetric
                              label="Sold"
                              value={
                                event.tickets_sold
                              }
                            />

                            <SmallMetric
                              label="Available"
                              value={
                                event.available_tickets
                              }
                            />

                            <SmallMetric
                              label="Reserved"
                              value={
                                event.reserved_tickets
                              }
                            />

                          </div>

                          {/* SALES */}

                          <div className="mt-5">

                            <div className="flex justify-between text-xs text-gray-500 mb-1">

                              <span>
                                Ticket sales
                              </span>

                              <span>
                                {sales}%
                              </span>

                            </div>

                            <div className="h-2 bg-gray-100 rounded-full">

                              <div
                                className="h-2 bg-orange-500 rounded-full"
                                style={{
                                  width: `${sales}%`,
                                }}
                              />

                            </div>

                          </div>

                          {/* REVENUE */}

                          <div className="flex items-center justify-between mt-5 border-t pt-4">

                            <div>

                              <p className="text-xs text-gray-400">
                                Revenue
                              </p>

                              <p className="font-bold text-orange-500">
                                Ksh{" "}
                                {Number(
                                  event.revenue ||
                                    0
                                ).toLocaleString()}
                              </p>

                            </div>

                            <div className="text-right">

                              <p className="text-xs text-gray-400">
                                Checked In
                              </p>

                              <p className="font-bold text-gray-700">
                                {
                                  event.checked_in_tickets
                                }
                              </p>

                            </div>

                          </div>

                          {/* MOBILE ACTIONS */}

                          <div className="grid grid-cols-2 gap-2 mt-5">

                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/event/${event.id}`
                                )
                              }
                              className="flex items-center justify-center gap-2 border border-gray-200 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50"
                            >
                              <FaEye />
                              View
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/verify-tickets/${event.id}`
                                )
                              }
                              className="flex items-center justify-center gap-2 bg-green-500 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-green-600"
                            >
                              <FaQrcode />
                              Verify
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/event/${event.id}/promo-codes`
                                )
                              }
                              className="flex items-center justify-center gap-2 border border-orange-200 text-orange-500 py-2.5 rounded-xl text-sm font-semibold hover:bg-orange-50"
                            >
                              <FaTag />
                              Promo Codes
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/event/${event.id}/analytics`
                                )
                              }
                              className="flex items-center justify-center gap-2 border border-blue-200 text-blue-600 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-50"
                            >
                              <FaChartLine />
                              Analytics
                            </button>

                          </div>

                        </div>

                      </div>
                    );
                  }
                )}

              </div>

            </>

          )}

        </div>

        {/* ===================================================
            INSIGHTS
        =================================================== */}

        <div className="grid lg:grid-cols-2 gap-5 mt-6">

          {/* =================================================
              SALES TIPS
          ================================================= */}

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">

            <div className="flex items-center gap-3 mb-4">

              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">

                <FaChartLine />

              </div>

              <div>

                <h3 className="font-bold text-gray-800">
                  Grow Your Ticket Sales
                </h3>

                <p className="text-xs text-gray-400">
                  Simple ways to improve event performance.
                </p>

              </div>

            </div>

            <div className="space-y-3">

              <Tip
                number="01"
                title="Share your event"
                description="Promote your booking link across WhatsApp, Instagram, TikTok, Facebook and X."
              />

              <Tip
                number="02"
                title="Use promo codes"
                description="Create early-bird or limited-time discounts to encourage faster bookings."
              />

              <Tip
                number="03"
                title="Improve your event page"
                description="Use a strong banner, clear description and complete event information."
              />

            </div>

          </div>

          {/* =================================================
              PERFORMANCE
          ================================================= */}

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">

            <div className="flex items-center gap-3 mb-5">

              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600">

                <FaCalendarCheck />

              </div>

              <div>

                <h3 className="font-bold text-gray-800">
                  Performance Summary
                </h3>

                <p className="text-xs text-gray-400">
                  A quick overview of your events.
                </p>

              </div>

            </div>

            {bestEvent ? (

              <div>

                <p className="text-sm text-gray-500">
                  Best performing event
                </p>

                <h4 className="text-xl font-bold text-gray-800 mt-1">
                  {bestEvent.title}
                </h4>

                <div className="grid grid-cols-2 gap-3 mt-5">

                  <PerformanceBox
                    label="Tickets Sold"
                    value={
                      bestEvent.tickets_sold
                    }
                  />

                  <PerformanceBox
                    label="Revenue"
                    value={`Ksh ${Number(
                      bestEvent.revenue ||
                        0
                    ).toLocaleString()}`}
                  />

                  <PerformanceBox
                    label="Sales Rate"
                    value={`${Number(
                      bestEvent.sales_percentage ||
                        0
                    )}%`}
                  />

                  <PerformanceBox
                    label="Checked In"
                    value={
                      bestEvent.checked_in_tickets
                    }
                  />

                </div>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `/event/${bestEvent.id}/analytics`
                    )
                  }
                  className="mt-5 text-orange-500 hover:text-orange-600 text-sm font-semibold flex items-center gap-2"
                >
                  <FaChartLine />

                  View Event Analytics
                </button>

              </div>

            ) : (

              <div className="text-center py-8">

                <FaCalendarAlt className="text-gray-300 text-4xl mx-auto" />

                <p className="text-gray-400 text-sm mt-3">
                  Create your first event to
                  start seeing performance
                  insights.
                </p>

              </div>

            )}

          </div>

        </div>

      </main>

    </div>
  );
}

/* =========================================================
   EVENT ACTION MENU
========================================================= */

function EventActionMenu({
  event,
  navigate,
  close,
}) {
  const go = (path) => {
    close();
    navigate(path);
  };

  return (
    <div
      onClick={(e) =>
        e.stopPropagation()
      }
      className="absolute right-4 top-12 z-50 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 text-left"
    >

      <ActionItem
        icon={<FaEye />}
        label="View Event"
        onClick={() =>
          go(`/event/${event.id}`)
        }
      />

      <ActionItem
        icon={<FaTag />}
        label="Promo Codes"
        onClick={() =>
          go(
            `/event/${event.id}/promo-codes`
          )
        }
      />

      <ActionItem
        icon={<FaUsers />}
        label="Attendees"
        onClick={() =>
          go(
            `/event/${event.id}/attendees`
          )
        }
      />

      <ActionItem
        icon={<FaQrcode />}
        label="Verify Tickets"
        onClick={() =>
          go(
            `/verify-tickets/${event.id}`
          )
        }
      />

      <ActionItem
        icon={<FaChartLine />}
        label="Analytics"
        onClick={() =>
          go(
            `/event/${event.id}/analytics`
          )
        }
      />

    </div>
  );
}

/* =========================================================
   ACTION ITEM
========================================================= */

function ActionItem({
  icon,
  label,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition"
    >

      <span className="w-5">
        {icon}
      </span>

      {label}

    </button>
  );
}

/* =========================================================
   MAIN STAT CARD
========================================================= */

function StatCard({
  title,
  value,
  icon,
  description,
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">

      <div className="flex items-start justify-between gap-3">

        <div>

          <p className="text-sm text-gray-400">
            {title}
          </p>

          <p className="text-xl md:text-2xl font-bold text-gray-800 mt-2 break-words">
            {value}
          </p>

        </div>

        <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center text-lg flex-shrink-0">
          {icon}
        </div>

      </div>

      <p className="text-xs text-gray-400 mt-3">
        {description}
      </p>

    </div>
  );
}

/* =========================================================
   MINI STAT CARD
========================================================= */

function MiniStatCard({
  title,
  value,
  icon,
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">

      <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-orange-500">
        {icon}
      </div>

      <div>

        <p className="text-xs text-gray-400">
          {title}
        </p>

        <p className="font-bold text-gray-800 text-lg">
          {value}
        </p>

      </div>

    </div>
  );
}

/* =========================================================
   SMALL METRIC
========================================================= */

function SmallMetric({
  label,
  value,
}) {
  return (
    <div className="bg-gray-50 rounded-xl p-3 text-center">

      <p className="text-lg font-bold text-gray-800">
        {value ?? 0}
      </p>

      <p className="text-[11px] text-gray-400 mt-1">
        {label}
      </p>

    </div>
  );
}

/* =========================================================
   TIP
========================================================= */

function Tip({
  number,
  title,
  description,
}) {
  return (
    <div className="flex gap-3 p-3 rounded-xl hover:bg-gray-50">

      <div className="w-9 h-9 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center text-xs font-bold flex-shrink-0">
        {number}
      </div>

      <div>

        <p className="font-semibold text-gray-700 text-sm">
          {title}
        </p>

        <p className="text-xs text-gray-400 mt-1 leading-relaxed">
          {description}
        </p>

      </div>

    </div>
  );
}

/* =========================================================
   PERFORMANCE BOX
========================================================= */

function PerformanceBox({
  label,
  value,
}) {
  return (
    <div className="bg-gray-50 rounded-xl p-4">

      <p className="text-xs text-gray-400">
        {label}
      </p>

      <p className="font-bold text-gray-800 mt-1">
        {value}
      </p>

    </div>
  );
}