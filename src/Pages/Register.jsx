// RegisterPage.jsx

import React, { useMemo, useState } from "react";

import {
  useNavigate,
  NavLink,
} from "react-router-dom";

import {
  Eye,
  EyeOff,
  Mail,
  LockKeyhole,
  User,
  Phone,
  ArrowRight,
  CalendarDays,
  TicketCheck,
  ShieldCheck,
  Users,
  CalendarPlus,
  Check,
  CircleAlert,
} from "lucide-react";

import { API_URL } from "../config/env";
import Swal from "sweetalert2";

import FloatingParticles from "../Components/Floating-particles";

// Change this path if your logo is stored elsewhere
import logo from "../assets/logo.png";

export default function Register() {
  const navigate = useNavigate();

  /* =========================================================
     STATE
  ========================================================= */

  const [formData, setFormData] =
    useState({
      full_name: "",
      email: "",
      phone_number: "",
      role: "user",
      password: "",
      confirmPassword: "",
    });

  const [loading, setLoading] =
    useState(false);

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  /* =========================================================
     HANDLE INPUT
  ========================================================= */

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* =========================================================
     PASSWORD CHECKS
  ========================================================= */

  const passwordChecks = useMemo(
    () => ({
      length:
        formData.password.length >= 8,

      hasLetter:
        /[A-Za-z]/.test(
          formData.password
        ),

      hasNumber:
        /\d/.test(
          formData.password
        ),

      matches:
        formData.confirmPassword
          .length > 0 &&
        formData.password ===
          formData.confirmPassword,
    }),
    [
      formData.password,
      formData.confirmPassword,
    ]
  );

  /* =========================================================
     PASSWORD STRENGTH
  ========================================================= */

  const passwordStrength =
    useMemo(() => {
      if (!formData.password) {
        return 0;
      }

      let score = 0;

      if (
        formData.password.length >= 8
      ) {
        score++;
      }

      if (
        /[a-z]/.test(
          formData.password
        ) &&
        /[A-Z]/.test(
          formData.password
        )
      ) {
        score++;
      }

      if (
        /\d/.test(
          formData.password
        )
      ) {
        score++;
      }

      if (
        /[^A-Za-z0-9]/.test(
          formData.password
        )
      ) {
        score++;
      }

      return score;
    }, [formData.password]);

  /* =========================================================
     VALIDATION
  ========================================================= */

  const validateForm = () => {
    if (!formData.full_name.trim()) {
      showWarning(
        "Full Name Required",
        "Please enter your full name."
      );

      return false;
    }

    if (!formData.email.trim()) {
      showWarning(
        "Email Required",
        "Please enter your email address."
      );

      return false;
    }

    if (
      !formData.phone_number.trim()
    ) {
      showWarning(
        "Phone Number Required",
        "Please enter your phone number."
      );

      return false;
    }

    /*
      Valid:
      0712345678
      0112345678
      +254712345678
      +254112345678
    */

    if (
      !/^(\+254|0)[17]\d{8}$/.test(
        formData.phone_number.trim()
      )
    ) {
      showWarning(
        "Invalid Phone Number",
        "Enter a valid Kenyan phone number, for example 0712345678 or +254712345678."
      );

      return false;
    }

    if (
      formData.password.length < 8
    ) {
      showWarning(
        "Password Too Short",
        "Your password must contain at least 8 characters."
      );

      return false;
    }

    if (
      formData.password !==
      formData.confirmPassword
    ) {
      showWarning(
        "Passwords Do Not Match",
        "Please make sure both passwords are the same."
      );

      return false;
    }

    return true;
  };

  /* =========================================================
     REGISTER
  ========================================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      /* =====================================================
         CREATE ACCOUNT
      ===================================================== */

      const signupRes = await fetch(
        `${API_URL}/signup/`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            full_name:
              formData.full_name.trim(),

            email:
              formData.email
                .trim()
                .toLowerCase(),

            phone_number:
              formData.phone_number.trim(),

            password:
              formData.password,

            role:
              formData.role,
          }),
        }
      );

      let signupData = {};

      try {
        signupData =
          await signupRes.json();
      } catch {
        signupData = {};
      }

      if (!signupRes.ok) {
        await Swal.fire({
          icon: "error",

          title:
            "Registration Failed",

          text:
            signupData.message ||
            signupData.error ||
            "We couldn't create your account. Please try again.",

          confirmButtonColor:
            "#f97316",
        });

        return;
      }

      /* =====================================================
         AUTOMATIC LOGIN
      ===================================================== */

      const loginRes = await fetch(
        `${API_URL}/signin/`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            email:
              formData.email
                .trim()
                .toLowerCase(),

            password:
              formData.password,
          }),
        }
      );

      let loginData = {};

      try {
        loginData =
          await loginRes.json();
      } catch {
        loginData = {};
      }

      /* =====================================================
         AUTO LOGIN FAILED
      ===================================================== */

      if (!loginRes.ok) {
        await Swal.fire({
          icon: "success",

          title:
            "Account Created",

          text:
            "Your account was created successfully. Please sign in to continue.",

          confirmButtonText:
            "Go to Login",

          confirmButtonColor:
            "#f97316",
        });

        navigate(
          "/login",
          {
            replace: true,
          }
        );

        return;
      }

      /* =====================================================
         VALIDATE LOGIN RESPONSE
      ===================================================== */

      if (
        !loginData.access_token ||
        !loginData.user
      ) {
        await Swal.fire({
          icon: "success",

          title:
            "Account Created",

          text:
            "Your account was created successfully. Please sign in to continue.",

          confirmButtonColor:
            "#f97316",
        });

        navigate(
          "/login",
          {
            replace: true,
          }
        );

        return;
      }

      /* =====================================================
         SAVE AUTHENTICATION
      ===================================================== */

      localStorage.setItem(
        "access_token",
        loginData.access_token
      );

      if (
        loginData.refresh_token
      ) {
        localStorage.setItem(
          "refresh_token",
          loginData.refresh_token
        );
      }

      localStorage.setItem(
        "user",
        JSON.stringify(
          loginData.user
        )
      );

      /* =====================================================
         SUCCESS
      ===================================================== */

      await Swal.fire({
        icon: "success",

        title:
          "Welcome to Karibu Event!",

        text:
          formData.role ===
          "organizer"
            ? "Your organizer account has been created successfully. You can now start creating events."
            : "Your account has been created successfully. Start discovering amazing events.",

        timer: 1800,

        showConfirmButton: false,
      });

      /* =====================================================
         REDIRECT
      ===================================================== */

      if (
        loginData.user.role ===
        "admin"
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
        loginData.user.role ===
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
        "Registration error:",
        err
      );

      Swal.fire({
        icon: "error",

        title:
          "Registration Failed",

        text:
          "We couldn't create your account. Please check your connection and try again.",

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
          LEFT BRAND PANEL
      ===================================================== */}

      <div className="relative hidden lg:flex overflow-hidden bg-gradient-to-br from-orange-500 via-orange-600 to-gray-900">

        <FloatingParticles />

        {/* Decorative shapes */}

        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full border border-white/10" />

        <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full border border-white/10" />

        <div className="absolute -bottom-48 -right-32 w-[500px] h-[500px] rounded-full bg-white/5" />

        <div className="absolute bottom-20 right-20 w-40 h-40 rounded-full border border-white/10" />

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
              CONTENT
          =============================================== */}

          <div className="max-w-xl">

            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 rounded-full px-4 py-2 text-orange-100 text-sm font-medium">

              <CalendarDays
                size={16}
              />

              Join the experience

            </div>

            <h1 className="text-4xl xl:text-5xl 2xl:text-6xl font-black text-white leading-[1.08] mt-6">

              Events are better
              when everyone is
              connected.

            </h1>

            <p className="text-orange-100 text-lg leading-relaxed mt-6 max-w-lg">

              Create your Karibu Event
              account to discover
              experiences, book tickets
              or organize and manage
              your own events.

            </p>

            {/* =============================================
                FEATURES
            ============================================= */}

            <div className="grid grid-cols-2 gap-3 mt-8">

              <Feature
                icon={
                  <TicketCheck
                    size={20}
                  />
                }
                title="Discover & Book"
                description="Find events and book your tickets easily."
              />

              <Feature
                icon={
                  <CalendarPlus
                    size={20}
                  />
                }
                title="Create Events"
                description="Organizers can sell and manage tickets."
              />

            </div>

          </div>

          <p className="text-white/50 text-xs">
            ©{" "}
            {new Date().getFullYear()}{" "}
            Karibu Event. All rights
            reserved.
          </p>

        </div>

      </div>

      {/* =====================================================
          RIGHT SIDE
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

            Already have an
            account?{" "}

            <NavLink
              to="/login"
              className="font-bold text-orange-500 hover:text-orange-600"
            >
              Sign in
            </NavLink>

          </p>

        </div>

        {/* ===================================================
            FORM
        =================================================== */}

        <div className="flex-1 flex items-center justify-center px-5 sm:px-8 py-10">

          <div className="w-full max-w-lg">

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

            {/* ===============================================
                HEADING
            =============================================== */}

            <div>

              <p className="text-sm font-bold text-orange-500 uppercase tracking-wider">
                Get Started
              </p>

              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mt-2">
                Create your account
              </h2>

              <p className="text-gray-500 mt-3 text-sm leading-relaxed">
                Join Karibu Event as an
                attendee or event
                organizer.
              </p>

            </div>

            {/* ===============================================
                FORM
            =============================================== */}

            <form
              onSubmit={
                handleSubmit
              }
              className="mt-8 space-y-5"
            >

              {/* =============================================
                  FULL NAME
              ============================================= */}

              <FormGroup
                label="Full Name"
                htmlFor="full_name"
              >

                <InputWrapper
                  icon={
                    <User size={19} />
                  }
                >

                  <input
                    id="full_name"
                    type="text"
                    name="full_name"
                    value={
                      formData.full_name
                    }
                    disabled={
                      loading
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Enter your full name"
                    autoComplete="name"
                    className={
                      inputClass
                    }
                    required
                  />

                </InputWrapper>

              </FormGroup>

              {/* =============================================
                  EMAIL + PHONE
              ============================================= */}

              <div className="grid sm:grid-cols-2 gap-5">

                <FormGroup
                  label="Email Address"
                  htmlFor="email"
                >

                  <InputWrapper
                    icon={
                      <Mail
                        size={19}
                      />
                    }
                  >

                    <input
                      id="email"
                      type="email"
                      name="email"
                      value={
                        formData.email
                      }
                      disabled={
                        loading
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="you@example.com"
                      autoComplete="email"
                      className={
                        inputClass
                      }
                      required
                    />

                  </InputWrapper>

                </FormGroup>

                <FormGroup
                  label="Phone Number"
                  htmlFor="phone_number"
                >

                  <InputWrapper
                    icon={
                      <Phone
                        size={19}
                      />
                    }
                  >

                    <input
                      id="phone_number"
                      type="tel"
                      name="phone_number"
                      value={
                        formData.phone_number
                      }
                      disabled={
                        loading
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="0712345678"
                      autoComplete="tel"
                      className={
                        inputClass
                      }
                      required
                    />

                  </InputWrapper>

                </FormGroup>

              </div>

              {/* =============================================
                  ACCOUNT TYPE
              ============================================= */}

              <div>

                <label className="block text-sm font-bold text-gray-700 mb-2">
                  I want to join as
                </label>

                <div className="grid grid-cols-2 gap-3">

                  {/* USER */}

                  <RoleCard
                    selected={
                      formData.role ===
                      "user"
                    }
                    onClick={() =>
                      setFormData(
                        (
                          previous
                        ) => ({
                          ...previous,
                          role: "user",
                        })
                      )
                    }
                    icon={
                      <Users
                        size={21}
                      />
                    }
                    title="Attendee"
                    description="Discover and book events"
                  />

                  {/* ORGANIZER */}

                  <RoleCard
                    selected={
                      formData.role ===
                      "organizer"
                    }
                    onClick={() =>
                      setFormData(
                        (
                          previous
                        ) => ({
                          ...previous,
                          role: "organizer",
                        })
                      )
                    }
                    icon={
                      <CalendarPlus
                        size={21}
                      />
                    }
                    title="Organizer"
                    description="Create and manage events"
                  />

                </div>

              </div>

              {/* =============================================
                  ORGANIZER PHONE NOTICE
              ============================================= */}

              {formData.role ===
                "organizer" && (

                <div className="flex gap-3 bg-orange-50 border border-orange-100 rounded-xl p-4">

                  <CircleAlert
                    size={19}
                    className="text-orange-500 flex-shrink-0 mt-0.5"
                  />

                  <div>

                    <p className="text-sm font-bold text-gray-700">
                      Organizer phone
                      number
                    </p>

                    <p className="text-xs text-gray-500 leading-relaxed mt-1">
                      Please make sure
                      your phone number is
                      correct. It may be
                      used for event
                      payment and payout
                      related
                      communication.
                    </p>

                  </div>

                </div>

              )}

              {/* =============================================
                  PASSWORD
              ============================================= */}

              <FormGroup
                label="Password"
                htmlFor="password"
              >

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
                    name="password"
                    value={
                      formData.password
                    }
                    disabled={
                      loading
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Create a password"
                    autoComplete="new-password"
                    className={`${inputClass} pr-12`}
                    required
                  />

                  <button
                    type="button"
                    disabled={
                      loading
                    }
                    onClick={() =>
                      setShowPassword(
                        (
                          previous
                        ) =>
                          !previous
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500 transition"
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

                {/* ===========================================
                    STRENGTH BAR
                =========================================== */}

                {formData.password && (

                  <div className="mt-3">

                    <div className="grid grid-cols-4 gap-1.5">

                      {[1, 2, 3, 4].map(
                        (level) => (
                          <div
                            key={
                              level
                            }
                            className={`h-1.5 rounded-full ${
                              passwordStrength >=
                              level
                                ? passwordStrength <=
                                  1
                                  ? "bg-red-400"
                                  : passwordStrength ===
                                      2
                                    ? "bg-yellow-400"
                                    : "bg-green-500"
                                : "bg-gray-100"
                            }`}
                          />
                        )
                      )}

                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3">

                      <PasswordRule
                        valid={
                          passwordChecks.length
                        }
                        text="8+ characters"
                      />

                      <PasswordRule
                        valid={
                          passwordChecks.hasLetter
                        }
                        text="Letter"
                      />

                      <PasswordRule
                        valid={
                          passwordChecks.hasNumber
                        }
                        text="Number"
                      />

                    </div>

                  </div>

                )}

              </FormGroup>

              {/* =============================================
                  CONFIRM PASSWORD
              ============================================= */}

              <FormGroup
                label="Confirm Password"
                htmlFor="confirmPassword"
              >

                <div className="relative">

                  <LockKeyhole
                    size={19}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    id="confirmPassword"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    name="confirmPassword"
                    value={
                      formData.confirmPassword
                    }
                    disabled={
                      loading
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Enter your password again"
                    autoComplete="new-password"
                    className={`${inputClass} pr-12 ${
                      formData.confirmPassword &&
                      !passwordChecks.matches
                        ? "border-red-300 focus:border-red-400 focus:ring-red-400/10"
                        : ""
                    }`}
                    required
                  />

                  <button
                    type="button"
                    disabled={
                      loading
                    }
                    onClick={() =>
                      setShowConfirmPassword(
                        (
                          previous
                        ) =>
                          !previous
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500 transition"
                    aria-label={
                      showConfirmPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >

                    {showConfirmPassword ? (
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

                {formData.confirmPassword && (

                  <div className="mt-2">

                    {passwordChecks.matches ? (

                      <p className="text-xs text-green-600 flex items-center gap-1.5">
                        <Check
                          size={13}
                        />
                        Passwords match
                      </p>

                    ) : (

                      <p className="text-xs text-red-500">
                        Passwords do not
                        match.
                      </p>

                    )}

                  </div>

                )}

              </FormGroup>

              {/* =============================================
                  REGISTER BUTTON
              ============================================= */}

              <button
                type="submit"
                disabled={loading}
                className="group w-full h-12 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold transition shadow-sm hover:shadow-md flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >

                {loading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />

                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account

                    <ArrowRight
                      size={18}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </>
                )}

              </button>

            </form>

            {/* ===============================================
                LOGIN DIVIDER
            =============================================== */}

            <div className="flex items-center gap-4 my-7">

              <div className="h-px bg-gray-200 flex-1" />

              <span className="text-xs text-gray-400">
                Already registered?
              </span>

              <div className="h-px bg-gray-200 flex-1" />

            </div>

            {/* ===============================================
                LOGIN
            =============================================== */}

            <NavLink
              to="/login"
              className="w-full h-12 border border-gray-200 hover:border-orange-200 hover:bg-orange-50 text-gray-700 hover:text-orange-600 rounded-xl font-bold transition flex items-center justify-center"
            >
              Sign In Instead
            </NavLink>

            {/* ===============================================
                SECURITY
            =============================================== */}

            <div className="flex items-center justify-center gap-2 mt-7 text-xs text-gray-400">

              <ShieldCheck
                size={14}
              />

              Your account information
              is securely protected.

            </div>

          </div>

        </div>

        {/* MOBILE FOOTER */}

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
   INPUT STYLE
========================================================= */

const inputClass =
  "w-full h-12 pl-12 pr-4 border border-gray-200 rounded-xl bg-white text-gray-800 placeholder:text-gray-300 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 disabled:bg-gray-50 disabled:cursor-not-allowed";

/* =========================================================
   FORM GROUP
========================================================= */

function FormGroup({
  label,
  htmlFor,
  children,
}) {
  return (
    <div>

      <label
        htmlFor={htmlFor}
        className="block text-sm font-bold text-gray-700 mb-2"
      >
        {label}
      </label>

      {children}

    </div>
  );
}

/* =========================================================
   INPUT WRAPPER
========================================================= */

function InputWrapper({
  icon,
  children,
}) {
  return (
    <div className="relative">

      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
        {icon}
      </span>

      {children}

    </div>
  );
}

/* =========================================================
   ROLE CARD
========================================================= */

function RoleCard({
  selected,
  onClick,
  icon,
  title,
  description,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative text-left border-2 rounded-xl p-4 transition ${
        selected
          ? "border-orange-500 bg-orange-50"
          : "border-gray-100 bg-white hover:border-orange-200"
      }`}
    >

      {selected && (

        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center">
          <Check size={12} />
        </div>

      )}

      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
          selected
            ? "bg-orange-500 text-white"
            : "bg-gray-50 text-gray-500"
        }`}
      >
        {icon}
      </div>

      <p
        className={`font-bold text-sm mt-3 ${
          selected
            ? "text-orange-600"
            : "text-gray-700"
        }`}
      >
        {title}
      </p>

      <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
        {description}
      </p>

    </button>
  );
}

/* =========================================================
   PASSWORD RULE
========================================================= */

function PasswordRule({
  valid,
  text,
}) {
  return (
    <span
      className={`text-[11px] flex items-center gap-1 ${
        valid
          ? "text-green-600"
          : "text-gray-400"
      }`}
    >

      <span
        className={`w-4 h-4 rounded-full flex items-center justify-center ${
          valid
            ? "bg-green-100"
            : "bg-gray-100"
        }`}
      >
        <Check size={10} />
      </span>

      {text}

    </span>
  );
}

/* =========================================================
   LEFT PANEL FEATURE
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

/* =========================================================
   ALERT HELPER
========================================================= */

function showWarning(
  title,
  text
) {
  Swal.fire({
    icon: "warning",
    title,
    text,
    confirmButtonColor: "#f97316",
  });
}