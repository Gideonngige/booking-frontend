// ForgotPasswordPage.jsx
import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { API_URL } from "../config/env";

export default function ForgotPassword() {

  const [email, setEmail] = useState("");

  const [error, setError] = useState(null);

  const [success, setSuccess] = useState(false);

  const [loading, setLoading] = useState(false);

  // Submit
  const handleSubmit = async (e) => {

    e.preventDefault();

    setError(null);

    setSuccess(false);

    setLoading(true);

    try {

      const res = await fetch(
        `${API_URL}/request_reset/`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "Failed to send reset link"
        );
      }

      setSuccess(true);

    } catch (err) {

      console.log(err);

      setError(err.message);

    } finally {

      setLoading(false);

    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-500 to-gray-900 px-4">

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">

        {/* Logo */}
        <div className="flex justify-center mb-6">

          <div className="w-24 h-24 bg-orange-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            KE
          </div>

        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
          Forgot Your Password?
        </h2>

        {/* Description */}
        <p className="text-gray-600 text-center mb-6">
          Enter your email address below and we'll send you a link to reset your password.
        </p>

        {/* Error */}
        {error && (

          <div className="bg-red-100 text-red-600 text-sm px-4 py-2 rounded-lg mb-4">

            {error}

          </div>

        )}

        {/* Success */}
        {success ? (

          <div className="bg-green-100 text-green-700 text-sm px-4 py-3 rounded-lg mb-4 text-center">

            Password reset link sent successfully.

            <br />

            <span className="text-gray-600">
              Please check your email inbox and spam folder.
            </span>

            <br />

            <button
              onClick={() => {
                setSuccess(false);
                setEmail("");
              }}
              className="text-orange-500 font-semibold hover:underline mt-2 inline-block"
            >
              Send again
            </button>

          </div>

        ) : (

          <form
            className="space-y-4"
            onSubmit={handleSubmit}
          >

            {/* Email */}
            <div>

              <label className="block text-gray-700 font-semibold mb-2">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="Enter your email"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />

            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 rounded-lg transition duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading
                ? "Sending..."
                : "Send Reset Link"}
            </button>

          </form>

        )}

        {/* Login */}
        <p className="text-center text-gray-500 text-sm mt-4">

          Remembered your password?{" "}

          <NavLink
            to="/login"
            className="text-orange-500 font-semibold hover:underline"
          >
            Login
          </NavLink>

        </p>

      </div>

    </div>
  );
}