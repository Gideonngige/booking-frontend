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
  BarChart3,
  Banknote,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  MapPin,
  Percent,
  RefreshCw,
  Tag,
  Ticket,
  TrendingUp,
  UserCheck,
  Users,
  WalletCards,
  XCircle,
  CircleDollarSign,
} from "lucide-react";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import api from "../Api/api";

/* =========================================================
   EVENT ANALYTICS
========================================================= */

export default function EventAnalytics() {
  const { id } = useParams();

  const navigate = useNavigate();

  /* =========================================================
     USER
  ========================================================= */

  let user = null;

  try {
    user = JSON.parse(
      localStorage.getItem("user") ||
        "null"
    );
  } catch {
    user = null;
  }

  /* =========================================================
     STATE
  ========================================================= */

  const [analytics, setAnalytics] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState(null);

  /* =========================================================
     FETCH
  ========================================================= */

  const fetchAnalytics =
    async (refresh = false) => {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      try {
        const response =
          await api.get(
            `/api/events/${id}/analytics/`
          );

        setAnalytics(
          response.data
        );
      } catch (err) {
        console.error(
          "Analytics error:",
          err
        );

        setError(
          err.response?.data
            ?.message ||
            "Unable to load event analytics."
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
      fetchAnalytics();
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
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <AnalyticsLoading />
    );
  }

  /* =========================================================
     ERROR
  ========================================================= */

  if (
    error ||
    !analytics
  ) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">

        <div className="max-w-md w-full bg-white border border-gray-100 rounded-2xl p-8 text-center">

          <div className="w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">

            <XCircle
              size={25}
            />

          </div>

          <h2 className="font-black text-gray-900 text-xl mt-5">
            Analytics unavailable
          </h2>

          <p className="text-sm text-gray-400 mt-2">
            {error}
          </p>

          <div className="flex gap-3 mt-6">

            <button
              onClick={() =>
                navigate(
                  "/creator-dashboard"
                )
              }
              className="flex-1 h-11 border border-gray-200 rounded-xl font-bold text-sm text-gray-600"
            >
              Dashboard
            </button>

            <button
              onClick={() =>
                fetchAnalytics()
              }
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
     DATA
  ========================================================= */

  const event =
    analytics.event || {};

  const overview =
    analytics.overview || {};

  const revenue =
    analytics.revenue || {};

  const sales =
    analytics.sales_over_time ||
    [];

  const promoCodes =
    analytics.promo_codes || [];

  const recentBookings =
    analytics.recent_bookings ||
    [];

  const bookingStatus =
    analytics.booking_status ||
    {};

  const paymentStatus =
    analytics.payment_status ||
    {};

  return (
    <div className="min-h-screen bg-[#f7f7f8]">

      {/* =====================================================
          HEADER
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
              className="w-10 h-10 flex-shrink-0 border border-gray-200 rounded-xl flex items-center justify-center text-gray-500 hover:text-orange-500 hover:border-orange-200"
            >
              <ArrowLeft
                size={18}
              />
            </button>

            <div className="min-w-0">

              <p className="text-xs font-bold uppercase tracking-wider text-orange-500">
                Event Analytics
              </p>

              <h1 className="font-black text-gray-900 truncate text-lg sm:text-xl">
                {event.title}
              </h1>

            </div>

          </div>

          <button
            type="button"
            onClick={() =>
              fetchAnalytics(
                true
              )
            }
            disabled={
              refreshing
            }
            className="h-10 px-3 sm:px-4 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
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

        </div>

      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 lg:py-9">

        {/* ===================================================
            EVENT SUMMARY
        =================================================== */}

        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 via-orange-600 to-gray-900">

          <div className="absolute -right-32 -top-32 w-96 h-96 rounded-full bg-white/5" />

          <div className="absolute right-20 -bottom-32 w-72 h-72 rounded-full border border-white/10" />

          <div className="relative p-6 sm:p-8 lg:p-10 flex flex-col lg:flex-row lg:items-center gap-7">

            {event.image && (

              <img
                src={event.image}
                alt={event.title}
                className="w-full lg:w-48 h-44 lg:h-36 object-cover rounded-2xl border border-white/20"
              />

            )}

            <div className="flex-1">

              <div className="flex flex-wrap gap-2">

                {event.category && (
                  <span className="bg-white/10 border border-white/10 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                    {event.category}
                  </span>
                )}

                {event.is_verified && (
                  <span className="bg-green-500/20 border border-green-300/20 text-green-100 text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1">
                    <CheckCircle2
                      size={12}
                    />
                    Verified
                  </span>
                )}

              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white mt-4">
                {event.title}
              </h2>

              <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4 text-sm text-orange-100">

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

          </div>

        </section>

        {/* ===================================================
            PRIMARY KPI
        =================================================== */}

        <section className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-6">

          <StatCard
            icon={Banknote}
            title="Gross Revenue"
            value={`KES ${money(
              revenue.gross_revenue
            )}`}
            description="Successful payments"
          />

          <StatCard
            icon={Ticket}
            title="Tickets Sold"
            value={number(
              overview.tickets_sold
            )}
            description={`${overview.sales_percentage || 0}% of inventory`}
          />

          <StatCard
            icon={UserCheck}
            title="Checked In"
            value={number(
              overview.checked_in_tickets
            )}
            description={`${overview.check_in_rate || 0}% attendance rate`}
          />

          <StatCard
            icon={WalletCards}
            title="Your Earnings"
            value={`KES ${money(
              revenue.organizer_earnings
            )}`}
            description="After platform commission"
          />

        </section>

        {/* ===================================================
            INVENTORY
        =================================================== */}

        <section className="grid md:grid-cols-2 xl:grid-cols-4 gap-4 mt-4">

          <SmallStat
            title="Total Tickets"
            value={number(
              overview.total_tickets
            )}
            icon={Ticket}
          />

          <SmallStat
            title="Available"
            value={number(
              overview.available_tickets
            )}
            icon={CheckCircle2}
          />

          <SmallStat
            title="Reserved"
            value={number(
              overview.reserved_tickets
            )}
            icon={Clock3}
          />

          <SmallStat
            title="Bookings"
            value={number(
              overview.successful_bookings
            )}
            icon={Users}
          />

        </section>

        {/* ===================================================
            SALES CHART + REVENUE
        =================================================== */}

        <section className="grid xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.7fr)] gap-5 mt-6">

          {/* SALES CHART */}

          <div className="bg-white border border-gray-100 rounded-2xl p-5 sm:p-6">

            <div className="flex items-start justify-between">

              <div>

                <div className="flex items-center gap-2">

                  <BarChart3
                    size={18}
                    className="text-orange-500"
                  />

                  <h3 className="font-black text-gray-900">
                    Ticket Sales
                  </h3>

                </div>

                <p className="text-xs text-gray-400 mt-1">
                  Tickets sold over time
                </p>

              </div>

              <Badge>
                {number(
                  overview.tickets_sold
                )}{" "}
                sold
              </Badge>

            </div>

            {sales.length === 0 ? (

              <ChartEmpty />

            ) : (

              <div className="h-[300px] mt-7">

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  <AreaChart
                    data={sales}
                  >

                    <defs>

                      <linearGradient
                        id="ticketsGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >

                        <stop
                          offset="5%"
                          stopColor="#f97316"
                          stopOpacity={
                            0.25
                          }
                        />

                        <stop
                          offset="95%"
                          stopColor="#f97316"
                          stopOpacity={
                            0
                          }
                        />

                      </linearGradient>

                    </defs>

                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f3f4f6"
                    />

                    <XAxis
                      dataKey="date"
                      tickFormatter={
                        shortDate
                      }
                      tick={{
                        fontSize: 11,
                        fill: "#9ca3af",
                      }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <YAxis
                      allowDecimals={
                        false
                      }
                      tick={{
                        fontSize: 11,
                        fill: "#9ca3af",
                      }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <Tooltip
                      content={
                        <SalesTooltip />
                      }
                    />

                    <Area
                      type="monotone"
                      dataKey="tickets"
                      stroke="#f97316"
                      strokeWidth={3}
                      fill="url(#ticketsGradient)"
                    />

                  </AreaChart>

                </ResponsiveContainer>

              </div>

            )}

          </div>

          {/* REVENUE */}

          <div className="bg-white border border-gray-100 rounded-2xl p-5 sm:p-6">

            <div className="flex items-center gap-2">

              <CircleDollarSign
                size={19}
                className="text-orange-500"
              />

              <h3 className="font-black text-gray-900">
                Revenue Breakdown
              </h3>

            </div>

            <div className="space-y-5 mt-7">

              <RevenueRow
                label="Gross Revenue"
                value={
                  revenue.gross_revenue
                }
              />

              <RevenueRow
                label="Discounts Given"
                value={
                  revenue.discounts
                }
                negative
              />

              <RevenueRow
                label={`Platform Commission (${revenue.commission_rate || 5}%)`}
                value={
                  revenue.platform_commission
                }
                negative
              />

              <div className="border-t border-gray-100 pt-5">

                <p className="text-xs text-gray-400">
                  Organizer Earnings
                </p>

                <p className="text-2xl font-black text-green-600 mt-1">
                  KES{" "}
                  {money(
                    revenue.organizer_earnings
                  )}
                </p>

              </div>

              <div className="bg-gray-50 rounded-xl p-4">

                <p className="text-xs text-gray-400">
                  Average Order Value
                </p>

                <p className="font-black text-gray-800 mt-1">
                  KES{" "}
                  {money(
                    revenue.average_order_value
                  )}
                </p>

              </div>

            </div>

          </div>

        </section>

        {/* ===================================================
            SALES PROGRESS
        =================================================== */}

        <section className="bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 mt-5">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

            <div>

              <h3 className="font-black text-gray-900">
                Ticket Sales Progress
              </h3>

              <p className="text-xs text-gray-400 mt-1">
                Progress against your total ticket inventory
              </p>

            </div>

            <p className="font-black text-orange-500 text-xl">
              {Number(
                overview.sales_percentage ||
                  0
              ).toFixed(1)}
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
                    overview.sales_percentage ||
                      0
                  )
                )}%`,
              }}
            />

          </div>

          <div className="flex justify-between text-xs text-gray-400 mt-2">

            <span>
              {number(
                overview.tickets_sold
              )}{" "}
              sold
            </span>

            <span>
              {number(
                overview.total_tickets
              )}{" "}
              total
            </span>

          </div>

        </section>

        {/* ===================================================
            BOOKING + PAYMENT STATUS
        =================================================== */}

        <section className="grid lg:grid-cols-2 gap-5 mt-5">

          <StatusCard
            title="Booking Status"
            icon={Users}
            items={[
              {
                label:
                  "Confirmed",
                value:
                  bookingStatus.confirmed,
                type:
                  "success",
              },
              {
                label:
                  "Checked In",
                value:
                  bookingStatus.used,
                type:
                  "success",
              },
              {
                label:
                  "Pending",
                value:
                  bookingStatus.pending,
                type:
                  "warning",
              },
              {
                label:
                  "Cancelled",
                value:
                  bookingStatus.cancelled,
                type:
                  "danger",
              },
              {
                label:
                  "Expired",
                value:
                  bookingStatus.expired,
                type:
                  "default",
              },
              {
                label:
                  "Refunded",
                value:
                  bookingStatus.refunded,
                type:
                  "default",
              },
            ]}
          />

          <StatusCard
            title="Payment Status"
            icon={Banknote}
            items={[
              {
                label: "Paid",
                value:
                  paymentStatus.paid,
                type:
                  "success",
              },
              {
                label:
                  "Pending",
                value:
                  paymentStatus.pending,
                type:
                  "warning",
              },
              {
                label:
                  "Failed",
                value:
                  paymentStatus.failed,
                type:
                  "danger",
              },
              {
                label:
                  "Cancelled",
                value:
                  paymentStatus.cancelled,
                type:
                  "default",
              },
            ]}
          />

        </section>

        {/* ===================================================
            PROMO CODES
        =================================================== */}

        <section className="bg-white border border-gray-100 rounded-2xl overflow-hidden mt-5">

          <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between">

            <div>

              <div className="flex items-center gap-2">

                <Tag
                  size={18}
                  className="text-orange-500"
                />

                <h3 className="font-black text-gray-900">
                  Promo Code Performance
                </h3>

              </div>

              <p className="text-xs text-gray-400 mt-1">
                See which promotions are generating ticket sales
              </p>

            </div>

            <button
              type="button"
              onClick={() =>
                navigate(
                  `/event/${id}/promo-codes`
                )
              }
              className="text-sm font-bold text-orange-500 hover:text-orange-600"
            >
              Manage
            </button>

          </div>

          {promoCodes.length ===
          0 ? (

            <div className="py-12 text-center">

              <Tag
                size={28}
                className="text-gray-300 mx-auto"
              />

              <p className="font-bold text-gray-600 mt-3">
                No promo codes yet
              </p>

              <p className="text-xs text-gray-400 mt-1">
                Create promotional codes to track campaign performance.
              </p>

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full min-w-[700px]">

                <thead className="bg-gray-50">

                  <tr className="text-[10px] uppercase tracking-wider text-gray-400">

                    <th className="text-left px-5 py-3">
                      Code
                    </th>

                    <th className="text-left px-4 py-3">
                      Discount
                    </th>

                    <th className="text-left px-4 py-3">
                      Uses
                    </th>

                    <th className="text-left px-4 py-3">
                      Tickets
                    </th>

                    <th className="text-left px-4 py-3">
                      Revenue
                    </th>

                    <th className="text-left px-4 py-3">
                      Discount Given
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-gray-100">

                  {promoCodes.map(
                    (promo) => (

                      <tr
                        key={
                          promo.id
                        }
                      >

                        <td className="px-5 py-4">

                          <span className="font-black text-orange-600 bg-orange-50 px-2.5 py-1.5 rounded-lg text-xs">
                            {promo.code}
                          </span>

                        </td>

                        <td className="px-4 py-4 text-sm text-gray-600">

                          {promo.discount_type ===
                          "percentage"
                            ? `${promo.discount_value}%`
                            : `KES ${money(
                                promo.discount_value
                              )}`}

                        </td>

                        <td className="px-4 py-4 text-sm font-bold text-gray-700">
                          {number(
                            promo.times_used
                          )}
                        </td>

                        <td className="px-4 py-4 text-sm text-gray-600">
                          {number(
                            promo.tickets_sold
                          )}
                        </td>

                        <td className="px-4 py-4 text-sm font-bold text-green-600">
                          KES{" "}
                          {money(
                            promo.revenue
                          )}
                        </td>

                        <td className="px-4 py-4 text-sm text-red-500">
                          KES{" "}
                          {money(
                            promo.discount_given
                          )}
                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </section>

        {/* ===================================================
            RECENT BOOKINGS
        =================================================== */}

        <section className="bg-white border border-gray-100 rounded-2xl overflow-hidden mt-5">

          <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between">

            <div>

              <h3 className="font-black text-gray-900">
                Recent Bookings
              </h3>

              <p className="text-xs text-gray-400 mt-1">
                Latest ticket bookings for this event
              </p>

            </div>

            <button
              type="button"
              onClick={() =>
                navigate(
                  `/event/${id}/attendees`
                )
              }
              className="text-sm font-bold text-orange-500"
            >
              View All
            </button>

          </div>

          {recentBookings.length ===
          0 ? (

            <div className="py-14 text-center">

              <Users
                size={30}
                className="text-gray-300 mx-auto"
              />

              <p className="font-bold text-gray-600 mt-3">
                No bookings yet
              </p>

              <p className="text-xs text-gray-400 mt-1">
                Booking activity will appear here.
              </p>

            </div>

          ) : (

            <>
              {/* Desktop */}

              <div className="hidden md:block overflow-x-auto">

                <table className="w-full">

                  <thead className="bg-gray-50">

                    <tr className="text-[10px] uppercase tracking-wider text-gray-400">

                      <th className="text-left px-5 py-3">
                        Guest
                      </th>

                      <th className="text-left px-4 py-3">
                        Tickets
                      </th>

                      <th className="text-left px-4 py-3">
                        Amount
                      </th>

                      <th className="text-left px-4 py-3">
                        Booking
                      </th>

                      <th className="text-left px-4 py-3">
                        Payment
                      </th>

                      <th className="text-left px-4 py-3">
                        Date
                      </th>

                    </tr>

                  </thead>

                  <tbody className="divide-y divide-gray-100">

                    {recentBookings.map(
                      (booking) => (

                        <tr
                          key={
                            booking.id
                          }
                        >

                          <td className="px-5 py-4">

                            <p className="font-bold text-sm text-gray-800">
                              {booking.guest_name}
                            </p>

                            <p className="text-xs text-gray-400 mt-1">
                              {booking.phone_number}
                            </p>

                          </td>

                          <td className="px-4 py-4 text-sm font-bold">
                            {booking.quantity}
                          </td>

                          <td className="px-4 py-4 text-sm font-bold text-gray-700">
                            KES{" "}
                            {money(
                              booking.total_amount
                            )}
                          </td>

                          <td className="px-4 py-4">
                            <StatusBadge
                              status={
                                booking.status
                              }
                            />
                          </td>

                          <td className="px-4 py-4">
                            <StatusBadge
                              status={
                                booking.payment_status
                              }
                            />
                          </td>

                          <td className="px-4 py-4 text-xs text-gray-400">
                            {formatDateTime(
                              booking.created_at
                            )}
                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

              {/* Mobile */}

              <div className="md:hidden divide-y divide-gray-100">

                {recentBookings.map(
                  (booking) => (

                    <div
                      key={
                        booking.id
                      }
                      className="p-4"
                    >

                      <div className="flex justify-between gap-3">

                        <div>

                          <p className="font-bold text-gray-800 text-sm">
                            {booking.guest_name}
                          </p>

                          <p className="text-xs text-gray-400 mt-1">
                            {booking.phone_number}
                          </p>

                        </div>

                        <p className="font-black text-gray-800">
                          KES{" "}
                          {money(
                            booking.total_amount
                          )}
                        </p>

                      </div>

                      <div className="flex flex-wrap gap-2 mt-3">

                        <StatusBadge
                          status={
                            booking.status
                          }
                        />

                        <StatusBadge
                          status={
                            booking.payment_status
                          }
                        />

                        <Badge>
                          {booking.quantity}{" "}
                          ticket
                          {booking.quantity !==
                          1
                            ? "s"
                            : ""}
                        </Badge>

                      </div>

                    </div>

                  )
                )}

              </div>

            </>

          )}

        </section>

      </main>

    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  icon: Icon,
  title,
  value,
  description,
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5">

      <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">

        <Icon size={20} />

      </div>

      <p className="text-2xl font-black text-gray-900 mt-5 break-words">
        {value}
      </p>

      <p className="font-bold text-sm text-gray-700 mt-1">
        {title}
      </p>

      <p className="text-xs text-gray-400 mt-1">
        {description}
      </p>

    </div>
  );
}

/* =========================================================
   SMALL STAT
========================================================= */

function SmallStat({
  title,
  value,
  icon: Icon,
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-4">

      <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-orange-500">

        <Icon size={18} />

      </div>

      <div>

        <p className="text-xs text-gray-400">
          {title}
        </p>

        <p className="font-black text-gray-900 text-lg">
          {value}
        </p>

      </div>

    </div>
  );
}

/* =========================================================
   REVENUE
========================================================= */

function RevenueRow({
  label,
  value,
  negative = false,
}) {
  return (
    <div className="flex items-center justify-between gap-4">

      <p className="text-sm text-gray-500">
        {label}
      </p>

      <p
        className={`font-bold text-sm ${
          negative
            ? "text-red-500"
            : "text-gray-800"
        }`}
      >
        {negative && "- "}
        KES {money(value)}
      </p>

    </div>
  );
}

/* =========================================================
   STATUS CARD
========================================================= */

function StatusCard({
  title,
  icon: Icon,
  items,
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 sm:p-6">

      <div className="flex items-center gap-2">

        <Icon
          size={18}
          className="text-orange-500"
        />

        <h3 className="font-black text-gray-900">
          {title}
        </h3>

      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6">

        {items.map(
          (item) => (

            <div
              key={
                item.label
              }
              className="bg-gray-50 rounded-xl p-4"
            >

              <p className="text-xs text-gray-400">
                {item.label}
              </p>

              <p className="text-xl font-black text-gray-900 mt-1">
                {number(
                  item.value
                )}
              </p>

            </div>

          )
        )}

      </div>

    </div>
  );
}

/* =========================================================
   BADGE
========================================================= */

function Badge({
  children,
}) {
  return (
    <span className="inline-flex items-center bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full text-[10px] font-bold">
      {children}
    </span>
  );
}

/* =========================================================
   STATUS
========================================================= */

function StatusBadge({
  status,
}) {
  const value =
    String(
      status || ""
    ).toLowerCase();

  const success =
    [
      "paid",
      "confirmed",
      "used",
      "completed",
    ].includes(value);

  const danger =
    [
      "failed",
      "cancelled",
      "refunded",
    ].includes(value);

  const warning =
    value === "pending";

  return (
    <span
      className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold capitalize ${
        success
          ? "bg-green-50 text-green-600"
          : danger
            ? "bg-red-50 text-red-500"
            : warning
              ? "bg-yellow-50 text-yellow-700"
              : "bg-gray-100 text-gray-500"
      }`}
    >
      {status || "Unknown"}
    </span>
  );
}

/* =========================================================
   CHART TOOLTIP
========================================================= */

function SalesTooltip({
  active,
  payload,
  label,
}) {
  if (
    !active ||
    !payload?.length
  ) {
    return null;
  }

  const data =
    payload[0]?.payload ||
    {};

  return (
    <div className="bg-gray-900 text-white rounded-xl p-3 shadow-xl text-xs">

      <p className="font-bold">
        {formatDate(label)}
      </p>

      <p className="mt-2 text-gray-300">
        Tickets:{" "}
        <strong className="text-white">
          {data.tickets || 0}
        </strong>
      </p>

      <p className="text-gray-300 mt-1">
        Revenue:{" "}
        <strong className="text-white">
          KES{" "}
          {money(
            data.revenue
          )}
        </strong>
      </p>

    </div>
  );
}

/* =========================================================
   EMPTY CHART
========================================================= */

function ChartEmpty() {
  return (
    <div className="h-[300px] flex flex-col items-center justify-center text-center">

      <TrendingUp
        size={30}
        className="text-gray-300"
      />

      <p className="font-bold text-gray-600 mt-3">
        No sales data yet
      </p>

      <p className="text-xs text-gray-400 mt-1">
        Ticket sales will appear here after successful bookings.
      </p>

    </div>
  );
}

/* =========================================================
   LOADING
========================================================= */

function AnalyticsLoading() {
  return (
    <div className="min-h-screen bg-gray-50 animate-pulse">

      <div className="h-20 bg-white border-b border-gray-100" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="h-52 bg-gray-200 rounded-3xl" />

        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-6">

          {[1, 2, 3, 4].map(
            (item) => (
              <div
                key={item}
                className="h-40 bg-white rounded-2xl border border-gray-100"
              />
            )
          )}

        </div>

        <div className="grid xl:grid-cols-2 gap-5 mt-6">

          <div className="h-96 bg-white rounded-2xl border border-gray-100" />

          <div className="h-96 bg-white rounded-2xl border border-gray-100" />

        </div>

      </div>

    </div>
  );
}

/* =========================================================
   HELPERS
========================================================= */

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

function number(value) {
  return Number(
    value || 0
  ).toLocaleString(
    "en-KE"
  );
}

function formatDate(value) {
  if (!value) {
    return "—";
  }

  try {
    return new Date(
      `${String(value).split("T")[0]}T00:00:00`
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

function shortDate(value) {
  if (!value) {
    return "";
  }

  try {
    return new Date(
      `${value}T00:00:00`
    ).toLocaleDateString(
      "en-KE",
      {
        day: "numeric",
        month: "short",
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