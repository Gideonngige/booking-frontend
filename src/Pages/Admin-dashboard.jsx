import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Navigate,
  useNavigate,
} from "react-router-dom";

import {
  LayoutDashboard,
  CalendarDays,
  Users,
  WalletCards,
  Menu,
  X,
  LogOut,
  Bell,
  Search,
  RefreshCw,
  TicketCheck,
  Banknote,
  UserRound,
  CalendarCheck2,
  CheckCircle2,
  Clock3,
  ShieldCheck,
  Trash2,
  UserX,
  UserCheck,
  Send,
  Eye,
  MapPin,
  Phone,
  Mail,
  ChevronRight,
  TrendingUp,
  CircleDollarSign,
  Image as ImageIcon,
} from "lucide-react";

import api from "../Api/api";
import Swal from "sweetalert2";

import logo from "../assets/logo.png";

/* =========================================================
   NAVIGATION
========================================================= */

const navigationItems = [
  {
    id: "dashboard",
    label: "Overview",
    icon: LayoutDashboard,
  },
  {
    id: "events",
    label: "Events",
    icon: CalendarDays,
  },
  {
    id: "users",
    label: "Users",
    icon: Users,
  },
  {
    id: "payouts",
    label: "Payouts",
    icon: WalletCards,
  },
];

/* =========================================================
   ADMIN DASHBOARD
========================================================= */

export default function AdminDashboard() {
  const navigate = useNavigate();

  /* =========================================================
     USER
  ========================================================= */

  let savedUser = {};

  try {
    savedUser = JSON.parse(
      localStorage.getItem("user") ||
        "{}"
    );
  } catch {
    savedUser = {};
  }

  /* =========================================================
     STATE
  ========================================================= */

  const [
    activeTab,
    setActiveTab,
  ] = useState("dashboard");

  const [stats, setStats] =
    useState(null);

  const [events, setEvents] =
    useState([]);

  const [users, setUsers] =
    useState([]);

  const [payouts, setPayouts] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState(null);

  const [
    sendingPayoutId,
    setSendingPayoutId,
  ] = useState(null);

  const [
    verifyingEventId,
    setVerifyingEventId,
  ] = useState(null);

  const [
    deletingEventId,
    setDeletingEventId,
  ] = useState(null);

  const [
    suspendingUserId,
    setSuspendingUserId,
  ] = useState(null);

  const [
    selectedImage,
    setSelectedImage,
  ] = useState(null);

  const [
    sidebarOpen,
    setSidebarOpen,
  ] = useState(false);

  const [search, setSearch] =
    useState("");

  /* =========================================================
     AUTH GUARD
  ========================================================= */

  if (
    !savedUser ||
    savedUser.role !== "admin"
  ) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  /* =========================================================
     API HELPER
  ========================================================= */

  const apiFetch = async (
    url,
    options = {}
  ) => {
    const response = await api({
      url,

      method:
        options.method ||
        "GET",

      data:
        options.body
          ? JSON.parse(
              options.body
            )
          : null,

      /*
       * Keep this header for compatibility
       * with your current backend.
       *
       * Your Axios interceptor should also
       * already send the JWT token.
       */
      headers: {
        "User-Id":
          savedUser.user_id,
      },
    });

    return response.data;
  };

  /* =========================================================
     LOAD TAB
  ========================================================= */

  const loadCurrentTab =
    async () => {
      setLoading(true);
      setError(null);

      try {
        if (
          activeTab ===
          "dashboard"
        ) {
          const data =
            await apiFetch(
              "/api/admin/stats/"
            );

          setStats(data);
        }

        if (
          activeTab ===
          "events"
        ) {
          const data =
            await apiFetch(
              "/api/admin/events/"
            );

          setEvents(
            data.events || []
          );
        }

        if (
          activeTab ===
          "users"
        ) {
          const data =
            await apiFetch(
              "/api/admin/users/"
            );

          setUsers(
            data.users || []
          );
        }

        if (
          activeTab ===
          "payouts"
        ) {
          const data =
            await apiFetch(
              "/api/admin/payouts/"
            );

          setPayouts(
            data.payouts || []
          );
        }
      } catch (err) {
        console.error(
          "Admin dashboard:",
          err
        );

        const message =
          err.response?.data
            ?.message ||
          err.message ||
          "An unexpected error occurred.";

        setError(message);

        Swal.fire({
          icon: "error",
          title:
            "Failed to Fetch Data",
          text: message,
          confirmButtonColor:
            "#f97316",
        });
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadCurrentTab();
  }, [activeTab]);

  /* =========================================================
     CHANGE TAB
  ========================================================= */

  const changeTab = (
    tab
  ) => {
    setActiveTab(tab);
    setSidebarOpen(false);
    setSearch("");
  };

  /* =========================================================
     LOGOUT
  ========================================================= */

  const handleLogout =
    async () => {
      const result =
        await Swal.fire({
          title: "Sign out?",
          text:
            "You will need to sign in again to access the admin dashboard.",
          icon: "question",
          showCancelButton: true,
          confirmButtonText:
            "Sign Out",
          cancelButtonText:
            "Cancel",
          confirmButtonColor:
            "#f97316",
        });

      if (!result.isConfirmed) {
        return;
      }

      localStorage.removeItem(
        "access_token"
      );

      localStorage.removeItem(
        "refresh_token"
      );

      localStorage.removeItem(
        "user"
      );

      navigate("/login", {
        replace: true,
      });
    };

  /* =========================================================
     DELETE EVENT
  ========================================================= */

  const handleDeleteEvent =
    async (event) => {
      const result =
        await Swal.fire({
          icon: "warning",

          title: "Delete Event?",

          html: `
            <div style="text-align:center">
              <p>This will permanently delete</p>
              <strong>${escapeHtml(
                event.title
              )}</strong>
              <p style="margin-top:8px;color:#6b7280;font-size:13px">
                This action cannot be undone.
              </p>
            </div>
          `,

          showCancelButton: true,

          confirmButtonText:
            "Delete Event",

          cancelButtonText:
            "Cancel",

          confirmButtonColor:
            "#ef4444",
        });

      if (!result.isConfirmed) {
        return;
      }

      setDeletingEventId(
        event.id
      );

      try {
        await apiFetch(
          `/api/admin/events/${event.id}/`,
          {
            method: "DELETE",
          }
        );

        setEvents(
          (previous) =>
            previous.filter(
              (item) =>
                item.id !==
                event.id
            )
        );

        Swal.fire({
          icon: "success",
          title:
            "Event Deleted",
          text:
            "The event has been deleted successfully.",
          timer: 1500,
          showConfirmButton:
            false,
        });
      } catch (err) {
        Swal.fire({
          icon: "error",
          title:
            "Failed to Delete Event",
          text:
            err.response?.data
              ?.message ||
            err.message ||
            "An unexpected error occurred.",
          confirmButtonColor:
            "#f97316",
        });
      } finally {
        setDeletingEventId(
          null
        );
      }
    };

  /* =========================================================
     VERIFY EVENT
  ========================================================= */

  const handleVerifyEvent =
    async (event) => {
      const result =
        await Swal.fire({
          title:
            "Verify Event?",

          html: `
            <p>
              Verify
              <strong>${escapeHtml(
                event.title
              )}</strong>?
            </p>
            <p style="font-size:13px;color:#6b7280;margin-top:8px">
              Once verified, the event can be shown as verified on Karibu Event.
            </p>
          `,

          icon: "question",

          showCancelButton: true,

          confirmButtonText:
            "Verify Event",

          cancelButtonText:
            "Cancel",

          confirmButtonColor:
            "#f97316",
        });

      if (!result.isConfirmed) {
        return;
      }

      setVerifyingEventId(
        event.id
      );

      try {
        const response =
          await api.patch(
            `/api/admin/events/${event.id}/verify/`,
            {},
            {
              headers: {
                "User-Id":
                  savedUser.user_id,
              },
            }
          );

        setEvents(
          (previous) =>
            previous.map(
              (item) =>
                item.id ===
                event.id
                  ? {
                      ...item,
                      is_verified:
                        true,
                    }
                  : item
            )
        );

        Swal.fire({
          icon: "success",
          title:
            "Event Verified",
          text:
            response.data
              .message ||
            "The event has been verified successfully.",
          timer: 1600,
          showConfirmButton:
            false,
        });
      } catch (err) {
        Swal.fire({
          icon: "error",

          title:
            "Verification Failed",

          text:
            err.response?.data
              ?.message ||
            err.message ||
            "Unable to verify this event.",

          confirmButtonColor:
            "#f97316",
        });
      } finally {
        setVerifyingEventId(
          null
        );
      }
    };

  /* =========================================================
     SUSPEND USER
  ========================================================= */

  const handleSuspendUser =
    async (user) => {
      const action =
        user.isSuspended
          ? "unsuspend"
          : "suspend";

      const result =
        await Swal.fire({
          icon:
            user.isSuspended
              ? "question"
              : "warning",

          title:
            user.isSuspended
              ? "Restore User?"
              : "Suspend User?",

          text:
            user.isSuspended
              ? `Restore access for ${user.name}?`
              : `Suspend ${user.name}'s account?`,

          showCancelButton:
            true,

          confirmButtonText:
            user.isSuspended
              ? "Unsuspend"
              : "Suspend",

          confirmButtonColor:
            user.isSuspended
              ? "#16a34a"
              : "#ef4444",
        });

      if (!result.isConfirmed) {
        return;
      }

      setSuspendingUserId(
        user.id
      );

      try {
        const data =
          await apiFetch(
            `/api/admin/users/${user.id}/suspend/`,
            {
              method:
                "PATCH",
            }
          );

        setUsers(
          (previous) =>
            previous.map(
              (item) =>
                item.id ===
                user.id
                  ? {
                      ...item,
                      isSuspended:
                        data.isSuspended,
                    }
                  : item
            )
        );

        Swal.fire({
          icon: "success",

          title:
            action ===
            "suspend"
              ? "User Suspended"
              : "User Restored",

          timer: 1400,

          showConfirmButton:
            false,
        });
      } catch (err) {
        Swal.fire({
          icon: "error",

          title:
            "Unable to Update User",

          text:
            err.response?.data
              ?.message ||
            err.message ||
            "An unexpected error occurred.",

          confirmButtonColor:
            "#f97316",
        });
      } finally {
        setSuspendingUserId(
          null
        );
      }
    };

  /* =========================================================
     SEND PAYOUT
  ========================================================= */

  const handleMarkPaid =
    async (payout) => {
      const result =
        await Swal.fire({
          icon: "question",

          title:
            "Send Organizer Payout?",

          html: `
            <div style="text-align:left;background:#f9fafb;padding:14px;border-radius:10px">
              <p><strong>Event:</strong> ${escapeHtml(
                payout.title
              )}</p>
              <p style="margin-top:6px"><strong>Organizer:</strong> ${escapeHtml(
                payout.creator
              )}</p>
              <p style="margin-top:6px"><strong>Phone:</strong> ${escapeHtml(
                payout.creatorPhone ||
                  "-"
              )}</p>
              <p style="margin-top:6px"><strong>Payable:</strong> KES ${Number(
                payout.payable ||
                  0
              ).toLocaleString()}</p>
            </div>
          `,

          showCancelButton:
            true,

          confirmButtonText:
            "Send Payout",

          cancelButtonText:
            "Cancel",

          confirmButtonColor:
            "#16a34a",
        });

      if (!result.isConfirmed) {
        return;
      }

      setSendingPayoutId(
        payout.id
      );

      try {
        const response =
          await api.post(
            "/api/admin/pay_event_organizer/",
            {
              event_id:
                payout.id,
            },
            {
              headers: {
                "User-Id":
                  savedUser.user_id,
              },
            }
          );

        Swal.fire({
          icon: "success",
          title:
            "Payout Initiated",
          text:
            response.data
              .message ||
            "The organizer payout has been initiated.",
          confirmButtonColor:
            "#f97316",
        });

        const data =
          await apiFetch(
            "/api/admin/payouts/"
          );

        setPayouts(
          data.payouts || []
        );
      } catch (err) {
        Swal.fire({
          icon: "error",

          title:
            "Payout Failed",

          text:
            err.response?.data
              ?.message ||
            err.message ||
            "An unexpected error occurred.",

          confirmButtonColor:
            "#f97316",
        });
      } finally {
        setSendingPayoutId(
          null
        );
      }
    };

  /* =========================================================
     FILTER DATA
  ========================================================= */

  const filteredEvents =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return events;
      }

      return events.filter(
        (event) =>
          event.title
            ?.toLowerCase()
            .includes(query) ||
          event.creator
            ?.toLowerCase()
            .includes(query) ||
          event.status
            ?.toLowerCase()
            .includes(query)
      );
    }, [events, search]);

  const filteredUsers =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return users;
      }

      return users.filter(
        (user) =>
          user.name
            ?.toLowerCase()
            .includes(query) ||
          user.email
            ?.toLowerCase()
            .includes(query) ||
          user.role
            ?.toLowerCase()
            .includes(query)
      );
    }, [users, search]);

  const filteredPayouts =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return payouts;
      }

      return payouts.filter(
        (payout) =>
          payout.title
            ?.toLowerCase()
            .includes(query) ||
          payout.creator
            ?.toLowerCase()
            .includes(query) ||
          payout.creatorPhone
            ?.toLowerCase()
            .includes(query)
      );
    }, [payouts, search]);

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <div className="min-h-screen bg-[#f7f7f8]">

      {/* =====================================================
          MOBILE OVERLAY
      ===================================================== */}

      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() =>
            setSidebarOpen(
              false
            )
          }
          className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40 lg:hidden"
        />
      )}

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside
        className={`fixed top-0 left-0 bottom-0 w-[270px] bg-gray-950 text-white z-50 transition-transform duration-300 ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >

        <div className="h-full flex flex-col">

          {/* ===============================================
              LOGO
          =============================================== */}

          <div className="h-20 px-5 flex items-center justify-between border-b border-white/10">

            <button
              type="button"
              onClick={() =>
                navigate("/")
              }
              className="flex items-center gap-3"
            >

              <div className="w-11 h-11 rounded-xl bg-white p-1.5 overflow-hidden">

                <img
                  src={logo}
                  alt="Karibu Event"
                  className="w-full h-full object-contain"
                />

              </div>

              <div className="text-left">

                <p className="font-black text-sm">
                  Karibu Event
                </p>

                <p className="text-[10px] text-gray-500 mt-0.5 uppercase tracking-wider">
                  Administration
                </p>

              </div>

            </button>

            <button
              type="button"
              onClick={() =>
                setSidebarOpen(
                  false
                )
              }
              className="lg:hidden w-9 h-9 rounded-lg hover:bg-white/10 flex items-center justify-center text-gray-400"
            >
              <X size={18} />
            </button>

          </div>

          {/* ===============================================
              ADMIN
          =============================================== */}

          <div className="mx-4 mt-5 bg-white/[0.05] border border-white/[0.06] rounded-xl p-3">

            <div className="flex items-center gap-3">

              <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center font-black text-sm">

                {getInitials(
                  savedUser.name ||
                    savedUser.username ||
                    "Admin"
                )}

              </div>

              <div className="min-w-0">

                <p className="font-bold text-sm truncate">
                  {savedUser.name ||
                    savedUser.username ||
                    "Administrator"}
                </p>

                <div className="flex items-center gap-1 text-[10px] text-orange-400 mt-1">

                  <ShieldCheck
                    size={11}
                  />

                  System Administrator

                </div>

              </div>

            </div>

          </div>

          {/* ===============================================
              NAVIGATION
          =============================================== */}

          <nav className="flex-1 px-4 mt-7">

            <p className="text-[10px] uppercase tracking-[0.16em] font-bold text-gray-600 px-3 mb-3">
              Management
            </p>

            <div className="space-y-1.5">

              {navigationItems.map(
                (item) => {
                  const Icon =
                    item.icon;

                  const active =
                    activeTab ===
                    item.id;

                  return (
                    <button
                      type="button"
                      key={
                        item.id
                      }
                      onClick={() =>
                        changeTab(
                          item.id
                        )
                      }
                      className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition ${
                        active
                          ? "bg-orange-500 text-white shadow-lg shadow-orange-500/10"
                          : "text-gray-400 hover:bg-white/[0.06] hover:text-white"
                      }`}
                    >

                      <Icon
                        size={18}
                      />

                      <span>
                        {
                          item.label
                        }
                      </span>

                      {active && (
                        <ChevronRight
                          size={15}
                          className="ml-auto"
                        />
                      )}

                    </button>
                  );
                }
              )}

            </div>

          </nav>

          {/* ===============================================
              FOOTER
          =============================================== */}

          <div className="p-4 border-t border-white/10">

            <button
              type="button"
              onClick={
                handleLogout
              }
              className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition"
            >
              <LogOut
                size={18}
              />

              Sign Out
            </button>

            <p className="text-[10px] text-gray-700 text-center mt-4">
              ©{" "}
              {new Date().getFullYear()}{" "}
              Karibu Event
            </p>

          </div>

        </div>

      </aside>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <div className="lg:ml-[270px] min-h-screen">

        {/* ===================================================
            TOPBAR
        =================================================== */}

        <header className="sticky top-0 z-30 h-20 bg-white/95 backdrop-blur border-b border-gray-100">

          <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">

            <div className="flex items-center gap-3">

              <button
                type="button"
                onClick={() =>
                  setSidebarOpen(
                    true
                  )
                }
                className="lg:hidden w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600"
              >
                <Menu
                  size={20}
                />
              </button>

              <div>

                <p className="font-black text-gray-900 text-lg sm:text-xl">
                  {
                    getPageTitle(
                      activeTab
                    )
                  }
                </p>

                <p className="hidden sm:block text-xs text-gray-400 mt-0.5">
                  {
                    getPageDescription(
                      activeTab
                    )
                  }
                </p>

              </div>

            </div>

            <div className="flex items-center gap-2">

              {activeTab !==
                "dashboard" && (

                <div className="hidden md:block relative">

                  <Search
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="text"
                    value={
                      search
                    }
                    onChange={(
                      e
                    ) =>
                      setSearch(
                        e.target
                          .value
                      )
                    }
                    placeholder={`Search ${activeTab}...`}
                    className="w-56 lg:w-64 h-10 pl-10 pr-4 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-500/10"
                  />

                </div>

              )}

              <button
                type="button"
                onClick={
                  loadCurrentTab
                }
                disabled={
                  loading
                }
                className="w-10 h-10 rounded-xl border border-gray-200 hover:bg-gray-50 flex items-center justify-center text-gray-500 disabled:opacity-50"
                title="Refresh"
              >
                <RefreshCw
                  size={17}
                  className={
                    loading
                      ? "animate-spin"
                      : ""
                  }
                />
              </button>

              <button
                type="button"
                className="relative w-10 h-10 rounded-xl border border-gray-200 hover:bg-gray-50 flex items-center justify-center text-gray-500"
              >
                <Bell
                  size={18}
                />

                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-orange-500 border-2 border-white" />

              </button>

            </div>

          </div>

        </header>

        {/* ===================================================
            CONTENT
        =================================================== */}

        <main className="px-4 sm:px-6 lg:px-8 py-7 lg:py-8">

          {/* Mobile search */}

          {activeTab !==
            "dashboard" && (

            <div className="md:hidden relative mb-5">

              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                placeholder={`Search ${activeTab}...`}
                className="w-full h-11 pl-10 pr-4 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-300"
              />

            </div>

          )}

          {/* Error */}

          {error && (

            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm flex items-center justify-between gap-4">

              <span>
                {error}
              </span>

              <button
                type="button"
                onClick={() =>
                  setError(null)
                }
              >
                <X size={16} />
              </button>

            </div>

          )}

          {loading ? (

            <DashboardLoading
              activeTab={
                activeTab
              }
            />

          ) : (

            <>
              {/* =============================================
                  DASHBOARD
              ============================================= */}

              {activeTab ===
                "dashboard" &&
                stats && (

                <DashboardOverview
                  stats={
                    stats
                  }
                  onNavigate={
                    changeTab
                  }
                />

              )}

              {/* =============================================
                  EVENTS
              ============================================= */}

              {activeTab ===
                "events" && (

                <EventsSection
                  events={
                    filteredEvents
                  }
                  total={
                    events.length
                  }
                  selectedImage={
                    setSelectedImage
                  }
                  handleVerifyEvent={
                    handleVerifyEvent
                  }
                  handleDeleteEvent={
                    handleDeleteEvent
                  }
                  verifyingEventId={
                    verifyingEventId
                  }
                  deletingEventId={
                    deletingEventId
                  }
                />

              )}

              {/* =============================================
                  USERS
              ============================================= */}

              {activeTab ===
                "users" && (

                <UsersSection
                  users={
                    filteredUsers
                  }
                  total={
                    users.length
                  }
                  handleSuspendUser={
                    handleSuspendUser
                  }
                  suspendingUserId={
                    suspendingUserId
                  }
                />

              )}

              {/* =============================================
                  PAYOUTS
              ============================================= */}

              {activeTab ===
                "payouts" && (

                <PayoutsSection
                  payouts={
                    filteredPayouts
                  }
                  total={
                    payouts.length
                  }
                  handleMarkPaid={
                    handleMarkPaid
                  }
                  sendingPayoutId={
                    sendingPayoutId
                  }
                />

              )}

            </>
          )}

        </main>

      </div>

      {/* =====================================================
          IMAGE MODAL
      ===================================================== */}

      {selectedImage && (

        <div
          role="presentation"
          onClick={() =>
            setSelectedImage(
              null
            )
          }
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
        >

          <button
            type="button"
            onClick={() =>
              setSelectedImage(
                null
              )
            }
            className="absolute top-5 right-5 w-11 h-11 bg-white/10 hover:bg-white/20 rounded-full text-white flex items-center justify-center"
          >
            <X size={20} />
          </button>

          <img
            src={
              selectedImage
            }
            alt="Event"
            onClick={(e) =>
              e.stopPropagation()
            }
            className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
          />

        </div>

      )}

    </div>
  );
}

/* =========================================================
   OVERVIEW
========================================================= */

function DashboardOverview({
  stats,
  onNavigate,
}) {
  const totalRevenue =
    Number(
      stats.totalRevenue ||
        0
    );

  const totalUsers =
    Number(
      stats.totalUsers ||
        0
    );

  const totalEvents =
    Number(
      stats.totalEvents ||
        0
    );

  const totalTickets =
    Number(
      stats.totalTickets ||
        0
    );

  return (
    <div>

      {/* Welcome */}

      <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-orange-600 to-gray-900 rounded-3xl p-6 sm:p-8 lg:p-10">

        <div className="absolute -right-20 -top-28 w-80 h-80 rounded-full bg-white/5" />

        <div className="absolute right-20 bottom-[-100px] w-56 h-56 rounded-full border border-white/10" />

        <div className="relative max-w-2xl">

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-xs text-orange-100 font-semibold">

            <ShieldCheck
              size={14}
            />

            Administration Center

          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white mt-5">
            Karibu Event at a glance
          </h1>

          <p className="text-orange-100/80 text-sm sm:text-base leading-relaxed mt-3">

            Monitor users, events,
            ticket activity and
            organizer payouts from
            one place.

          </p>

        </div>

      </div>

      {/* KPI */}

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-6">

        <StatCard
          title="Total Users"
          value={
            totalUsers.toLocaleString()
          }
          description="Registered accounts"
          icon={UserRound}
        />

        <StatCard
          title="Total Events"
          value={
            totalEvents.toLocaleString()
          }
          description="Events on platform"
          icon={
            CalendarCheck2
          }
        />

        <StatCard
          title="Tickets Sold"
          value={
            totalTickets.toLocaleString()
          }
          description="Platform ticket sales"
          icon={
            TicketCheck
          }
        />

        <StatCard
          title="Total Revenue"
          value={`KES ${totalRevenue.toLocaleString()}`}
          description="Ticketing revenue"
          icon={Banknote}
        />

      </div>

      {/* Management */}

      <div className="grid lg:grid-cols-3 gap-5 mt-7">

        <QuickAction
          icon={
            CalendarDays
          }
          title="Manage Events"
          description="Review events, verify organizer listings and remove inappropriate events."
          button="View Events"
          onClick={() =>
            onNavigate(
              "events"
            )
          }
        />

        <QuickAction
          icon={Users}
          title="Manage Users"
          description="Review registered users and manage account access."
          button="View Users"
          onClick={() =>
            onNavigate(
              "users"
            )
          }
        />

        <QuickAction
          icon={
            WalletCards
          }
          title="Organizer Payouts"
          description="Review revenue, commissions and pending organizer payouts."
          button="View Payouts"
          onClick={() =>
            onNavigate(
              "payouts"
            )
          }
        />

      </div>

      {/* Revenue summary */}

      <div className="grid lg:grid-cols-2 gap-5 mt-7">

        <div className="bg-white border border-gray-100 rounded-2xl p-5 sm:p-6">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm font-bold text-gray-800">
                Platform activity
              </p>

              <p className="text-xs text-gray-400 mt-1">
                Current platform totals
              </p>

            </div>

            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">

              <TrendingUp
                size={19}
              />

            </div>

          </div>

          <div className="space-y-5 mt-6">

            <ProgressRow
              label="Users"
              value={
                totalUsers
              }
              max={Math.max(
                totalUsers,
                totalEvents,
                totalTickets,
                1
              )}
            />

            <ProgressRow
              label="Events"
              value={
                totalEvents
              }
              max={Math.max(
                totalUsers,
                totalEvents,
                totalTickets,
                1
              )}
            />

            <ProgressRow
              label="Tickets"
              value={
                totalTickets
              }
              max={Math.max(
                totalUsers,
                totalEvents,
                totalTickets,
                1
              )}
            />

          </div>

        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 sm:p-6">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm font-bold text-gray-800">
                Revenue overview
              </p>

              <p className="text-xs text-gray-400 mt-1">
                Total recorded revenue
              </p>

            </div>

            <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">

              <CircleDollarSign
                size={20}
              />

            </div>

          </div>

          <p className="text-3xl sm:text-4xl font-black text-gray-900 mt-8">
            KES{" "}
            {totalRevenue.toLocaleString()}
          </p>

          <p className="text-sm text-gray-400 mt-2">
            Revenue generated through
            event ticket transactions.
          </p>

          <button
            type="button"
            onClick={() =>
              onNavigate(
                "payouts"
              )
            }
            className="mt-7 text-sm font-bold text-orange-500 hover:text-orange-600 flex items-center gap-1"
          >
            Review organizer payouts

            <ChevronRight
              size={16}
            />
          </button>

        </div>

      </div>

    </div>
  );
}

/* =========================================================
   EVENTS
========================================================= */

function EventsSection({
  events,
  total,
  selectedImage,
  handleVerifyEvent,
  handleDeleteEvent,
  verifyingEventId,
  deletingEventId,
}) {
  const pending =
    events.filter(
      (event) =>
        !event.is_verified
    ).length;

  const verified =
    events.filter(
      (event) =>
        event.is_verified
    ).length;

  return (
    <div>

      <SectionHeader
        title="Event Management"
        description="Review, verify and manage events published on Karibu Event."
        count={`${total} events`}
      />

      {/* Stats */}

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-5">

        <MiniStat
          label="Events"
          value={total}
          icon={
            CalendarDays
          }
        />

        <MiniStat
          label="Verified"
          value={verified}
          icon={
            CheckCircle2
          }
        />

        <MiniStat
          label="Pending"
          value={pending}
          icon={Clock3}
          className="col-span-2 lg:col-span-1"
        />

      </div>

      {events.length === 0 ? (

        <EmptyState
          icon={
            CalendarDays
          }
          title="No events found"
          description="No events match your current search."
        />

      ) : (

        <>
          {/* Desktop */}

          <div className="hidden xl:block bg-white border border-gray-100 rounded-2xl overflow-hidden mt-6">

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead className="bg-gray-50/80 border-b border-gray-100">

                  <tr className="text-[11px] uppercase tracking-wider text-gray-400">

                    <th className="text-left font-bold px-5 py-4">
                      Event
                    </th>

                    <th className="text-left font-bold px-4 py-4">
                      Organizer
                    </th>

                    <th className="text-left font-bold px-4 py-4">
                      Date
                    </th>

                    <th className="text-left font-bold px-4 py-4">
                      Price
                    </th>

                    <th className="text-left font-bold px-4 py-4">
                      Status
                    </th>

                    <th className="text-left font-bold px-4 py-4">
                      Verification
                    </th>

                    <th className="text-right font-bold px-5 py-4">
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-gray-100">

                  {events.map(
                    (event) => (

                      <tr
                        key={
                          event.id
                        }
                        className="hover:bg-gray-50/60 transition"
                      >

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-3">

                            <button
                              type="button"
                              onClick={() =>
                                selectedImage(
                                  event.image
                                )
                              }
                              className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 group"
                            >

                              {event.image ? (

                                <img
                                  src={
                                    event.image
                                  }
                                  alt={
                                    event.title
                                  }
                                  className="w-full h-full object-cover"
                                />

                              ) : (

                                <ImageIcon
                                  size={20}
                                  className="m-auto text-gray-300"
                                />

                              )}

                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition">

                                <Eye className="text-white opacity-0 group-hover:opacity-100" size={17} />

                              </div>

                            </button>

                            <div className="min-w-0">

                              <p className="font-bold text-gray-800 text-sm max-w-[220px] truncate">
                                {
                                  event.title
                                }
                              </p>

                              {event.location && (

                                <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">

                                  <MapPin
                                    size={11}
                                  />

                                  <span className="max-w-[180px] truncate">
                                    {
                                      event.location
                                    }
                                  </span>

                                </p>

                              )}

                            </div>

                          </div>

                        </td>

                        <td className="px-4 py-4 text-sm text-gray-600">
                          {
                            event.creator
                          }
                        </td>

                        <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">
                          {formatDate(
                            event.date
                          )}
                        </td>

                        <td className="px-4 py-4 font-bold text-gray-700 text-sm whitespace-nowrap">

                          {Number(
                            event.price ||
                              0
                          ) === 0
                            ? "Free"
                            : `KES ${Number(
                                event.price
                              ).toLocaleString()}`}

                        </td>

                        <td className="px-4 py-4">

                          <StatusBadge
                            status={
                              event.status
                            }
                          />

                        </td>

                        <td className="px-4 py-4">

                          {event.is_verified ? (

                            <Badge
                              type="success"
                            >
                              <CheckCircle2
                                size={12}
                              />
                              Verified
                            </Badge>

                          ) : (

                            <Badge
                              type="warning"
                            >
                              <Clock3
                                size={12}
                              />
                              Pending
                            </Badge>

                          )}

                        </td>

                        <td className="px-5 py-4">

                          <div className="flex justify-end gap-2">

                            {!event.is_verified && (

                              <button
                                type="button"
                                disabled={
                                  verifyingEventId ===
                                  event.id
                                }
                                onClick={() =>
                                  handleVerifyEvent(
                                    event
                                  )
                                }
                                className="px-3 py-2 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-600 text-xs font-bold disabled:opacity-50"
                              >

                                {verifyingEventId ===
                                event.id
                                  ? "Verifying..."
                                  : "Verify"}

                              </button>

                            )}

                            <button
                              type="button"
                              disabled={
                                deletingEventId ===
                                event.id
                              }
                              onClick={() =>
                                handleDeleteEvent(
                                  event
                                )
                              }
                              className="w-9 h-9 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center disabled:opacity-50"
                              title="Delete event"
                            >
                              <Trash2
                                size={15}
                              />
                            </button>

                          </div>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          </div>

          {/* Mobile/tablet */}

          <div className="xl:hidden grid sm:grid-cols-2 gap-4 mt-6">

            {events.map(
              (event) => (

                <div
                  key={
                    event.id
                  }
                  className="bg-white border border-gray-100 rounded-2xl overflow-hidden"
                >

                  <button
                    type="button"
                    onClick={() =>
                      event.image &&
                      selectedImage(
                        event.image
                      )
                    }
                    className="w-full h-36 bg-gray-100 overflow-hidden"
                  >

                    {event.image ? (

                      <img
                        src={
                          event.image
                        }
                        alt={
                          event.title
                        }
                        className="w-full h-full object-cover"
                      />

                    ) : (

                      <div className="h-full flex items-center justify-center text-gray-300">
                        <ImageIcon
                          size={30}
                        />
                      </div>

                    )}

                  </button>

                  <div className="p-4">

                    <div className="flex items-start justify-between gap-3">

                      <div>

                        <p className="font-black text-gray-800">
                          {
                            event.title
                          }
                        </p>

                        <p className="text-xs text-gray-400 mt-1">
                          by{" "}
                          {
                            event.creator
                          }
                        </p>

                      </div>

                      {event.is_verified ? (

                        <Badge type="success">
                          Verified
                        </Badge>

                      ) : (

                        <Badge type="warning">
                          Pending
                        </Badge>

                      )}

                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-4">

                      <InfoBox
                        label="Date"
                        value={formatDate(
                          event.date
                        )}
                      />

                      <InfoBox
                        label="Price"
                        value={
                          Number(
                            event.price ||
                              0
                          ) === 0
                            ? "Free"
                            : `KES ${Number(
                                event.price
                              ).toLocaleString()}`
                        }
                      />

                    </div>

                    <div className="flex gap-2 mt-4">

                      {!event.is_verified && (

                        <button
                          type="button"
                          disabled={
                            verifyingEventId ===
                            event.id
                          }
                          onClick={() =>
                            handleVerifyEvent(
                              event
                            )
                          }
                          className="flex-1 h-10 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-bold disabled:opacity-50"
                        >
                          {verifyingEventId ===
                          event.id
                            ? "Verifying..."
                            : "Verify"}
                        </button>

                      )}

                      <button
                        type="button"
                        disabled={
                          deletingEventId ===
                          event.id
                        }
                        onClick={() =>
                          handleDeleteEvent(
                            event
                          )
                        }
                        className="h-10 px-4 bg-red-50 text-red-500 rounded-xl flex items-center justify-center disabled:opacity-50"
                      >
                        <Trash2
                          size={16}
                        />
                      </button>

                    </div>

                  </div>

                </div>

              )
            )}

          </div>

        </>
      )}

    </div>
  );
}

/* =========================================================
   USERS
========================================================= */

function UsersSection({
  users,
  total,
  handleSuspendUser,
  suspendingUserId,
}) {
  const active =
    users.filter(
      (user) =>
        !user.isSuspended
    ).length;

  const suspended =
    users.filter(
      (user) =>
        user.isSuspended
    ).length;

  return (
    <div>

      <SectionHeader
        title="User Management"
        description="Review registered users and control account access."
        count={`${total} users`}
      />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-5">

        <MiniStat
          label="Users"
          value={total}
          icon={Users}
        />

        <MiniStat
          label="Active"
          value={active}
          icon={UserCheck}
        />

        <MiniStat
          label="Suspended"
          value={suspended}
          icon={UserX}
          className="col-span-2 lg:col-span-1"
        />

      </div>

      {users.length === 0 ? (

        <EmptyState
          icon={Users}
          title="No users found"
          description="No users match your current search."
        />

      ) : (

        <>
          {/* Desktop */}

          <div className="hidden lg:block bg-white border border-gray-100 rounded-2xl overflow-hidden mt-6">

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead className="bg-gray-50/80 border-b border-gray-100">

                  <tr className="text-[11px] uppercase tracking-wider text-gray-400">

                    <th className="text-left px-5 py-4">
                      User
                    </th>

                    <th className="text-left px-4 py-4">
                      Role
                    </th>

                    <th className="text-left px-4 py-4">
                      Joined
                    </th>

                    <th className="text-left px-4 py-4">
                      Status
                    </th>

                    <th className="text-right px-5 py-4">
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-gray-100">

                  {users.map(
                    (user) => (

                      <tr
                        key={
                          user.id
                        }
                        className="hover:bg-gray-50/60"
                      >

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-3">

                            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center font-black text-xs flex-shrink-0">

                              {getInitials(
                                user.name
                              )}

                            </div>

                            <div>

                              <p className="font-bold text-sm text-gray-800">
                                {
                                  user.name
                                }
                              </p>

                              <p className="text-xs text-gray-400 mt-0.5">
                                {
                                  user.email
                                }
                              </p>

                            </div>

                          </div>

                        </td>

                        <td className="px-4 py-4">

                          <Badge type="orange">
                            {user.role}
                          </Badge>

                        </td>

                        <td className="px-4 py-4 text-sm text-gray-500">
                          {formatDate(
                            user.createdAt
                          )}
                        </td>

                        <td className="px-4 py-4">

                          {user.isSuspended ? (

                            <Badge type="danger">
                              Suspended
                            </Badge>

                          ) : (

                            <Badge type="success">
                              Active
                            </Badge>

                          )}

                        </td>

                        <td className="px-5 py-4 text-right">

                          <button
                            type="button"
                            disabled={
                              suspendingUserId ===
                              user.id
                            }
                            onClick={() =>
                              handleSuspendUser(
                                user
                              )
                            }
                            className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold disabled:opacity-50 ${
                              user.isSuspended
                                ? "bg-green-50 hover:bg-green-100 text-green-600"
                                : "bg-red-50 hover:bg-red-100 text-red-500"
                            }`}
                          >

                            {user.isSuspended ? (
                              <UserCheck
                                size={14}
                              />
                            ) : (
                              <UserX
                                size={14}
                              />
                            )}

                            {suspendingUserId ===
                            user.id
                              ? "Updating..."
                              : user.isSuspended
                                ? "Unsuspend"
                                : "Suspend"}

                          </button>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          </div>

          {/* Mobile */}

          <div className="lg:hidden space-y-3 mt-6">

            {users.map(
              (user) => (

                <div
                  key={
                    user.id
                  }
                  className="bg-white border border-gray-100 rounded-2xl p-4"
                >

                  <div className="flex items-start gap-3">

                    <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center font-black text-xs flex-shrink-0">

                      {getInitials(
                        user.name
                      )}

                    </div>

                    <div className="min-w-0 flex-1">

                      <div className="flex items-start justify-between gap-2">

                        <div className="min-w-0">

                          <p className="font-bold text-gray-800 truncate">
                            {
                              user.name
                            }
                          </p>

                          <p className="text-xs text-gray-400 truncate mt-1">
                            {
                              user.email
                            }
                          </p>

                        </div>

                        {user.isSuspended ? (
                          <Badge type="danger">
                            Suspended
                          </Badge>
                        ) : (
                          <Badge type="success">
                            Active
                          </Badge>
                        )}

                      </div>

                      <div className="flex items-center gap-2 mt-3">

                        <Badge type="orange">
                          {user.role}
                        </Badge>

                        <span className="text-xs text-gray-400">
                          Joined{" "}
                          {formatDate(
                            user.createdAt
                          )}
                        </span>

                      </div>

                    </div>

                  </div>

                  <button
                    type="button"
                    disabled={
                      suspendingUserId ===
                      user.id
                    }
                    onClick={() =>
                      handleSuspendUser(
                        user
                      )
                    }
                    className={`w-full h-10 rounded-xl text-sm font-bold mt-4 flex items-center justify-center gap-2 disabled:opacity-50 ${
                      user.isSuspended
                        ? "bg-green-50 text-green-600"
                        : "bg-red-50 text-red-500"
                    }`}
                  >

                    {user.isSuspended ? (
                      <UserCheck
                        size={15}
                      />
                    ) : (
                      <UserX
                        size={15}
                      />
                    )}

                    {user.isSuspended
                      ? "Restore Account"
                      : "Suspend Account"}

                  </button>

                </div>

              )
            )}

          </div>

        </>
      )}

    </div>
  );
}

/* =========================================================
   PAYOUTS
========================================================= */

function PayoutsSection({
  payouts,
  total,
  handleMarkPaid,
  sendingPayoutId,
}) {
  const pending =
    payouts.filter(
      (payout) =>
        payout.status !==
        "paid"
    );

  const paid =
    payouts.filter(
      (payout) =>
        payout.status ===
        "paid"
    );

  const pendingAmount =
    pending.reduce(
      (sum, payout) =>
        sum +
        Number(
          payout.payable ||
            0
        ),
      0
    );

  return (
    <div>

      <SectionHeader
        title="Organizer Payouts"
        description="Review event revenue, platform commission and organizer settlements."
        count={`${total} payouts`}
      />

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 mt-5">

        <MiniStat
          label="Payout Records"
          value={total}
          icon={
            WalletCards
          }
        />

        <MiniStat
          label="Pending"
          value={
            pending.length
          }
          icon={Clock3}
        />

        <MiniStat
          label="Paid"
          value={
            paid.length
          }
          icon={
            CheckCircle2
          }
        />

        <MiniStat
          label="Pending Amount"
          value={`KES ${pendingAmount.toLocaleString()}`}
          icon={Banknote}
        />

      </div>

      {payouts.length === 0 ? (

        <EmptyState
          icon={
            WalletCards
          }
          title="No payouts found"
          description="No payout records match your current search."
        />

      ) : (

        <>
          {/* Desktop */}

          <div className="hidden xl:block bg-white border border-gray-100 rounded-2xl overflow-hidden mt-6">

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead className="bg-gray-50/80 border-b border-gray-100">

                  <tr className="text-[11px] uppercase tracking-wider text-gray-400">

                    <th className="text-left px-5 py-4">
                      Event
                    </th>

                    <th className="text-left px-4 py-4">
                      Organizer
                    </th>

                    <th className="text-left px-4 py-4">
                      Revenue
                    </th>

                    <th className="text-left px-4 py-4">
                      Commission
                    </th>

                    <th className="text-left px-4 py-4">
                      Payable
                    </th>

                    <th className="text-left px-4 py-4">
                      Date
                    </th>

                    <th className="text-left px-4 py-4">
                      Payment
                    </th>

                    <th className="text-right px-5 py-4">
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-gray-100">

                  {payouts.map(
                    (payout) => (

                      <tr
                        key={
                          payout.id
                        }
                        className="hover:bg-gray-50/60"
                      >

                        <td className="px-5 py-4">

                          <p className="font-bold text-sm text-gray-800 max-w-[190px] truncate">
                            {
                              payout.title
                            }
                          </p>

                        </td>

                        <td className="px-4 py-4">

                          <p className="text-sm font-semibold text-gray-700">
                            {
                              payout.creator
                            }
                          </p>

                          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">

                            <Phone
                              size={11}
                            />

                            {
                              payout.creatorPhone
                            }

                          </p>

                        </td>

                        <td className="px-4 py-4 text-sm text-gray-600 whitespace-nowrap">
                          KES{" "}
                          {Number(
                            payout.totalRevenue ||
                              0
                          ).toLocaleString()}
                        </td>

                        <td className="px-4 py-4 text-sm text-red-500 whitespace-nowrap">
                          - KES{" "}
                          {Number(
                            payout.commission ||
                              0
                          ).toLocaleString()}
                        </td>

                        <td className="px-4 py-4 text-sm font-black text-green-600 whitespace-nowrap">
                          KES{" "}
                          {Number(
                            payout.payable ||
                              0
                          ).toLocaleString()}
                        </td>

                        <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">
                          {formatDate(
                            payout.date
                          )}
                        </td>

                        <td className="px-4 py-4">

                          <PaymentStatus
                            status={
                              payout.paymentStatus
                            }
                          />

                        </td>

                        <td className="px-5 py-4 text-right">

                          {payout.status ===
                          "paid" ? (

                            <Badge type="success">
                              <CheckCircle2
                                size={12}
                              />
                              Paid
                            </Badge>

                          ) : (

                            <button
                              type="button"
                              disabled={
                                sendingPayoutId ===
                                payout.id
                              }
                              onClick={() =>
                                handleMarkPaid(
                                  payout
                                )
                              }
                              className="inline-flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold disabled:opacity-50"
                            >

                              {sendingPayoutId ===
                              payout.id ? (
                                <RefreshCw
                                  size={13}
                                  className="animate-spin"
                                />
                              ) : (
                                <Send
                                  size={13}
                                />
                              )}

                              {sendingPayoutId ===
                              payout.id
                                ? "Sending..."
                                : "Send Payout"}

                            </button>

                          )}

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          </div>

          {/* Mobile/tablet */}

          <div className="xl:hidden grid md:grid-cols-2 gap-4 mt-6">

            {payouts.map(
              (payout) => (

                <div
                  key={
                    payout.id
                  }
                  className="bg-white border border-gray-100 rounded-2xl p-5"
                >

                  <div className="flex items-start justify-between gap-3">

                    <div>

                      <p className="font-black text-gray-800">
                        {
                          payout.title
                        }
                      </p>

                      <p className="text-xs text-gray-400 mt-1">
                        {
                          payout.creator
                        }
                      </p>

                    </div>

                    {payout.status ===
                    "paid" ? (
                      <Badge type="success">
                        Paid
                      </Badge>
                    ) : (
                      <Badge type="warning">
                        Pending
                      </Badge>
                    )}

                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-4">

                    <Phone
                      size={13}
                    />

                    {
                      payout.creatorPhone
                    }

                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-5">

                    <InfoBox
                      label="Revenue"
                      value={`KES ${Number(
                        payout.totalRevenue ||
                          0
                      ).toLocaleString()}`}
                    />

                    <InfoBox
                      label="Commission"
                      value={`KES ${Number(
                        payout.commission ||
                          0
                      ).toLocaleString()}`}
                    />

                  </div>

                  <div className="bg-green-50 border border-green-100 rounded-xl p-4 mt-3">

                    <p className="text-[10px] uppercase font-bold text-green-600">
                      Organizer receives
                    </p>

                    <p className="font-black text-green-700 text-xl mt-1">
                      KES{" "}
                      {Number(
                        payout.payable ||
                          0
                      ).toLocaleString()}
                    </p>

                  </div>

                  <div className="flex justify-between items-center mt-4 text-xs">

                    <span className="text-gray-400">
                      {formatDate(
                        payout.date
                      )}
                    </span>

                    <PaymentStatus
                      status={
                        payout.paymentStatus
                      }
                    />

                  </div>

                  {payout.status !==
                    "paid" && (

                    <button
                      type="button"
                      disabled={
                        sendingPayoutId ===
                        payout.id
                      }
                      onClick={() =>
                        handleMarkPaid(
                          payout
                        )
                      }
                      className="w-full h-11 mt-4 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                    >

                      {sendingPayoutId ===
                      payout.id ? (
                        <RefreshCw
                          size={15}
                          className="animate-spin"
                        />
                      ) : (
                        <Send
                          size={15}
                        />
                      )}

                      {sendingPayoutId ===
                      payout.id
                        ? "Sending Payout..."
                        : "Send Payout"}

                    </button>

                  )}

                </div>

              )
            )}

          </div>

        </>
      )}

    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  title,
  value,
  description,
  icon: Icon,
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md transition">

      <div className="flex items-start justify-between">

        <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">

          <Icon size={20} />

        </div>

      </div>

      <p className="text-2xl font-black text-gray-900 mt-5 break-words">
        {value}
      </p>

      <p className="text-sm font-bold text-gray-700 mt-1">
        {title}
      </p>

      <p className="text-xs text-gray-400 mt-1">
        {description}
      </p>

    </div>
  );
}

/* =========================================================
   MINI STAT
========================================================= */

function MiniStat({
  label,
  value,
  icon: Icon,
  className = "",
}) {
  return (
    <div
      className={`bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 ${className}`}
    >

      <div className="flex items-center justify-between gap-3">

        <div>

          <p className="text-xs text-gray-400">
            {label}
          </p>

          <p className="text-xl sm:text-2xl font-black text-gray-900 mt-1">
            {value}
          </p>

        </div>

        <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">

          <Icon size={18} />

        </div>

      </div>

    </div>
  );
}

/* =========================================================
   QUICK ACTION
========================================================= */

function QuickAction({
  icon: Icon,
  title,
  description,
  button,
  onClick,
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 sm:p-6">

      <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">

        <Icon size={20} />

      </div>

      <h3 className="font-black text-gray-800 mt-5">
        {title}
      </h3>

      <p className="text-sm text-gray-400 leading-relaxed mt-2">
        {description}
      </p>

      <button
        type="button"
        onClick={onClick}
        className="text-sm font-bold text-orange-500 hover:text-orange-600 mt-5 flex items-center gap-1"
      >
        {button}

        <ChevronRight
          size={16}
        />
      </button>

    </div>
  );
}

/* =========================================================
   SECTION HEADER
========================================================= */

function SectionHeader({
  title,
  description,
  count,
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">

      <div>

        <h1 className="text-2xl font-black text-gray-900">
          {title}
        </h1>

        <p className="text-sm text-gray-400 mt-1.5">
          {description}
        </p>

      </div>

      <span className="w-fit bg-orange-50 text-orange-600 text-xs font-bold px-3 py-1.5 rounded-full">
        {count}
      </span>

    </div>
  );
}

/* =========================================================
   BADGE
========================================================= */

function Badge({
  children,
  type = "default",
}) {
  const styles = {
    success:
      "bg-green-50 text-green-600 border-green-100",

    warning:
      "bg-yellow-50 text-yellow-700 border-yellow-100",

    danger:
      "bg-red-50 text-red-600 border-red-100",

    orange:
      "bg-orange-50 text-orange-600 border-orange-100",

    default:
      "bg-gray-50 text-gray-500 border-gray-100",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] font-bold capitalize whitespace-nowrap ${
        styles[type]
      }`}
    >
      {children}
    </span>
  );
}

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({
  status,
}) {
  const value =
    String(
      status || ""
    ).toLowerCase();

  if (
    value === "active"
  ) {
    return (
      <Badge type="success">
        Active
      </Badge>
    );
  }

  if (
    value === "upcoming"
  ) {
    return (
      <Badge type="orange">
        Upcoming
      </Badge>
    );
  }

  return (
    <Badge type="default">
      {status || "Unknown"}
    </Badge>
  );
}

/* =========================================================
   PAYMENT STATUS
========================================================= */

function PaymentStatus({
  status,
}) {
  const value =
    String(
      status || ""
    ).toLowerCase();

  if (
    value === "paid" ||
    value === "completed" ||
    value === "success"
  ) {
    return (
      <Badge type="success">
        {status}
      </Badge>
    );
  }

  if (
    value === "failed"
  ) {
    return (
      <Badge type="danger">
        {status}
      </Badge>
    );
  }

  return (
    <Badge type="warning">
      {status ||
        "Pending"}
    </Badge>
  );
}

/* =========================================================
   INFO BOX
========================================================= */

function InfoBox({
  label,
  value,
}) {
  return (
    <div className="bg-gray-50 rounded-xl p-3">

      <p className="text-[10px] uppercase tracking-wide text-gray-400 font-bold">
        {label}
      </p>

      <p className="text-sm font-bold text-gray-700 mt-1">
        {value}
      </p>

    </div>
  );
}

/* =========================================================
   PROGRESS ROW
========================================================= */

function ProgressRow({
  label,
  value,
  max,
}) {
  const percentage =
    Math.min(
      100,
      Math.max(
        0,
        (Number(value) /
          Number(max || 1)) *
          100
      )
    );

  return (
    <div>

      <div className="flex justify-between text-xs mb-2">

        <span className="font-semibold text-gray-500">
          {label}
        </span>

        <span className="font-black text-gray-700">
          {Number(
            value
          ).toLocaleString()}
        </span>

      </div>

      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">

        <div
          className="h-full bg-orange-500 rounded-full"
          style={{
            width: `${percentage}%`,
          }}
        />

      </div>

    </div>
  );
}

/* =========================================================
   EMPTY
========================================================= */

function EmptyState({
  icon: Icon,
  title,
  description,
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl py-16 px-5 text-center mt-6">

      <div className="w-14 h-14 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center mx-auto">

        <Icon size={24} />

      </div>

      <h3 className="font-black text-gray-800 mt-4">
        {title}
      </h3>

      <p className="text-sm text-gray-400 mt-2">
        {description}
      </p>

    </div>
  );
}

/* =========================================================
   LOADING
========================================================= */

function DashboardLoading({
  activeTab,
}) {
  if (
    activeTab ===
    "dashboard"
  ) {
    return (
      <div className="animate-pulse">

        <div className="h-52 bg-gray-200 rounded-3xl" />

        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-6">

          {[1, 2, 3, 4].map(
            (item) => (

              <div
                key={item}
                className="h-40 bg-white border border-gray-100 rounded-2xl"
              />

            )
          )}

        </div>

        <div className="grid lg:grid-cols-3 gap-5 mt-7">

          {[1, 2, 3].map(
            (item) => (

              <div
                key={item}
                className="h-52 bg-white border border-gray-100 rounded-2xl"
              />

            )
          )}

        </div>

      </div>
    );
  }

  return (
    <div className="animate-pulse">

      <div className="h-8 bg-gray-200 rounded-lg w-56" />

      <div className="h-4 bg-gray-100 rounded-lg w-96 max-w-full mt-3" />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mt-6">

        {[1, 2, 3].map(
          (item) => (

            <div
              key={item}
              className="h-24 bg-white rounded-2xl border border-gray-100"
            />

          )
        )}

      </div>

      <div className="h-96 bg-white border border-gray-100 rounded-2xl mt-6" />

    </div>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function getPageTitle(
  activeTab
) {
  switch (activeTab) {
    case "events":
      return "Events";

    case "users":
      return "Users";

    case "payouts":
      return "Payouts";

    default:
      return "Admin Dashboard";
  }
}

function getPageDescription(
  activeTab
) {
  switch (activeTab) {
    case "events":
      return "Review and manage events";

    case "users":
      return "Manage platform users";

    case "payouts":
      return "Manage organizer settlements";

    default:
      return "Monitor Karibu Event operations";
  }
}

function formatDate(
  value
) {
  if (!value) {
    return "—";
  }

  try {
    return new Date(
      value
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

function getInitials(
  value = ""
) {
  return String(value)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(
      (word) =>
        word[0]?.toUpperCase()
    )
    .join("") || "A";
}

function escapeHtml(
  value = ""
) {
  return String(value)
    .replaceAll(
      "&",
      "&amp;"
    )
    .replaceAll(
      "<",
      "&lt;"
    )
    .replaceAll(
      ">",
      "&gt;"
    )
    .replaceAll(
      '"',
      "&quot;"
    )
    .replaceAll(
      "'",
      "&#039;"
    );
}