// RegisterPage.jsx
import React, { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { API_URL } from "../config/env";
import Swal from "sweetalert2";
import { Eye, EyeOff } from "lucide-react";
import FloatingParticles from "../Components/Floating-particles";

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    role: "user",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };


  // submit
 const handleSubmit = async (e) => {
  e.preventDefault();

  setError(null);
  setSuccess(null);

  // Validate passwords
  if (formData.password !== formData.confirmPassword) {
    Swal.fire({
      icon: "error",
      title: "Registration Failed",
      text: "Passwords do not match.",
    });
    return;
  }

  // Validate password length
  if (formData.password.length < 8) {
    Swal.fire({
      icon: "error",
      title: "Registration Failed",
      text: "Password must be at least 8 characters.",
    });
    return;
  }

  // Validate Kenyan phone number
  if (!formData.phone_number.match(/^(\+254|0)[17]\d{8}$/)) {
    Swal.fire({
      icon: "error",
      title: "Registration Failed",
      text: "Enter a valid Kenyan phone number.",
    });
    return;
  }

  setLoading(true);

  try {
    // =========================
    // REGISTER USER
    // =========================

    const signupRes = await fetch(`${API_URL}/signup/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        full_name: formData.full_name,
        email: formData.email,
        phone_number: formData.phone_number,
        password: formData.password,
        role: formData.role,
      }),
    });

    const signupData = await signupRes.json();

    if (!signupRes.ok) {
      Swal.fire({
        icon: "error",
        title: "Registration Failed",
        text:
          signupData.message ||
          signupData.error ||
          "Registration failed.",
      });

      return;
    }

    setSuccess(signupData.message);

    // =========================
    // AUTO LOGIN
    // =========================

    const loginRes = await fetch(`${API_URL}/signin/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: formData.email,
        password: formData.password,
      }),
    });

    const loginData = await loginRes.json();

    if (!loginRes.ok) {
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text:
          loginData.message ||
          loginData.error ||
          "Account created, but automatic login failed.",
      });

      return;
    }

    // Validate expected login response
    if (!loginData.access_token || !loginData.user) {
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: "Invalid response received from the server.",
      });

      return;
    }

    // Save tokens
    localStorage.setItem("access_token", loginData.access_token);

    if (loginData.refresh_token) {
      localStorage.setItem(
        "refresh_token",
        loginData.refresh_token
      );
    }

    // Save user
    localStorage.setItem(
      "user",
      JSON.stringify(loginData.user)
    );

    // Show success
    await Swal.fire({
      icon: "success",
      title: "Registration Successful",
      text: "Your account has been created successfully.",
      timer: 1500,
      showConfirmButton: false,
    });

    // Redirect based on role
    if (loginData.user.role === "admin") {
      navigate("/admin-dashboard");
    } else if (loginData.user.role === "organizer") {
      navigate("/creator-dashboard");
    } else {
      navigate("/");
    }
  } catch (err) {
    console.error("Registration error:", err);

    Swal.fire({
      icon: "error",
      title: "Registration Failed",
      text: "An unexpected error occurred. Please try again.",
    });
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-500 to-gray-900 py-10 px-4">
      {/* Floating particles */}
      <FloatingParticles />

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-orange-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            KE
          </div>
        </div>

        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Create Your Account
        </h2>

        {/* Error */}
        {error && (
          <div className="bg-red-100 text-red-600 text-sm px-4 py-2 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="bg-green-100 text-green-600 text-sm px-4 py-2 rounded-lg mb-4">
            {success}
          </div>
        )}

        <form
          className="space-y-4"
          onSubmit={handleSubmit}
        >

          {/* Full Name */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Full Name
            </label>

            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="Enter your full name"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Email
            </label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Phone Number
            </label>

            <input
              type="tel"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              placeholder="+254712345678"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Select Role
            </label>

            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="user">
                User
              </option>

              <option value="organizer">
                Organizer
              </option>
            </select>
          </div>

          {/* Password */}
          {/* Password */}
<div>
  <label className="block text-gray-700 font-semibold mb-2">
    Password
  </label>

  <div className="relative">
    <input
      type={showPassword ? "text" : "password"}
      name="password"
      value={formData.password}
      onChange={handleChange}
      placeholder="Enter your password"
      className="w-full px-4 py-2 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
      required
    />

    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-orange-500 transition-colors"
      aria-label={showPassword ? "Hide password" : "Show password"}
    >
      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
    </button>
  </div>
</div>

          {/* Confirm Password */}
          {/* Confirm Password */}
<div>
  <label className="block text-gray-700 font-semibold mb-2">
    Confirm Password
  </label>

  <div className="relative">
    <input
      type={showConfirmPassword ? "text" : "password"}
      name="confirmPassword"
      value={formData.confirmPassword}
      onChange={handleChange}
      placeholder="Confirm your password"
      className="w-full px-4 py-2 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
      required
    />

    <button
      type="button"
      onClick={() =>
        setShowConfirmPassword(!showConfirmPassword)
      }
      className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-orange-500 transition-colors"
      aria-label={
        showConfirmPassword
          ? "Hide password"
          : "Show password"
      }
    >
      {showConfirmPassword ? (
        <EyeOff size={20} />
      ) : (
        <Eye size={20} />
      )}
    </button>
  </div>
</div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 rounded-lg transition duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading
              ? "Creating account..."
              : "Register"}
          </button>

        </form>

        {/* Login */}
        <p className="text-center text-gray-500 text-sm mt-4">
          Already have an account?{" "}

          <NavLink
            to="/login"
            className="text-orange-500 font-semibold hover:underline"
          >
            Login
          </NavLink>
        </p>

        {/* create a note for user to make sure the phone number is correct */}
        <p className="text-center text-orange-500 text-sm mt-2">
          Please ensure your phone number is correct. If you are event organizer, it will be used to send event's money.
        </p>

      </div>
    </div>
  );
}