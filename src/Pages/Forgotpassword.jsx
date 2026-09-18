// ForgotPasswordPage.jsx

import React, { useState } from "react";

import {
  NavLink,
} from "react-router-dom";

import {
  Mail,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  KeyRound,
  CheckCircle2,
  RefreshCw,
  CalendarDays,
  TicketCheck,
} from "lucide-react";

import { API_URL } from "../config/env";
import Swal from "sweetalert2";

import FloatingParticles from "../Components/Floating-particles";

// Change path if your logo is stored elsewhere
import logo from "../assets/logo.png";

export default function ForgotPassword() {
  /* =========================================================
     STATE
  ========================================================= */

  const [email, setEmail] =
    useState("");

  const [success, setSuccess] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  /* =========================================================
     SUBMIT
  ========================================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleanEmail = email
      .trim()
      .toLowerCase();

    if (!cleanEmail) {
      Swal.fire({
        icon: "warning",
        title: "Email Required",
        text:
          "Please enter the email address associated with your account.",
        confirmButtonColor:
          "#f97316",
      });

      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        `${API_URL}/request_reset/`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            email: cleanEmail,
          }),
        }
      );

      let data = {};

      try {
        data = await res.json();
      } catch {
        data = {};
      }

      /* =====================================================
         REQUEST FAILED
      ===================================================== */

      if (!res.ok) {
        await Swal.fire({
          icon: "error",

          title:
            "Failed to Send Reset Link",

          text:
            data.message ||
            data.error ||
            "We couldn't send the password reset link. Please check your email and try again.",

          confirmButtonColor:
            "#f97316",
        });

        return;
      }

      /* =====================================================
         SUCCESS
      ===================================================== */

      setSuccess(true);
    } catch (err) {
      console.error(
        "Password reset error:",
        err
      );

      Swal.fire({
        icon: "error",

        title:
          "Failed to Send Reset Link",

        text:
          "We couldn't connect to the server. Please check your internet connection and try again.",

        confirmButtonColor:
          "#f97316",
      });
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     SEND AGAIN
  ========================================================= */

  const handleSendAgain = () => {
    setSuccess(false);

    /*
      Keep the email so the user
      doesn't have to type it again.
    */
  };

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <div className="min-h-screen bg-gray-50 lg:grid lg:grid-cols-2">

      {/* =====================================================
          LEFT BRAND PANEL
      ===================================================== */}

      <div className="relative hidden lg:flex overflow-hidden bg-gradient-to-br from-orange-500 via-orange-600 to-gray-900">

        <FloatingParticles />

        {/* Decorative shapes */}

        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full border border-white/10" />

        <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full border border-white/10" />

        <div className="absolute -bottom-48 -right-32 w-[500px] h-[500px] rounded-full bg-white/5" />

        <div className="absolute bottom-20 right-20 w-40 h-40 rounded-full border border-white/10" />

        {/* Content */}

        <div className="relative z-10 flex flex-col justify-between w-full min-h-screen p-10 xl:p-14">

          {/* ===============================================
              LOGO
          =============================================== */}

          <NavLink
            to="/"
            className="flex items-center gap-3 w-fit"
          >

            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg overflow-hidden p-1.5">

              <img
                src={logo}
                alt="Karibu Event"
                className="w-full h-full object-contain"
              />

            </div>

            <div>

              <p className="text-white font-black text-xl leading-none">
                Karibu Event
              </p>

              <p className="text-orange-100 text-xs mt-1">
                Discover. Book.
                Experience.
              </p>

            </div>

          </NavLink>

          {/* ===============================================
              MAIN MESSAGE
          =============================================== */}

          <div className="max-w-xl">

            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 rounded-full px-4 py-2 text-orange-100 text-sm font-medium">

              <KeyRound size={16} />

              Account Recovery

            </div>

            <h1 className="text-4xl xl:text-5xl 2xl:text-6xl font-black text-white leading-[1.08] mt-6">

              Get back to your
              events in just a few
              steps.

            </h1>

            <p className="text-orange-100 text-lg leading-relaxed mt-6 max-w-lg">

              Enter the email connected
              to your Karibu Event
              account and we'll send you
              instructions to securely
              reset your password.

            </p>

            {/* =============================================
                FEATURES
            ============================================= */}

            <div className="grid grid-cols-2 gap-3 mt-8">

              <Feature
                icon={
                  <ShieldCheck
                    size={20}
                  />
                }
                title="Secure Recovery"
                description="Reset access to your account securely."
              />

              <Feature
                icon={
                  <TicketCheck
                    size={20}
                  />
                }
                title="Keep Your Access"
                description="Return to your events and tickets."
              />

            </div>

          </div>

          {/* ===============================================
              FOOTER
          =============================================== */}

          <p className="text-white/50 text-xs">
            ©{" "}
            {new Date().getFullYear()}{" "}
            Karibu Event. All rights
            reserved.
          </p>

        </div>

      </div>

      {/* =====================================================
          RIGHT PANEL
      ===================================================== */}

      <div className="relative min-h-screen flex flex-col">

        {/* ===================================================
            MOBILE HEADER
        =================================================== */}

        <div className="lg:hidden bg-gradient-to-r from-orange-500 to-gray-900 px-5 py-5">

          <div className="flex items-center justify-between">

            <NavLink
              to="/"
              className="flex items-center gap-2.5"
            >

              <div className="w-11 h-11 bg-white rounded-xl p-1 overflow-hidden shadow">

                <img
                  src={logo}
                  alt="Karibu Event"
                  className="w-full h-full object-contain"
                />

              </div>

              <div>

                <p className="font-black text-white">
                  Karibu Event
                </p>

                <p className="text-orange-100 text-[10px]">
                  Discover. Book.
                  Experience.
                </p>

              </div>

            </NavLink>

            <NavLink
              to="/"
              className="text-xs font-semibold text-white/80 hover:text-white"
            >
              Back Home
            </NavLink>

          </div>

        </div>

        {/* ===================================================
            DESKTOP TOP
        =================================================== */}

        <div className="hidden lg:flex justify-end px-8 xl:px-12 py-7">

          <p className="text-sm text-gray-500">

            Remember your password?{" "}

            <NavLink
              to="/login"
              className="font-bold text-orange-500 hover:text-orange-600"
            >
              Sign in
            </NavLink>

          </p>

        </div>

        {/* ===================================================
            CONTENT
        =================================================== */}

        <div className="flex-1 flex items-center justify-center px-5 sm:px-8 py-10">

          <div className="w-full max-w-md">

            {/* ===============================================
                MOBILE LOGO
            =============================================== */}

            <div className="lg:hidden flex justify-center mb-7">

              <div className="w-20 h-20 rounded-2xl bg-white shadow-md border border-gray-100 p-2 overflow-hidden">

                <img
                  src={logo}
                  alt="Karibu Event Logo"
                  className="w-full h-full object-contain"
                />

              </div>

            </div>

            {/* =================================================
                SUCCESS STATE
            ================================================= */}

            {success ? (

              <SuccessState
                email={email}
                onSendAgain={
                  handleSendAgain
                }
              />

            ) : (

              <>
                {/* =============================================
                    HEADING
                ============================================= */}

                <div>

                  <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500 mb-5">

                    <KeyRound
                      size={23}
                    />

                  </div>

                  <p className="text-sm font-bold text-orange-500 uppercase tracking-wider">
                    Password Recovery
                  </p>

                  <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mt-2">
                    Forgot your password?
                  </h2>

                  <p className="text-gray-500 mt-3 text-sm leading-relaxed">

                    No problem. Enter the
                    email address linked
                    to your Karibu Event
                    account and we'll send
                    you a password reset
                    link.

                  </p>

                </div>

                {/* =============================================
                    FORM
                ============================================= */}

                <form
                  onSubmit={
                    handleSubmit
                  }
                  className="mt-8 space-y-5"
                >

                  {/* ===========================================
                      EMAIL
                  =========================================== */}

                  <div>

                    <label
                      htmlFor="email"
                      className="block text-sm font-bold text-gray-700 mb-2"
                    >
                      Email Address
                    </label>

                    <div className="relative">

                      <Mail
                        size={19}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      />

                      <input
                        id="email"
                        type="email"
                        value={email}
                        disabled={
                          loading
                        }
                        onChange={(e) =>
                          setEmail(
                            e.target.value
                          )
                        }
                        placeholder="you@example.com"
                        autoComplete="email"
                        className="w-full h-12 pl-12 pr-4 border border-gray-200 rounded-xl bg-white text-gray-800 placeholder:text-gray-300 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 disabled:bg-gray-50 disabled:cursor-not-allowed"
                        required
                      />

                    </div>

                    <p className="text-xs text-gray-400 mt-2">
                      Enter the same email
                      address you used when
                      creating your
                      account.
                    </p>

                  </div>

                  {/* ===========================================
                      SUBMIT
                  =========================================== */}

                  <button
                    type="submit"
                    disabled={loading}
                    className="group w-full h-12 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold transition shadow-sm hover:shadow-md flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >

                    {loading ? (
                      <>
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />

                        Sending reset
                        link...
                      </>
                    ) : (
                      <>
                        Send Reset Link

                        <ArrowRight
                          size={18}
                          className="transition-transform group-hover:translate-x-1"
                        />
                      </>
                    )}

                  </button>

                </form>

                {/* =============================================
                    BACK TO LOGIN
                ============================================= */}

                <div className="flex items-center gap-4 my-7">

                  <div className="h-px bg-gray-200 flex-1" />

                  <span className="text-xs text-gray-400">
                    Remembered it?
                  </span>

                  <div className="h-px bg-gray-200 flex-1" />

                </div>

                <NavLink
                  to="/login"
                  className="w-full h-12 border border-gray-200 hover:border-orange-200 hover:bg-orange-50 text-gray-700 hover:text-orange-600 rounded-xl font-bold transition flex items-center justify-center gap-2"
                >

                  <ArrowLeft
                    size={17}
                  />

                  Back to Sign In

                </NavLink>

              </>

            )}

            {/* =================================================
                SECURITY
            ================================================= */}

            <div className="flex items-center justify-center gap-2 mt-8 text-xs text-gray-400">

              <ShieldCheck
                size={14}
              />

              Password recovery is
              securely protected.

            </div>

          </div>

        </div>

        {/* ===================================================
            MOBILE FOOTER
        =================================================== */}

        <div className="lg:hidden text-center px-5 pb-6">

          <p className="text-xs text-gray-400">
            ©{" "}
            {new Date().getFullYear()}{" "}
            Karibu Event
          </p>

        </div>

      </div>

    </div>
  );
}

/* =========================================================
   SUCCESS STATE
========================================================= */

function SuccessState({
  email,
  onSendAgain,
}) {
  return (
    <div>

      {/* Icon */}

      <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center text-green-600">

        <CheckCircle2
          size={32}
        />

      </div>

      {/* Heading */}

      <p className="text-sm font-bold text-green-600 uppercase tracking-wider mt-6">
        Check Your Email
      </p>

      <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mt-2">
        Reset link sent
      </h2>

      <p className="text-gray-500 text-sm leading-relaxed mt-4">

        We've sent password reset
        instructions to:

      </p>

      {/* Email */}

      <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl p-4 mt-4">

        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-orange-500 shadow-sm flex-shrink-0">

          <Mail size={18} />

        </div>

        <div className="min-w-0">

          <p className="text-xs text-gray-400">
            Reset email sent to
          </p>

          <p className="font-bold text-gray-700 text-sm truncate mt-0.5">
            {email}
          </p>

        </div>

      </div>

      {/* Notice */}

      <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 mt-5">

        <p className="text-sm font-bold text-gray-700">
          Didn't receive the email?
        </p>

        <p className="text-xs text-gray-500 leading-relaxed mt-1.5">

          Check your spam or junk
          folder. The email may take a
          few moments to arrive.

        </p>

      </div>

      {/* Login */}

      <NavLink
        to="/login"
        className="group w-full h-12 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold transition shadow-sm hover:shadow-md flex items-center justify-center gap-2 mt-6"
      >

        Back to Sign In

        <ArrowRight
          size={18}
          className="transition-transform group-hover:translate-x-1"
        />

      </NavLink>

      {/* Resend */}

      <button
        type="button"
        onClick={onSendAgain}
        className="w-full h-12 mt-3 border border-gray-200 hover:border-orange-200 hover:bg-orange-50 text-gray-600 hover:text-orange-600 rounded-xl font-semibold transition flex items-center justify-center gap-2"
      >

        <RefreshCw size={16} />

        Send Again

      </button>

    </div>
  );
}

/* =========================================================
   FEATURE
========================================================= */

function Feature({
  icon,
  title,
  description,
}) {
  return (
    <div className="bg-white/10 border border-white/10 backdrop-blur-sm rounded-2xl p-4">

      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white">
        {icon}
      </div>

      <p className="font-bold text-white text-sm mt-3">
        {title}
      </p>

      <p className="text-orange-100/80 text-xs mt-1 leading-relaxed">
        {description}
      </p>

    </div>
  );
}