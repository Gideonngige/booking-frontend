// LoginPage.jsx

import React, { useState } from "react";
import {
  useNavigate,
  NavLink,
} from "react-router-dom";

import {
  Eye,
  EyeOff,
  Mail,
  LockKeyhole,
  ArrowRight,
  CalendarDays,
  TicketCheck,
  ShieldCheck,
} from "lucide-react";

import { API_URL } from "../config/env";
import Swal from "sweetalert2";

import FloatingParticles from "../Components/Floating-particles";

// Change this path if your logo is stored elsewhere
import logo from "../assets/logo.png";

export default function Login() {
  const navigate = useNavigate();

  /* =========================================================
     STATE
  ========================================================= */

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  /* =========================================================
     LOGIN
  ========================================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Email Required",
        text: "Please enter your email address.",
        confirmButtonColor: "#f97316",
      });

      return;
    }

    if (!password) {
      Swal.fire({
        icon: "warning",
        title: "Password Required",
        text: "Please enter your password.",
        confirmButtonColor: "#f97316",
      });

      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        `${API_URL}/signin/`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            email: email
              .trim()
              .toLowerCase(),

            password,
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
         FAILED LOGIN
      ===================================================== */

      if (!res.ok) {
        await Swal.fire({
          icon: "error",
          title: "Login Failed",
          text:
            data.message ||
            data.error ||
            "Please check your credentials and try again.",
          confirmButtonColor:
            "#f97316",
        });

        return;
      }

      /* =====================================================
         VALIDATE RESPONSE
      ===================================================== */

      if (
        !data.access_token ||
        !data.refresh_token ||
        !data.user
      ) {
        throw new Error(
          "Invalid login response."
        );
      }

      /* =====================================================
         SAVE TOKENS
      ===================================================== */

      localStorage.setItem(
        "access_token",
        data.access_token
      );

      localStorage.setItem(
        "refresh_token",
        data.refresh_token
      );

      /* =====================================================
         SAVE USER
      ===================================================== */

      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      /* =====================================================
         REDIRECT BY ROLE
      ===================================================== */

      if (
        data.user.role === "admin"
      ) {
        navigate(
          "/admin-dashboard",
          {
            replace: true,
          }
        );

        return;
      }

      if (
        data.user.role ===
        "organizer"
      ) {
        navigate(
          "/creator-dashboard",
          {
            replace: true,
          }
        );

        return;
      }

      navigate("/", {
        replace: true,
      });
    } catch (err) {
      console.error(
        "Login error:",
        err
      );

      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text:
          "We couldn't sign you in. Please check your connection and try again.",
        confirmButtonColor:
          "#f97316",
      });
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <div className="min-h-screen bg-gray-50 lg:grid lg:grid-cols-2">

      {/* =====================================================
          LEFT / BRAND SIDE
      ===================================================== */}

      <div className="relative hidden lg:flex overflow-hidden bg-gradient-to-br from-orange-500 via-orange-600 to-gray-900">

        <FloatingParticles />

        {/* Decorative circles */}

        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full border border-white/10" />

        <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full border border-white/10" />

        <div className="absolute -bottom-48 -right-32 w-[500px] h-[500px] rounded-full bg-white/5" />

        <div className="absolute bottom-20 right-20 w-40 h-40 rounded-full border border-white/10" />

        {/* Content */}

        <div className="relative z-10 flex flex-col justify-between w-full min-h-screen p-10 xl:p-14">

          {/* Logo */}

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
                Discover. Book. Experience.
              </p>

            </div>

          </NavLink>

          {/* Main Message */}

          <div className="max-w-xl">

            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 rounded-full px-4 py-2 text-orange-100 text-sm font-medium">

              <CalendarDays size={16} />

              Events made simple

            </div>

            <h1 className="text-4xl xl:text-5xl 2xl:text-6xl font-black text-white leading-[1.08] mt-6">

              Your next great
              experience starts
              here.

            </h1>

            <p className="text-orange-100 text-lg leading-relaxed mt-6 max-w-lg">

              Discover events, book
              tickets securely, manage
              your events and connect
              with memorable
              experiences across Kenya.

            </p>

            {/* Features */}

            <div className="grid grid-cols-2 gap-3 mt-8">

              <Feature
                icon={
                  <TicketCheck
                    size={20}
                  />
                }
                title="Easy Ticketing"
                description="Book and manage tickets easily."
              />

              <Feature
                icon={
                  <ShieldCheck
                    size={20}
                  />
                }
                title="Secure Access"
                description="QR-powered event entry."
              />

            </div>

          </div>

          {/* Footer */}

          <p className="text-white/50 text-xs">
            ©{" "}
            {new Date().getFullYear()}{" "}
            Karibu Event. All rights
            reserved.
          </p>

        </div>

      </div>

      {/* =====================================================
          RIGHT / LOGIN SIDE
      ===================================================== */}

      <div className="relative min-h-screen flex flex-col">

        {/* ===================================================
            MOBILE TOP
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

            Don't have an account?{" "}

            <NavLink
              to="/register"
              className="font-bold text-orange-500 hover:text-orange-600"
            >
              Create account
            </NavLink>

          </p>

        </div>

        {/* ===================================================
            FORM WRAPPER
        =================================================== */}

        <div className="flex-1 flex items-center justify-center px-5 sm:px-8 py-10">

          <div className="w-full max-w-md">

            {/* Mobile Logo */}

            <div className="lg:hidden flex justify-center mb-7">

              <div className="w-20 h-20 rounded-2xl bg-white shadow-md border border-gray-100 p-2 overflow-hidden">

                <img
                  src={logo}
                  alt="Karibu Event Logo"
                  className="w-full h-full object-contain"
                />

              </div>

            </div>

            {/* Heading */}

            <div>

              <p className="text-sm font-bold text-orange-500 uppercase tracking-wider">
                Welcome Back
              </p>

              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mt-2">
                Sign in to your account
              </h2>

              <p className="text-gray-500 mt-3 text-sm leading-relaxed">
                Enter your details to
                continue to Karibu Event.
              </p>

            </div>

            {/* =================================================
                FORM
            ================================================= */}

            <form
              onSubmit={
                handleSubmit
              }
              className="mt-8 space-y-5"
            >

              {/* ===============================================
                  EMAIL
              =============================================== */}

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
                    disabled={loading}
                    onChange={(e) =>
                      setEmail(
                        e.target.value
                      )
                    }
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="w-full h-12 pl-12 pr-4 border border-gray-200 rounded-xl bg-white text-gray-800 placeholder:text-gray-300 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 disabled:bg-gray-50"
                    required
                  />

                </div>

              </div>

              {/* ===============================================
                  PASSWORD
              =============================================== */}

              <div>

                <div className="flex items-center justify-between mb-2">

                  <label
                    htmlFor="password"
                    className="text-sm font-bold text-gray-700"
                  >
                    Password
                  </label>

                  <NavLink
                    to="/forgot-password"
                    className="text-xs sm:text-sm text-orange-500 font-bold hover:text-orange-600"
                  >
                    Forgot password?
                  </NavLink>

                </div>

                <div className="relative">

                  <LockKeyhole
                    size={19}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    id="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    disabled={loading}
                    onChange={(e) =>
                      setPassword(
                        e.target.value
                      )
                    }
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="w-full h-12 pl-12 pr-12 border border-gray-200 rounded-xl bg-white text-gray-800 placeholder:text-gray-300 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 disabled:bg-gray-50"
                    required
                  />

                  <button
                    type="button"
                    disabled={loading}
                    onClick={() =>
                      setShowPassword(
                        (previous) =>
                          !previous
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500 transition disabled:opacity-50"
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >

                    {showPassword ? (
                      <EyeOff
                        size={20}
                      />
                    ) : (
                      <Eye
                        size={20}
                      />
                    )}

                  </button>

                </div>

              </div>

              {/* ===============================================
                  LOGIN BUTTON
              =============================================== */}

              <button
                type="submit"
                disabled={loading}
                className="group w-full h-12 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold transition shadow-sm hover:shadow-md flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >

                {loading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />

                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In

                    <ArrowRight
                      size={18}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </>
                )}

              </button>

            </form>

            {/* =================================================
                DIVIDER
            ================================================= */}

            <div className="flex items-center gap-4 my-7">

              <div className="h-px bg-gray-200 flex-1" />

              <span className="text-xs text-gray-400">
                New to Karibu Event?
              </span>

              <div className="h-px bg-gray-200 flex-1" />

            </div>

            {/* =================================================
                REGISTER
            ================================================= */}

            <NavLink
              to="/register"
              className="w-full h-12 border border-gray-200 hover:border-orange-200 hover:bg-orange-50 text-gray-700 hover:text-orange-600 rounded-xl font-bold transition flex items-center justify-center"
            >
              Create an Account
            </NavLink>

            {/* =================================================
                SECURITY MESSAGE
            ================================================= */}

            <div className="flex items-center justify-center gap-2 mt-7 text-xs text-gray-400">

              <ShieldCheck
                size={14}
              />

              Your account information
              is securely protected.

            </div>

          </div>

        </div>

        {/* Mobile Footer */}

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