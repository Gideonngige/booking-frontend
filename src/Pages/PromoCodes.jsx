import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Navigate } from "react-router-dom";

import {
  FaArrowLeft,
  FaTag,
  FaPlus,
  FaPercent,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaUsers,
  FaCheckCircle,
  FaTimesCircle,
  FaCopy,
  FaSyncAlt,
  FaTicketAlt,
} from "react-icons/fa";

import {
  MdDiscount,
  MdToggleOn,
  MdToggleOff,
} from "react-icons/md";

import Swal from "sweetalert2";
import api from "../Api/api";

export default function PromoCodes() {
  const { id } = useParams();
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

  const [promoCodes, setPromoCodes] = useState([]);
  const [event, setEvent] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [creating, setCreating] = useState(false);

  const [error, setError] = useState(null);

  const [showCreateForm, setShowCreateForm] = useState(false);

  const [togglingId, setTogglingId] = useState(null);

  /* =========================================================
     FORM
  ========================================================= */

  const [form, setForm] = useState({
    code: "",
    discount_type: "percentage",
    discount_value: "",
    usage_limit: "",
    starts_at: "",
    expires_at: "",
  });

  /* =========================================================
     REDIRECT
  ========================================================= */

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "organizer") {
    return <Navigate to="/" replace />;
  }

  /* =========================================================
     FETCH PROMO CODES
  ========================================================= */

  const fetchPromoCodes = async (mainLoader = false) => {
    try {
      if (mainLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError(null);

      const response = await api.get(
        `/api/events/${id}/promo-codes/`
      );

      const data = response.data;

      /*
        Supports responses such as:

        {
          event: {...},
          promo_codes: [...]
        }

        or simply:

        {
          promo_codes: [...]
        }
      */

      setPromoCodes(data.promo_codes || []);

      if (data.event) {
        setEvent(data.event);
      } else {
        /*
          If promo endpoint doesn't return event details,
          try your existing single event endpoint.
        */

        try {
          const eventResponse = await api.get(
            `/api/events/${id}`
          );

          setEvent(eventResponse.data);
        } catch (eventError) {
          console.warn(
            "Could not load event details:",
            eventError
          );
        }
      }
    } catch (err) {
      console.error("Promo codes fetch error:", err);

      const message =
        err.response?.data?.message ||
        "Failed to load promo codes.";

      setError(message);

      if (!mainLoader) {
        Swal.fire({
          icon: "error",
          title: "Unable to Refresh",
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
    fetchPromoCodes(true);
  }, [id]);

  /* =========================================================
     FORM CHANGE
  ========================================================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    let newValue = value;

    /*
      Promo codes are stored/displayed uppercase.
    */

    if (name === "code") {
      newValue = value
        .toUpperCase()
        .replace(/\s+/g, "");
    }

    setForm((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  /* =========================================================
     RESET FORM
  ========================================================= */

  const resetForm = () => {
    setForm({
      code: "",
      discount_type: "percentage",
      discount_value: "",
      usage_limit: "",
      starts_at: "",
      expires_at: "",
    });
  };

  /* =========================================================
     CREATE PROMO CODE
  ========================================================= */

  const handleCreatePromo = async (e) => {
    e.preventDefault();

    /* =======================================================
       VALIDATION
    ======================================================= */

    if (!form.code.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Promo Code Required",
        text: "Enter a promo code.",
        confirmButtonColor: "#f97316",
      });

      return;
    }

    if (
      !form.discount_value ||
      Number(form.discount_value) <= 0
    ) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Discount",
        text: "Enter a valid discount value.",
        confirmButtonColor: "#f97316",
      });

      return;
    }

    if (
      form.discount_type === "percentage" &&
      Number(form.discount_value) > 100
    ) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Percentage",
        text: "Percentage discount cannot exceed 100%.",
        confirmButtonColor: "#f97316",
      });

      return;
    }

    if (
      form.usage_limit &&
      Number(form.usage_limit) <= 0
    ) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Usage Limit",
        text: "Usage limit must be greater than zero.",
        confirmButtonColor: "#f97316",
      });

      return;
    }

    if (
      form.starts_at &&
      form.expires_at &&
      new Date(form.expires_at) <= new Date(form.starts_at)
    ) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Dates",
        text: "Expiry date must be after the start date.",
        confirmButtonColor: "#f97316",
      });

      return;
    }

    setCreating(true);

    try {
      const payload = {
        event_id: Number(id),

        code: form.code.trim().toUpperCase(),

        discount_type: form.discount_type,

        discount_value: Number(form.discount_value),

        usage_limit: form.usage_limit
          ? Number(form.usage_limit)
          : null,

        starts_at: form.starts_at
          ? new Date(form.starts_at).toISOString()
          : null,

        expires_at: form.expires_at
          ? new Date(form.expires_at).toISOString()
          : null,
      };

      await api.post(
        "/api/promo-codes/create/",
        payload
      );

      await Swal.fire({
        icon: "success",
        title: "Promo Code Created",
        text: `${form.code} is now ready to use.`,
        confirmButtonColor: "#f97316",
      });

      resetForm();
      setShowCreateForm(false);

      await fetchPromoCodes(false);
    } catch (err) {
      console.error("Create promo error:", err);

      Swal.fire({
        icon: "error",
        title: "Unable to Create Promo",
        text:
          err.response?.data?.message ||
          "Failed to create the promo code.",
        confirmButtonColor: "#f97316",
      });
    } finally {
      setCreating(false);
    }
  };

  /* =========================================================
     TOGGLE PROMO CODE
  ========================================================= */

  const handleTogglePromo = async (promo) => {
    const action = promo.is_active
      ? "deactivate"
      : "activate";

    const result = await Swal.fire({
      icon: "question",

      title: promo.is_active
        ? "Deactivate Promo Code?"
        : "Activate Promo Code?",

      text: promo.is_active
        ? `${promo.code} will no longer be accepted during checkout.`
        : `${promo.code} will become available for customers.`,

      showCancelButton: true,

      confirmButtonText:
        action === "activate"
          ? "Activate"
          : "Deactivate",

      cancelButtonText: "Cancel",

      confirmButtonColor:
        action === "activate"
          ? "#16a34a"
          : "#dc2626",
    });

    if (!result.isConfirmed) {
      return;
    }

    setTogglingId(promo.id);

    try {
      const response = await api.patch(
        `/api/promo-codes/${promo.id}/toggle/`
      );

      /*
        If backend returns updated state, use it.
        Otherwise simply refresh.
      */

      if (
        typeof response.data?.is_active === "boolean"
      ) {
        setPromoCodes((previous) =>
          previous.map((item) =>
            item.id === promo.id
              ? {
                  ...item,
                  is_active:
                    response.data.is_active,
                  is_valid:
                    response.data.is_valid ??
                    response.data.is_active,
                }
              : item
          )
        );
      } else {
        await fetchPromoCodes(false);
      }

      Swal.fire({
        icon: "success",
        title: promo.is_active
          ? "Promo Deactivated"
          : "Promo Activated",
        timer: 1400,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error("Toggle promo error:", err);

      Swal.fire({
        icon: "error",
        title: "Unable to Update Promo",
        text:
          err.response?.data?.message ||
          "Failed to update the promo code.",
        confirmButtonColor: "#f97316",
      });
    } finally {
      setTogglingId(null);
    }
  };

  /* =========================================================
     COPY PROMO CODE
  ========================================================= */

  const handleCopy = async (code) => {
    try {
      await navigator.clipboard.writeText(code);

      Swal.fire({
        icon: "success",
        title: "Copied",
        text: `${code} copied to clipboard.`,
        timer: 1200,
        showConfirmButton: false,
      });
    } catch {
      Swal.fire({
        icon: "error",
        title: "Copy Failed",
        text: "Unable to copy promo code.",
        confirmButtonColor: "#f97316",
      });
    }
  };

  /* =========================================================
     CALCULATED STATS
  ========================================================= */

  const stats = useMemo(() => {
    const total = promoCodes.length;

    const active = promoCodes.filter(
      (promo) => promo.is_active
    ).length;

    const valid = promoCodes.filter(
      (promo) => promo.is_valid
    ).length;

    const totalUses = promoCodes.reduce(
      (sum, promo) =>
        sum + Number(promo.times_used || 0),
      0
    );

    return {
      total,
      active,
      valid,
      totalUses,
    };
  }, [promoCodes]);

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">

        <div className="text-center">

          <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto" />

          <p className="text-gray-500 mt-4">
            Loading promo codes...
          </p>

        </div>

      </div>
    );
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="min-h-screen bg-gray-100">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="bg-gradient-to-r from-orange-500 to-gray-900 text-white">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          <button
            type="button"
            onClick={() =>
              navigate("/creator-dashboard")
            }
            className="flex items-center gap-2 text-orange-100 hover:text-white text-sm font-medium"
          >
            <FaArrowLeft />

            Back to Dashboard
          </button>

          <div className="mt-5 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">

            <div>

              <div className="flex items-center gap-3">

                <div className="w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center">

                  <MdDiscount className="text-2xl" />

                </div>

                <div>

                  <p className="text-orange-100 text-sm">
                    Event Marketing
                  </p>

                  <h1 className="text-3xl font-bold">
                    Promo Codes
                  </h1>

                </div>

              </div>

              <p className="text-orange-100 mt-4">
                {event?.title ||
                  "Manage discounts for your event"}
              </p>

            </div>

            <div className="flex flex-wrap gap-3">

              <button
                type="button"
                onClick={() =>
                  fetchPromoCodes(false)
                }
                disabled={refreshing}
                className="flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-2.5 rounded-xl font-semibold hover:bg-white/20 disabled:opacity-50"
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
                onClick={() => {
                  resetForm();

                  setShowCreateForm(
                    (previous) => !previous
                  );
                }}
                className="flex items-center gap-2 bg-white text-orange-500 px-5 py-2.5 rounded-xl font-bold hover:bg-orange-50"
              >
                <FaPlus />

                New Promo Code
              </button>

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

          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">

            <p className="font-semibold text-red-700">
              Unable to load promo codes
            </p>

            <p className="text-sm text-red-600 mt-1">
              {error}
            </p>

          </div>

        )}

        {/* ===================================================
            STATS
        =================================================== */}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

          <StatCard
            title="Total Codes"
            value={stats.total}
            icon={<FaTag />}
          />

          <StatCard
            title="Active"
            value={stats.active}
            icon={<FaCheckCircle />}
          />

          <StatCard
            title="Currently Valid"
            value={stats.valid}
            icon={<MdDiscount />}
          />

          <StatCard
            title="Total Uses"
            value={stats.totalUses}
            icon={<FaUsers />}
          />

        </div>

        {/* ===================================================
            CREATE FORM
        =================================================== */}

        {showCreateForm && (

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mt-6 overflow-hidden">

            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">

              <div>

                <h2 className="text-xl font-bold text-gray-800">
                  Create Promo Code
                </h2>

                <p className="text-sm text-gray-400 mt-1">
                  Create a discount customers can apply
                  during ticket checkout.
                </p>

              </div>

              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  resetForm();
                }}
                className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500"
              >
                <FaTimesCircle />
              </button>

            </div>

            <form
              onSubmit={handleCreatePromo}
              className="p-6"
            >

              <div className="grid md:grid-cols-2 gap-5">

                {/* CODE */}

                <FormGroup
                  label="Promo Code"
                  required
                >

                  <div className="relative">

                    <FaTag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                    <input
                      type="text"
                      name="code"
                      value={form.code}
                      onChange={handleChange}
                      placeholder="EARLY20"
                      maxLength={50}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent uppercase"
                    />

                  </div>

                  <p className="text-xs text-gray-400 mt-1">
                    Customers enter this code during checkout.
                  </p>

                </FormGroup>

                {/* DISCOUNT TYPE */}

                <FormGroup
                  label="Discount Type"
                  required
                >

                  <select
                    name="discount_type"
                    value={form.discount_type}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                  >
                    <option value="percentage">
                      Percentage Discount
                    </option>

                    <option value="fixed">
                      Fixed Amount
                    </option>
                  </select>

                </FormGroup>

                {/* DISCOUNT VALUE */}

                <FormGroup
                  label={
                    form.discount_type ===
                    "percentage"
                      ? "Discount Percentage"
                      : "Discount Amount"
                  }
                  required
                >

                  <div className="relative">

                    {form.discount_type ===
                    "percentage" ? (
                      <FaPercent className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    ) : (
                      <FaMoneyBillWave className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    )}

                    <input
                      type="number"
                      name="discount_value"
                      value={form.discount_value}
                      onChange={handleChange}
                      min="0"
                      step={
                        form.discount_type ===
                        "percentage"
                          ? "1"
                          : "0.01"
                      }
                      max={
                        form.discount_type ===
                        "percentage"
                          ? "100"
                          : undefined
                      }
                      placeholder={
                        form.discount_type ===
                        "percentage"
                          ? "20"
                          : "500"
                      }
                      className="w-full pl-10 pr-16 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500"
                    />

                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                      {form.discount_type ===
                      "percentage"
                        ? "%"
                        : "KES"}
                    </span>

                  </div>

                </FormGroup>

                {/* USAGE LIMIT */}

                <FormGroup label="Usage Limit">

                  <div className="relative">

                    <FaUsers className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                    <input
                      type="number"
                      name="usage_limit"
                      value={form.usage_limit}
                      onChange={handleChange}
                      min="1"
                      placeholder="e.g. 100"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500"
                    />

                  </div>

                  <p className="text-xs text-gray-400 mt-1">
                    Leave blank for unlimited usage.
                  </p>

                </FormGroup>

                {/* START */}

                <FormGroup label="Starts At">

                  <input
                    type="datetime-local"
                    name="starts_at"
                    value={form.starts_at}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500"
                  />

                </FormGroup>

                {/* EXPIRES */}

                <FormGroup label="Expires At">

                  <input
                    type="datetime-local"
                    name="expires_at"
                    value={form.expires_at}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500"
                  />

                </FormGroup>

              </div>

              {/* PREVIEW */}

              {form.code &&
                form.discount_value && (

                  <div className="mt-6 bg-orange-50 border border-orange-100 rounded-xl p-4">

                    <p className="text-xs font-semibold text-orange-500 uppercase">
                      Preview
                    </p>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-2">

                      <div>

                        <p className="text-xl font-black text-gray-800">
                          {form.code}
                        </p>

                        <p className="text-sm text-gray-500 mt-1">

                          Get{" "}

                          <span className="font-bold text-orange-500">

                            {form.discount_type ===
                            "percentage"
                              ? `${form.discount_value}%`
                              : `KES ${Number(
                                  form.discount_value
                                ).toLocaleString()}`}

                          </span>{" "}

                          off your ticket purchase.

                        </p>

                      </div>

                      <FaTicketAlt className="text-orange-300 text-3xl" />

                    </div>

                  </div>

                )}

              {/* BUTTONS */}

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-6">

                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    resetForm();
                  }}
                  disabled={creating}
                  className="px-5 py-3 border border-gray-200 rounded-xl text-gray-600 font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={creating}
                  className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold disabled:opacity-50"
                >

                  {creating ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />

                      Creating...
                    </>
                  ) : (
                    <>
                      <FaPlus />

                      Create Promo Code
                    </>
                  )}

                </button>

              </div>

            </form>

          </div>

        )}

        {/* ===================================================
            PROMO CODE LIST
        =================================================== */}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mt-6 overflow-hidden">

          <div className="px-5 sm:px-6 py-5 border-b border-gray-100">

            <h2 className="text-xl font-bold text-gray-800">
              Event Promo Codes
            </h2>

            <p className="text-sm text-gray-400 mt-1">
              Manage discounts and monitor how often
              customers use them.
            </p>

          </div>

          {/* NO PROMOS */}

          {promoCodes.length === 0 ? (

            <div className="text-center py-16 px-4">

              <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto">

                <MdDiscount className="text-orange-500 text-3xl" />

              </div>

              <h3 className="text-lg font-bold text-gray-700 mt-4">
                No promo codes yet
              </h3>

              <p className="text-sm text-gray-400 mt-2 max-w-md mx-auto">
                Create discounts such as early-bird,
                student or limited-time offers to help
                increase ticket sales.
              </p>

              <button
                type="button"
                onClick={() =>
                  setShowCreateForm(true)
                }
                className="mt-5 inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-semibold"
              >
                <FaPlus />

                Create Promo Code
              </button>

            </div>

          ) : (

            <>
              {/* =============================================
                  DESKTOP TABLE
              ============================================= */}

              <div className="hidden md:block overflow-x-auto">

                <table className="w-full">

                  <thead className="bg-gray-50">

                    <tr className="text-xs uppercase text-gray-500">

                      <th className="px-6 py-3 text-left">
                        Promo
                      </th>

                      <th className="px-4 py-3 text-left">
                        Discount
                      </th>

                      <th className="px-4 py-3 text-left">
                        Usage
                      </th>

                      <th className="px-4 py-3 text-left">
                        Schedule
                      </th>

                      <th className="px-4 py-3 text-left">
                        Status
                      </th>

                      <th className="px-6 py-3 text-right">
                        Action
                      </th>

                    </tr>

                  </thead>

                  <tbody className="divide-y divide-gray-100">

                    {promoCodes.map((promo) => (

                      <PromoTableRow
                        key={promo.id}
                        promo={promo}
                        toggling={
                          togglingId === promo.id
                        }
                        onToggle={() =>
                          handleTogglePromo(promo)
                        }
                        onCopy={() =>
                          handleCopy(promo.code)
                        }
                      />

                    ))}

                  </tbody>

                </table>

              </div>

              {/* =============================================
                  MOBILE CARDS
              ============================================= */}

              <div className="md:hidden p-4 space-y-4">

                {promoCodes.map((promo) => (

                  <PromoMobileCard
                    key={promo.id}
                    promo={promo}
                    toggling={
                      togglingId === promo.id
                    }
                    onToggle={() =>
                      handleTogglePromo(promo)
                    }
                    onCopy={() =>
                      handleCopy(promo.code)
                    }
                  />

                ))}

              </div>

            </>

          )}

        </div>

        {/* ===================================================
            HELP
        =================================================== */}

        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5 mt-6">

          <div className="flex gap-3">

            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-orange-500 flex-shrink-0">

              <FaTag />

            </div>

            <div>

              <h3 className="font-bold text-gray-800">
                Promo Code Tips
              </h3>

              <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                Use short and memorable codes such as{" "}
                <strong>EARLY20</strong>,{" "}
                <strong>STUDENT10</strong> or{" "}
                <strong>VIP500</strong>. Adding an expiry
                date or usage limit can create urgency
                without permanently reducing your ticket
                price.
              </p>

            </div>

          </div>

        </div>

      </main>

    </div>
  );
}

/* =========================================================
   PROMO TABLE ROW
========================================================= */

function PromoTableRow({
  promo,
  toggling,
  onToggle,
  onCopy,
}) {
  const status = getPromoStatus(promo);

  return (
    <tr className="hover:bg-gray-50/70">

      {/* CODE */}

      <td className="px-6 py-4">

        <div className="flex items-center gap-3">

          <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500">

            <FaTag />

          </div>

          <div>

            <div className="flex items-center gap-2">

              <p className="font-black text-gray-800 tracking-wide">
                {promo.code}
              </p>

              <button
                type="button"
                onClick={onCopy}
                title="Copy code"
                className="text-gray-400 hover:text-orange-500"
              >
                <FaCopy />
              </button>

            </div>

            <p className="text-xs text-gray-400 mt-1">
              Created{" "}
              {formatDateTime(promo.created_at)}
            </p>

          </div>

        </div>

      </td>

      {/* DISCOUNT */}

      <td className="px-4 py-4">

        <p className="font-bold text-orange-500">

          {promo.discount_type === "percentage"
            ? `${Number(
                promo.discount_value
              )}%`
            : `KES ${Number(
                promo.discount_value
              ).toLocaleString()}`}

        </p>

        <p className="text-xs text-gray-400 mt-1">
          {promo.discount_type === "percentage"
            ? "Percentage"
            : "Fixed amount"}
        </p>

      </td>

      {/* USAGE */}

      <td className="px-4 py-4">

        <p className="font-semibold text-gray-700">

          {Number(promo.times_used || 0)}

          {promo.usage_limit
            ? ` / ${promo.usage_limit}`
            : ""}

        </p>

        <p className="text-xs text-gray-400 mt-1">
          {promo.usage_limit
            ? "uses"
            : "Unlimited"}
        </p>

      </td>

      {/* SCHEDULE */}

      <td className="px-4 py-4">

        <div className="space-y-1 text-xs">

          <p className="text-gray-500 flex items-center gap-1">

            <FaCalendarAlt className="text-gray-400" />

            {promo.starts_at
              ? formatDateTime(promo.starts_at)
              : "Starts immediately"}

          </p>

          <p className="text-gray-500">

            {promo.expires_at
              ? `Ends ${formatDateTime(
                  promo.expires_at
                )}`
              : "No expiry"}

          </p>

        </div>

      </td>

      {/* STATUS */}

      <td className="px-4 py-4">

        <span
          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${status.className}`}
        >
          {status.label}
        </span>

      </td>

      {/* ACTION */}

      <td className="px-6 py-4 text-right">

        <button
          type="button"
          disabled={toggling}
          onClick={onToggle}
          className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition disabled:opacity-50 ${
            promo.is_active
              ? "bg-red-50 text-red-600 hover:bg-red-100"
              : "bg-green-50 text-green-600 hover:bg-green-100"
          }`}
        >

          {toggling ? (
            <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : promo.is_active ? (
            <MdToggleOff className="text-lg" />
          ) : (
            <MdToggleOn className="text-lg" />
          )}

          {promo.is_active
            ? "Deactivate"
            : "Activate"}

        </button>

      </td>

    </tr>
  );
}

/* =========================================================
   MOBILE PROMO CARD
========================================================= */

function PromoMobileCard({
  promo,
  toggling,
  onToggle,
  onCopy,
}) {
  const status = getPromoStatus(promo);

  return (
    <div className="border border-gray-100 rounded-2xl p-4">

      {/* TOP */}

      <div className="flex justify-between gap-3">

        <div>

          <div className="flex items-center gap-2">

            <FaTag className="text-orange-500" />

            <p className="text-lg font-black text-gray-800">
              {promo.code}
            </p>

            <button
              type="button"
              onClick={onCopy}
              className="text-gray-400"
            >
              <FaCopy />
            </button>

          </div>

          <p className="text-xl font-bold text-orange-500 mt-2">

            {promo.discount_type === "percentage"
              ? `${Number(
                  promo.discount_value
                )}% OFF`
              : `KES ${Number(
                  promo.discount_value
                ).toLocaleString()} OFF`}

          </p>

        </div>

        <span
          className={`h-fit px-2.5 py-1 rounded-full text-xs font-semibold ${status.className}`}
        >
          {status.label}
        </span>

      </div>

      {/* USAGE */}

      <div className="grid grid-cols-2 gap-3 mt-5">

        <div className="bg-gray-50 rounded-xl p-3">

          <p className="text-xs text-gray-400">
            Times Used
          </p>

          <p className="font-bold text-gray-800 mt-1">
            {promo.times_used || 0}
          </p>

        </div>

        <div className="bg-gray-50 rounded-xl p-3">

          <p className="text-xs text-gray-400">
            Usage Limit
          </p>

          <p className="font-bold text-gray-800 mt-1">
            {promo.usage_limit || "Unlimited"}
          </p>

        </div>

      </div>

      {/* DATES */}

      <div className="mt-4 text-xs text-gray-500 space-y-2">

        <p>
          <strong>Starts:</strong>{" "}
          {promo.starts_at
            ? formatDateTime(promo.starts_at)
            : "Immediately"}
        </p>

        <p>
          <strong>Expires:</strong>{" "}
          {promo.expires_at
            ? formatDateTime(promo.expires_at)
            : "No expiry"}
        </p>

      </div>

      {/* ACTION */}

      <button
        type="button"
        onClick={onToggle}
        disabled={toggling}
        className={`w-full mt-5 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 ${
          promo.is_active
            ? "bg-red-50 text-red-600"
            : "bg-green-50 text-green-600"
        }`}
      >

        {toggling ? (
          <>
            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />

            Updating...
          </>
        ) : promo.is_active ? (
          <>
            <MdToggleOff className="text-xl" />

            Deactivate Promo
          </>
        ) : (
          <>
            <MdToggleOn className="text-xl" />

            Activate Promo
          </>
        )}

      </button>

    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  title,
  value,
  icon,
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-sm text-gray-400">
            {title}
          </p>

          <p className="text-2xl font-bold text-gray-800 mt-1">
            {value}
          </p>

        </div>

        <div className="w-11 h-11 bg-orange-50 rounded-xl text-orange-500 flex items-center justify-center text-lg">
          {icon}
        </div>

      </div>

    </div>
  );
}

/* =========================================================
   FORM GROUP
========================================================= */

function FormGroup({
  label,
  required = false,
  children,
}) {
  return (
    <div>

      <label className="block text-sm font-semibold text-gray-700 mb-2">

        {label}

        {required && (
          <span className="text-red-500 ml-1">
            *
          </span>
        )}

      </label>

      {children}

    </div>
  );
}

/* =========================================================
   PROMO STATUS
========================================================= */

function getPromoStatus(promo) {
  if (!promo.is_active) {
    return {
      label: "Inactive",
      className:
        "bg-gray-100 text-gray-600",
    };
  }

  const now = new Date();

  if (
    promo.starts_at &&
    new Date(promo.starts_at) > now
  ) {
    return {
      label: "Scheduled",
      className:
        "bg-blue-100 text-blue-600",
    };
  }

  if (
    promo.expires_at &&
    new Date(promo.expires_at) < now
  ) {
    return {
      label: "Expired",
      className:
        "bg-red-100 text-red-600",
    };
  }

  if (
    promo.usage_limit !== null &&
    promo.usage_limit !== undefined &&
    Number(promo.times_used || 0) >=
      Number(promo.usage_limit)
  ) {
    return {
      label: "Limit Reached",
      className:
        "bg-yellow-100 text-yellow-700",
    };
  }

  if (promo.is_valid === false) {
    return {
      label: "Unavailable",
      className:
        "bg-yellow-100 text-yellow-700",
    };
  }

  return {
    label: "Active",
    className:
      "bg-green-100 text-green-700",
  };
}

/* =========================================================
   FORMAT DATE
========================================================= */

function formatDateTime(value) {
  if (!value) {
    return "-";
  }

  try {
    return new Date(value).toLocaleString(
      "en-KE",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  } catch {
    return value;
  }
}