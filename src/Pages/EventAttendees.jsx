import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Navigate,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  BadgeCheck,
  Banknote,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Download,
  Eye,
  Mail,
  MapPin,
  Phone,
  QrCode,
  RefreshCw,
  Search,
  Tag,
  Ticket,
  UserCheck,
  Users,
  X,
  XCircle,
} from "lucide-react";

import api from "../Api/api";

/* =========================================================
   EVENT ATTENDEES
========================================================= */

export default function EventAttendees() {
  const { id } = useParams();

  const navigate =
    useNavigate();

  /* =========================================================
     USER
  ========================================================= */

  let user = null;

  try {
    user = JSON.parse(
      localStorage.getItem(
        "user"
      ) || "null"
    );
  } catch {
    user = null;
  }

  /* =========================================================
     STATE
  ========================================================= */

  const [
    event,
    setEvent,
  ] = useState(null);

  const [
    attendees,
    setAttendees,
  ] = useState([]);

  const [
    summary,
    setSummary,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState(null);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("all");

  const [
    paymentFilter,
    setPaymentFilter,
  ] = useState("all");

  const [
    selectedAttendee,
    setSelectedAttendee,
  ] = useState(null);

  /* =========================================================
     FETCH
  ========================================================= */

  const fetchAttendees =
    async (
      refresh = false
    ) => {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      try {
        const response =
          await api.get(
            `/api/events/${id}/attendees/`
          );

        setEvent(
          response.data.event
        );

        setSummary(
          response.data.summary
        );

        setAttendees(
          response.data
            .attendees || []
        );
      } catch (err) {
        console.error(
          "Attendees error:",
          err
        );

        setError(
          err.response?.data
            ?.message ||
            "Unable to load event attendees."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };

  useEffect(() => {
    if (
      user?.role ===
      "organizer"
    ) {
      fetchAttendees();
    }
  }, [id]);

  /* =========================================================
     AUTH
  ========================================================= */

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (
    user.role !==
    "organizer"
  ) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  /* =========================================================
     FILTER
  ========================================================= */

  const filteredAttendees =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return attendees.filter(
        (attendee) => {
          /* Search */

          const matchesSearch =
            !query ||
            attendee.name
              ?.toLowerCase()
              .includes(query) ||
            attendee.email
              ?.toLowerCase()
              .includes(query) ||
            attendee.phone_number
              ?.toLowerCase()
              .includes(query) ||
            attendee.booking_reference
              ?.toLowerCase()
              .includes(query);

          /* Booking status */

          const matchesStatus =
            statusFilter ===
              "all" ||
            attendee.status ===
              statusFilter;

          /* Payment status */

          const paymentStatus =
            attendee.payment
              ?.status ||
            "none";

          const matchesPayment =
            paymentFilter ===
              "all" ||
            paymentStatus ===
              paymentFilter;

          return (
            matchesSearch &&
            matchesStatus &&
            matchesPayment
          );
        }
      );
    }, [
      attendees,
      search,
      statusFilter,
      paymentFilter,
    ]);

  /* =========================================================
     CSV EXPORT
  ========================================================= */

  const exportCSV = () => {
    if (
      filteredAttendees.length ===
      0
    ) {
      return;
    }

    const headers = [
      "Booking Reference",
      "Name",
      "Email",
      "Phone",
      "Tickets",
      "Amount",
      "Booking Status",
      "Payment Status",
      "M-Pesa Receipt",
      "Promo Code",
      "Checked In",
      "Checked In At",
      "Booked At",
    ];

    const rows =
      filteredAttendees.map(
        (attendee) => [
          attendee.booking_reference,
          attendee.name || "",
          attendee.email || "",
          attendee.phone_number ||
            "",
          attendee.quantity ||
            0,
          attendee.total_amount ||
            0,
          attendee.status ||
            "",
          attendee.payment
            ?.status || "",
          attendee.payment
            ?.mpesa_receipt_number ||
            "",
          attendee.promo_code
            ?.code || "",
          attendee.checked_in
            ? "Yes"
            : "No",
          attendee.checked_in_at ||
            "",
          attendee.created_at ||
            "",
        ]
      );

    const csv = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row
          .map(
            csvEscape
          )
          .join(",")
      )
      .join("\n");

    const blob =
      new Blob(
        [csv],
        {
          type:
            "text/csv;charset=utf-8;",
        }
      );

    const url =
      URL.createObjectURL(
        blob
      );

    const link =
      document.createElement(
        "a"
      );

    link.href = url;

    link.download = `${safeFileName(
      event?.title ||
        "event"
    )}-attendees.csv`;

    document.body.appendChild(
      link
    );

    link.click();

    document.body.removeChild(
      link
    );

    URL.revokeObjectURL(
      url
    );
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <AttendeesLoading />
    );
  }

  /* =========================================================
     ERROR
  ========================================================= */

  if (
    error ||
    !event
  ) {
    return (
      <ErrorState
        error={error}
        retry={() =>
          fetchAttendees()
        }
        back={() =>
          navigate(
            "/creator-dashboard"
          )
        }
      />
    );
  }

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <div className="min-h-screen bg-[#f7f7f8]">

      {/* =====================================================
          TOPBAR
      ===================================================== */}

      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-gray-100">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">

          <div className="flex items-center gap-3 min-w-0">

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/creator-dashboard"
                )
              }
              className="w-10 h-10 flex-shrink-0 border border-gray-200 rounded-xl flex items-center justify-center text-gray-500 hover:border-orange-200 hover:text-orange-500 transition"
            >
              <ArrowLeft
                size={18}
              />
            </button>

            <div className="min-w-0">

              <p className="text-[10px] sm:text-xs uppercase tracking-wider font-bold text-orange-500">
                Event Attendees
              </p>

              <h1 className="text-lg sm:text-xl font-black text-gray-900 truncate">
                {event.title}
              </h1>

            </div>

          </div>

          <div className="flex items-center gap-2">

            <button
              type="button"
              onClick={() =>
                fetchAttendees(
                  true
                )
              }
              disabled={
                refreshing
              }
              className="h-10 px-3 sm:px-4 border border-gray-200 rounded-xl flex items-center gap-2 text-sm font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            >

              <RefreshCw
                size={15}
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />

              <span className="hidden sm:inline">
                Refresh
              </span>

            </button>

            <button
              type="button"
              onClick={() =>
                navigate(
                  `/verify-tickets/${id}`
                )
              }
              className="h-10 px-3 sm:px-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl flex items-center gap-2 text-sm font-bold"
            >

              <QrCode
                size={16}
              />

              <span className="hidden sm:inline">
                Scan Tickets
              </span>

            </button>

          </div>

        </div>

      </header>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 lg:py-9">

        {/* ===================================================
            EVENT HERO
        =================================================== */}

        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 via-orange-600 to-gray-900">

          <div className="absolute -right-24 -top-32 w-96 h-96 bg-white/5 rounded-full" />

          <div className="absolute right-20 -bottom-40 w-80 h-80 border border-white/10 rounded-full" />

          <div className="relative p-6 sm:p-8 lg:p-9">

            <div className="flex flex-col md:flex-row md:items-center gap-6">

              {event.image && (

                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full md:w-44 h-40 md:h-32 object-cover rounded-2xl border border-white/20"
                />

              )}

              <div className="flex-1">

                <div className="flex flex-wrap gap-2">

                  {event.category && (

                    <span className="px-3 py-1.5 bg-white/10 border border-white/10 rounded-full text-xs font-semibold text-white">
                      {event.category}
                    </span>

                  )}

                  {event.is_verified && (

                    <span className="px-3 py-1.5 bg-green-500/20 border border-green-300/20 rounded-full text-xs font-semibold text-green-100 flex items-center gap-1.5">

                      <BadgeCheck
                        size={13}
                      />

                      Verified Event

                    </span>

                  )}

                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-white mt-4">
                  {event.title}
                </h2>

                <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-orange-100 mt-4">

                  <span className="flex items-center gap-2">

                    <CalendarDays
                      size={15}
                    />

                    {formatDate(
                      event.date
                    )}

                  </span>

                  <span className="flex items-center gap-2">

                    <Clock3
                      size={15}
                    />

                    {formatTime(
                      event.time
                    )}

                  </span>

                  <span className="flex items-center gap-2">

                    <MapPin
                      size={15}
                    />

                    {event.location}

                    {event.county
                      ? `, ${event.county}`
                      : ""}

                  </span>

                </div>

              </div>

              <div className="md:text-right">

                <p className="text-xs text-orange-100/70 uppercase tracking-wider font-bold">
                  Tickets Sold
                </p>

                <p className="text-3xl font-black text-white mt-1">
                  {number(
                    summary?.tickets_sold
                  )}
                </p>

                <p className="text-xs text-orange-100 mt-1">
                  of{" "}
                  {number(
                    event.total_tickets
                  )}{" "}
                  tickets
                </p>

              </div>

            </div>

          </div>

        </section>

        {/* ===================================================
            SUMMARY
        =================================================== */}

        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6">

          <SummaryCard
            icon={Ticket}
            title="Tickets Sold"
            value={number(
              summary?.tickets_sold
            )}
            description={`${number(
              summary?.successful_bookings
            )} successful bookings`}
          />

          <SummaryCard
            icon={UserCheck}
            title="Checked In"
            value={number(
              summary?.checked_in_tickets
            )}
            description={`${Number(
              summary?.check_in_rate ||
                0
            ).toFixed(
              1
            )}% attendance`}
          />

          <SummaryCard
            icon={Clock3}
            title="Reserved"
            value={number(
              summary?.reserved_tickets
            )}
            description="Awaiting payment"
          />

          <SummaryCard
            icon={Banknote}
            title="Revenue"
            value={`KES ${money(
              summary?.total_revenue
            )}`}
            description="Successful payments"
          />

        </section>

        {/* ===================================================
            CHECK-IN PROGRESS
        =================================================== */}

        <section className="bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 mt-5">

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">

            <div>

              <h3 className="font-black text-gray-900">
                Check-in Progress
              </h3>

              <p className="text-xs text-gray-400 mt-1">
                Track attendee arrivals at your event
              </p>

            </div>

            <p className="text-2xl font-black text-orange-500">
              {Number(
                summary?.check_in_rate ||
                  0
              ).toFixed(
                1
              )}
              %
            </p>

          </div>

          <div className="h-3 bg-gray-100 rounded-full overflow-hidden mt-5">

            <div
              className="h-full bg-orange-500 rounded-full transition-all"
              style={{
                width: `${Math.min(
                  100,
                  Number(
                    summary?.check_in_rate ||
                      0
                  )
                )}%`,
              }}
            />

          </div>

          <div className="flex justify-between gap-4 text-xs text-gray-400 mt-2">

            <span>
              {number(
                summary?.checked_in_tickets
              )}{" "}
              checked in
            </span>

            <span>
              {number(
                summary?.tickets_sold
              )}{" "}
              sold
            </span>

          </div>

        </section>

        {/* ===================================================
            TOOLBAR
        =================================================== */}

        <section className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 mt-5">

          <div className="flex flex-col xl:flex-row xl:items-center gap-3">

            {/* Search */}

            <div className="relative flex-1">

              <Search
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target
                      .value
                  )
                }
                placeholder="Search name, email, phone or booking reference..."
                className="w-full h-11 pl-10 pr-4 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-500/10"
              />

            </div>

            {/* Status */}

            <FilterSelect
              value={
                statusFilter
              }
              onChange={
                setStatusFilter
              }
              options={[
                {
                  value:
                    "all",
                  label:
                    "All bookings",
                },
                {
                  value:
                    "confirmed",
                  label:
                    "Confirmed",
                },
                {
                  value:
                    "used",
                  label:
                    "Checked in",
                },
                {
                  value:
                    "pending",
                  label:
                    "Pending",
                },
                {
                  value:
                    "cancelled",
                  label:
                    "Cancelled",
                },
                {
                  value:
                    "expired",
                  label:
                    "Expired",
                },
                {
                  value:
                    "refunded",
                  label:
                    "Refunded",
                },
              ]}
            />

            {/* Payment */}

            <FilterSelect
              value={
                paymentFilter
              }
              onChange={
                setPaymentFilter
              }
              options={[
                {
                  value:
                    "all",
                  label:
                    "All payments",
                },
                {
                  value:
                    "paid",
                  label:
                    "Paid",
                },
                {
                  value:
                    "pending",
                  label:
                    "Payment pending",
                },
                {
                  value:
                    "failed",
                  label:
                    "Payment failed",
                },
                {
                  value:
                    "cancelled",
                  label:
                    "Payment cancelled",
                },
              ]}
            />

            {/* Export */}

            <button
              type="button"
              onClick={
                exportCSV
              }
              disabled={
                filteredAttendees.length ===
                0
              }
              className="h-11 px-4 border border-gray-200 hover:bg-gray-50 rounded-xl flex items-center justify-center gap-2 text-sm font-bold text-gray-600 disabled:opacity-40"
            >

              <Download
                size={16}
              />

              Export CSV

            </button>

          </div>

          <div className="flex items-center justify-between mt-4">

            <p className="text-xs text-gray-400">

              Showing{" "}

              <strong className="text-gray-700">
                {
                  filteredAttendees.length
                }
              </strong>{" "}

              of{" "}

              <strong className="text-gray-700">
                {
                  attendees.length
                }
              </strong>{" "}

              bookings

            </p>

            {(search ||
              statusFilter !==
                "all" ||
              paymentFilter !==
                "all") && (

              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatusFilter(
                    "all"
                  );
                  setPaymentFilter(
                    "all"
                  );
                }}
                className="text-xs font-bold text-orange-500"
              >
                Clear Filters
              </button>

            )}

          </div>

        </section>

        {/* ===================================================
            ATTENDEES
        =================================================== */}

        {filteredAttendees.length ===
        0 ? (

          <EmptyAttendees />

        ) : (

          <>
            {/* ===============================================
                DESKTOP
            =============================================== */}

            <section className="hidden lg:block bg-white border border-gray-100 rounded-2xl overflow-hidden mt-5">

              <div className="overflow-x-auto">

                <table className="w-full min-w-[1000px]">

                  <thead className="bg-gray-50/80 border-b border-gray-100">

                    <tr className="text-[10px] uppercase tracking-wider text-gray-400">

                      <th className="text-left px-5 py-4">
                        Attendee
                      </th>

                      <th className="text-left px-4 py-4">
                        Reference
                      </th>

                      <th className="text-left px-4 py-4">
                        Tickets
                      </th>

                      <th className="text-left px-4 py-4">
                        Amount
                      </th>

                      <th className="text-left px-4 py-4">
                        Payment
                      </th>

                      <th className="text-left px-4 py-4">
                        Ticket Status
                      </th>

                      <th className="text-left px-4 py-4">
                        Booked
                      </th>

                      <th className="text-right px-5 py-4">
                        Action
                      </th>

                    </tr>

                  </thead>

                  <tbody className="divide-y divide-gray-100">

                    {filteredAttendees.map(
                      (
                        attendee
                      ) => (

                        <tr
                          key={
                            attendee.id
                          }
                          className="hover:bg-gray-50/60 transition"
                        >

                          {/* Person */}

                          <td className="px-5 py-4">

                            <div className="flex items-center gap-3">

                              <Avatar
                                name={
                                  attendee.name
                                }
                              />

                              <div className="min-w-0">

                                <p className="font-bold text-gray-800 text-sm max-w-[180px] truncate">
                                  {
                                    attendee.name
                                  }
                                </p>

                                <p className="text-xs text-gray-400 mt-1 max-w-[190px] truncate">
                                  {
                                    attendee.email ||
                                    attendee.phone_number
                                  }
                                </p>

                              </div>

                            </div>

                          </td>

                          {/* Reference */}

                          <td className="px-4 py-4">

                            <p className="font-mono text-[11px] text-gray-500 max-w-[130px] truncate">
                              {
                                attendee.booking_reference
                              }
                            </p>

                            {attendee.promo_code && (

                              <span className="inline-flex items-center gap-1 mt-1 text-[9px] font-bold text-orange-500">

                                <Tag
                                  size={10}
                                />

                                {
                                  attendee.promo_code.code
                                }

                              </span>

                            )}

                          </td>

                          {/* Quantity */}

                          <td className="px-4 py-4">

                            <span className="font-black text-gray-800">
                              {
                                attendee.quantity
                              }
                            </span>

                          </td>

                          {/* Amount */}

                          <td className="px-4 py-4">

                            <p className="font-bold text-gray-700 text-sm whitespace-nowrap">

                              KES{" "}

                              {money(
                                attendee.total_amount
                              )}

                            </p>

                            {Number(
                              attendee.discount_amount ||
                                0
                            ) > 0 && (

                              <p className="text-[10px] text-green-600 mt-1">

                                Saved KES{" "}

                                {money(
                                  attendee.discount_amount
                                )}

                              </p>

                            )}

                          </td>

                          {/* Payment */}

                          <td className="px-4 py-4">

                            <StatusBadge
                              status={
                                attendee.payment
                                  ?.status ||
                                "none"
                              }
                            />

                          </td>

                          {/* Booking */}

                          <td className="px-4 py-4">

                            <StatusBadge
                              status={
                                attendee.status
                              }
                            />

                            {attendee.checked_in_at && (

                              <p className="text-[9px] text-gray-400 mt-1">
                                {formatDateTime(
                                  attendee.checked_in_at
                                )}
                              </p>

                            )}

                          </td>

                          {/* Date */}

                          <td className="px-4 py-4 text-xs text-gray-400 whitespace-nowrap">

                            {formatDateTime(
                              attendee.created_at
                            )}

                          </td>

                          {/* View */}

                          <td className="px-5 py-4 text-right">

                            <button
                              type="button"
                              onClick={() =>
                                setSelectedAttendee(
                                  attendee
                                )
                              }
                              className="inline-flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-orange-50 text-gray-600 hover:text-orange-500 rounded-lg text-xs font-bold transition"
                            >

                              <Eye
                                size={14}
                              />

                              Details

                            </button>

                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            </section>

            {/* ===============================================
                MOBILE
            =============================================== */}

            <section className="lg:hidden space-y-3 mt-5">

              {filteredAttendees.map(
                (attendee) => (

                  <button
                    type="button"
                    key={
                      attendee.id
                    }
                    onClick={() =>
                      setSelectedAttendee(
                        attendee
                      )
                    }
                    className="w-full text-left bg-white border border-gray-100 rounded-2xl p-4 hover:border-orange-200 transition"
                  >

                    <div className="flex items-start gap-3">

                      <Avatar
                        name={
                          attendee.name
                        }
                      />

                      <div className="min-w-0 flex-1">

                        <div className="flex justify-between gap-3">

                          <div className="min-w-0">

                            <p className="font-bold text-gray-800 truncate">
                              {
                                attendee.name
                              }
                            </p>

                            <p className="text-xs text-gray-400 mt-1 truncate">
                              {
                                attendee.phone_number
                              }
                            </p>

                          </div>

                          <p className="font-black text-gray-800 whitespace-nowrap">
                            KES{" "}
                            {money(
                              attendee.total_amount
                            )}
                          </p>

                        </div>

                        <div className="flex flex-wrap gap-2 mt-3">

                          <StatusBadge
                            status={
                              attendee.status
                            }
                          />

                          <StatusBadge
                            status={
                              attendee.payment
                                ?.status ||
                              "none"
                            }
                          />

                          <NeutralBadge>

                            <Ticket
                              size={11}
                            />

                            {
                              attendee.quantity
                            }{" "}
                            ticket
                            {attendee.quantity !==
                            1
                              ? "s"
                              : ""}

                          </NeutralBadge>

                        </div>

                        {attendee.promo_code && (

                          <p className="flex items-center gap-1 text-[10px] font-bold text-orange-500 mt-3">

                            <Tag
                              size={11}
                            />

                            Promo:{" "}

                            {
                              attendee.promo_code.code
                            }

                          </p>

                        )}

                      </div>

                    </div>

                  </button>

                )
              )}

            </section>

          </>
        )}

      </main>

      {/* =====================================================
          DETAILS DRAWER
      ===================================================== */}

      {selectedAttendee && (

        <AttendeeDetails
          attendee={
            selectedAttendee
          }
          close={() =>
            setSelectedAttendee(
              null
            )
          }
        />

      )}

    </div>
  );
}

/* =========================================================
   DETAILS DRAWER
========================================================= */

function AttendeeDetails({
  attendee,
  close,
}) {
  return (
    <div className="fixed inset-0 z-[100]">

      <button
        type="button"
        aria-label="Close attendee details"
        onClick={close}
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
      />

      <div className="absolute right-0 top-0 bottom-0 w-full sm:w-[460px] bg-white shadow-2xl overflow-y-auto">

        {/* Header */}

        <div className="sticky top-0 bg-white border-b border-gray-100 px-5 sm:px-6 h-20 flex items-center justify-between z-10">

          <div>

            <p className="text-[10px] uppercase tracking-wider font-bold text-orange-500">
              Booking Details
            </p>

            <h2 className="font-black text-gray-900 mt-1">
              Attendee
            </h2>

          </div>

          <button
            type="button"
            onClick={close}
            className="w-10 h-10 bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center justify-center text-gray-500"
          >
            <X size={18} />
          </button>

        </div>

        <div className="p-5 sm:p-6">

          {/* Person */}

          <div className="flex items-center gap-4">

            <Avatar
              name={
                attendee.name
              }
              large
            />

            <div className="min-w-0">

              <h3 className="font-black text-gray-900 text-lg truncate">
                {attendee.name}
              </h3>

              <div className="flex flex-wrap gap-2 mt-2">

                <StatusBadge
                  status={
                    attendee.status
                  }
                />

                <StatusBadge
                  status={
                    attendee.payment
                      ?.status ||
                    "none"
                  }
                />

              </div>

            </div>

          </div>

          {/* Contact */}

          <DetailSection
            title="Contact Information"
          >

            <DetailRow
              icon={Phone}
              label="Phone"
              value={
                attendee.phone_number
              }
            />

            <DetailRow
              icon={Mail}
              label="Email"
              value={
                attendee.email ||
                "Not provided"
              }
            />

          </DetailSection>

          {/* Ticket */}

          <DetailSection
            title="Ticket Information"
          >

            <DetailItem
              label="Booking Reference"
              value={
                attendee.booking_reference
              }
              mono
            />

            <div className="grid grid-cols-2 gap-3">

              <DetailBox
                label="Tickets"
                value={
                  attendee.quantity
                }
              />

              <DetailBox
                label="Amount"
                value={`KES ${money(
                  attendee.total_amount
                )}`}
              />

            </div>

            {Number(
              attendee.discount_amount ||
                0
            ) > 0 && (

              <div className="bg-green-50 border border-green-100 rounded-xl p-4">

                <p className="text-[10px] uppercase tracking-wide font-bold text-green-600">
                  Discount
                </p>

                <p className="font-black text-green-700 mt-1">
                  KES{" "}
                  {money(
                    attendee.discount_amount
                  )}
                </p>

                {attendee.promo_code && (

                  <p className="text-xs text-green-600 mt-1">
                    Promo code:{" "}
                    <strong>
                      {
                        attendee.promo_code.code
                      }
                    </strong>
                  </p>

                )}

              </div>

            )}

          </DetailSection>

          {/* Payment */}

          <DetailSection
            title="Payment"
          >

            {attendee.payment ? (

              <>
                <DetailItem
                  label="Status"
                  value={
                    attendee.payment.status
                  }
                />

                <DetailItem
                  label="Method"
                  value={
                    attendee.payment.method ||
                    "—"
                  }
                />

                <DetailItem
                  label="Amount"
                  value={`KES ${money(
                    attendee.payment.amount
                  )}`}
                />

                {attendee.payment
                  .mpesa_receipt_number && (

                  <DetailItem
                    label="M-Pesa Receipt"
                    value={
                      attendee.payment
                        .mpesa_receipt_number
                    }
                    mono
                  />

                )}

                {attendee.payment
                  .transaction_id && (

                  <DetailItem
                    label="Transaction ID"
                    value={
                      attendee.payment
                        .transaction_id
                    }
                    mono
                  />

                )}

                {attendee.payment
                  .paid_at && (

                  <DetailItem
                    label="Paid At"
                    value={formatDateTime(
                      attendee.payment
                        .paid_at
                    )}
                  />

                )}
              </>

            ) : (

              <p className="text-sm text-gray-400">
                No payment record available.
              </p>

            )}

          </DetailSection>

          {/* Check in */}

          <DetailSection
            title="Attendance"
          >

            {attendee.checked_in ? (

              <div className="bg-green-50 border border-green-100 rounded-xl p-4 flex gap-3">

                <div className="w-9 h-9 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">

                  <CheckCircle2
                    size={18}
                  />

                </div>

                <div>

                  <p className="font-bold text-green-700 text-sm">
                    Checked In
                  </p>

                  <p className="text-xs text-green-600 mt-1">
                    {attendee.checked_in_at
                      ? formatDateTime(
                          attendee.checked_in_at
                        )
                      : "Ticket has been used."}
                  </p>

                </div>

              </div>

            ) : (

              <div className="bg-gray-50 rounded-xl p-4 flex gap-3">

                <div className="w-9 h-9 rounded-full bg-white text-gray-400 flex items-center justify-center flex-shrink-0">

                  <Clock3
                    size={18}
                  />

                </div>

                <div>

                  <p className="font-bold text-gray-700 text-sm">
                    Not Checked In
                  </p>

                  <p className="text-xs text-gray-400 mt-1">
                    This ticket has not yet been scanned at the event.
                  </p>

                </div>

              </div>

            )}

          </DetailSection>

          {/* Created */}

          <div className="border-t border-gray-100 pt-5 mt-6">

            <p className="text-xs text-gray-400">
              Booking created
            </p>

            <p className="text-sm font-semibold text-gray-600 mt-1">
              {formatDateTime(
                attendee.created_at
              )}
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

/* =========================================================
   SUMMARY CARD
========================================================= */

function SummaryCard({
  icon: Icon,
  title,
  value,
  description,
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5">

      <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">

        <Icon size={18} />

      </div>

      <p className="text-xl sm:text-2xl font-black text-gray-900 mt-4 break-words">
        {value}
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
   AVATAR
========================================================= */

function Avatar({
  name,
  large = false,
}) {
  return (
    <div
      className={`${
        large
          ? "w-14 h-14 text-sm"
          : "w-10 h-10 text-xs"
      } rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center font-black flex-shrink-0`}
    >
      {getInitials(
        name
      )}
    </div>
  );
}

/* =========================================================
   FILTER
========================================================= */

function FilterSelect({
  value,
  onChange,
  options,
}) {
  return (
    <div className="relative">

      <select
        value={value}
        onChange={(e) =>
          onChange(
            e.target.value
          )
        }
        className="appearance-none h-11 w-full xl:w-auto min-w-[170px] pl-4 pr-10 bg-gray-50 border border-gray-100 rounded-xl text-sm font-semibold text-gray-600 outline-none focus:border-orange-300 cursor-pointer"
      >

        {options.map(
          (option) => (

            <option
              key={
                option.value
              }
              value={
                option.value
              }
            >
              {
                option.label
              }
            </option>

          )
        )}

      </select>

      <ChevronDown
        size={15}
        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
      />

    </div>
  );
}

/* =========================================================
   BADGES
========================================================= */

function StatusBadge({
  status,
}) {
  const value =
    String(
      status || ""
    ).toLowerCase();

  let classes =
    "bg-gray-100 text-gray-500";

  if (
    [
      "paid",
      "confirmed",
      "used",
      "completed",
    ].includes(value)
  ) {
    classes =
      "bg-green-50 text-green-600";
  }

  if (
    value === "pending"
  ) {
    classes =
      "bg-yellow-50 text-yellow-700";
  }

  if (
    [
      "failed",
      "cancelled",
    ].includes(value)
  ) {
    classes =
      "bg-red-50 text-red-500";
  }

  if (
    [
      "expired",
      "refunded",
    ].includes(value)
  ) {
    classes =
      "bg-gray-100 text-gray-500";
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold capitalize ${classes}`}
    >
      {value === "used"
        ? "Checked In"
        : value === "none"
          ? "No Payment"
          : status}
    </span>
  );
}

function NeutralBadge({
  children,
}) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 text-[10px] font-bold">
      {children}
    </span>
  );
}

/* =========================================================
   DETAILS
========================================================= */

function DetailSection({
  title,
  children,
}) {
  return (
    <div className="border-t border-gray-100 pt-5 mt-6">

      <p className="text-xs uppercase tracking-wider font-black text-gray-400 mb-4">
        {title}
      </p>

      <div className="space-y-3">
        {children}
      </div>

    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">

      <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center text-orange-500 flex-shrink-0">

        <Icon size={15} />

      </div>

      <div className="min-w-0">

        <p className="text-[10px] text-gray-400">
          {label}
        </p>

        <p className="text-sm font-semibold text-gray-700 truncate">
          {value}
        </p>

      </div>

    </div>
  );
}

function DetailItem({
  label,
  value,
  mono = false,
}) {
  return (
    <div className="flex justify-between gap-4">

      <p className="text-sm text-gray-400">
        {label}
      </p>

      <p
        className={`text-sm font-bold text-gray-700 text-right break-all ${
          mono
            ? "font-mono text-xs"
            : ""
        }`}
      >
        {value}
      </p>

    </div>
  );
}

function DetailBox({
  label,
  value,
}) {
  return (
    <div className="bg-gray-50 rounded-xl p-4">

      <p className="text-[10px] uppercase tracking-wide text-gray-400 font-bold">
        {label}
      </p>

      <p className="font-black text-gray-800 mt-1">
        {value}
      </p>

    </div>
  );
}

/* =========================================================
   EMPTY
========================================================= */

function EmptyAttendees() {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl py-16 px-5 text-center mt-5">

      <div className="w-14 h-14 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center mx-auto">

        <Users size={24} />

      </div>

      <h3 className="font-black text-gray-800 mt-4">
        No attendees found
      </h3>

      <p className="text-sm text-gray-400 mt-2">
        No bookings match your current search or filters.
      </p>

    </div>
  );
}

/* =========================================================
   ERROR
========================================================= */

function ErrorState({
  error,
  retry,
  back,
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">

      <div className="max-w-md w-full bg-white border border-gray-100 rounded-2xl p-8 text-center">

        <div className="w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">

          <XCircle
            size={25}
          />

        </div>

        <h2 className="font-black text-gray-900 text-xl mt-5">
          Unable to Load Attendees
        </h2>

        <p className="text-sm text-gray-400 mt-2">
          {error}
        </p>

        <div className="flex gap-3 mt-6">

          <button
            type="button"
            onClick={back}
            className="flex-1 h-11 border border-gray-200 rounded-xl font-bold text-sm text-gray-600"
          >
            Dashboard
          </button>

          <button
            type="button"
            onClick={retry}
            className="flex-1 h-11 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-sm"
          >
            Try Again
          </button>

        </div>

      </div>

    </div>
  );
}

/* =========================================================
   LOADING
========================================================= */

function AttendeesLoading() {
  return (
    <div className="min-h-screen bg-gray-50 animate-pulse">

      <div className="h-20 bg-white border-b border-gray-100" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="h-52 bg-gray-200 rounded-3xl" />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">

          {[1, 2, 3, 4].map(
            (item) => (

              <div
                key={item}
                className="h-36 bg-white border border-gray-100 rounded-2xl"
              />

            )
          )}

        </div>

        <div className="h-20 bg-white border border-gray-100 rounded-2xl mt-5" />

        <div className="h-96 bg-white border border-gray-100 rounded-2xl mt-5" />

      </div>

    </div>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function number(value) {
  return Number(
    value || 0
  ).toLocaleString(
    "en-KE"
  );
}

function money(value) {
  return Number(
    value || 0
  ).toLocaleString(
    "en-KE",
    {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }
  );
}

function formatDate(value) {
  if (!value) {
    return "—";
  }

  try {
    return new Date(
      `${String(
        value
      ).split("T")[0]}T00:00:00`
    ).toLocaleDateString(
      "en-KE",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  } catch {
    return value;
  }
}

function formatTime(value) {
  if (!value) {
    return "—";
  }

  try {
    return new Date(
      `2000-01-01T${value}`
    ).toLocaleTimeString(
      "en-KE",
      {
        hour: "numeric",
        minute: "2-digit",
      }
    );
  } catch {
    return value;
  }
}

function formatDateTime(value) {
  if (!value) {
    return "—";
  }

  try {
    return new Date(
      value
    ).toLocaleString(
      "en-KE",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }
    );
  } catch {
    return value;
  }
}

function getInitials(
  value = ""
) {
  return (
    String(value)
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(
        (word) =>
          word[0]?.toUpperCase()
      )
      .join("") || "G"
  );
}

function csvEscape(value) {
  const text =
    String(
      value ?? ""
    );

  return `"${text.replace(
    /"/g,
    '""'
  )}"`;
}

function safeFileName(value) {
  return String(
    value
  )
    .trim()
    .toLowerCase()
    .replace(
      /[^a-z0-9]+/g,
      "-"
    )
    .replace(
      /^-+|-+$/g,
      ""
    );
}