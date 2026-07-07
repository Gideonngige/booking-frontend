// LoginPage.jsx
import React, { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { API_URL } from "../config/env";
import Swal from "sweetalert2";
import { Eye, EyeOff } from "lucide-react";

import FloatingParticles from "../Components/Floating-particles";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `${API_URL}/signin/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        // throw new Error(data.message || "Login failed");
        // use Swal to show error
        Swal.fire({
          icon: "error",
          title: "Login Failed",
          text: data.message || "Please check your credentials and try again.",
        });
      }

      // Save tokens
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);

      // Save user
      localStorage.setItem("user", JSON.stringify(data.user));

      // Redirect based on role
      if (data.user.role === "admin") {
        navigate("/admin-dashboard");
      } else if (data.user.role === "organizer") {
        navigate("/creator-dashboard");
      } else {
        navigate("/");
      }

    } catch (err) {
      // setError(err.message);
      // use Swal to show error
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: "An unexpected error occurred. Please check your credentials and try again.",
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
          Welcome to Karibu Event
        </h2>

        {/* Error */}
        {error && (
          <div className="bg-red-100 text-red-600 text-sm px-4 py-2 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>

          {/* Email */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          {/* Password */}
<div>
  <label className="block text-gray-700 font-semibold mb-2">
    Password
  </label>

  <div className="relative">
    <input
      type={showPassword ? "text" : "password"}
      value={password}
      onChange={(e) => setPassword(e.target.value)}
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

  <p className="text-right text-sm mt-1">
    <NavLink
      to="/forgot-password"
      className="text-orange-500 hover:underline font-semibold"
    >
      Forgot Password?
    </NavLink>
  </p>
</div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 rounded-lg transition duration-300 disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        <p className="text-center text-gray-500 text-sm mt-4">
          Don't have an account?{" "}
          <NavLink
            to="/register"
            className="text-orange-500 font-semibold hover:underline"
          >
            Register
          </NavLink>
        </p>

      </div>
    </div>
  );
}