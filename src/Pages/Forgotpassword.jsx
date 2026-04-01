// ForgotPasswordPage.jsx
import React from "react";

export default function ForgotPassword() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-500 to-gray-900">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-orange-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            BE
          </div>
        </div>

        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Forgot Your Password?
        </h2>

        <p className="text-gray-600 text-center mb-6">
          Enter your email address below and we'll send you a link to reset your password.
        </p>

        {/* Forgot Password Form */}
        <form className="space-y-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 rounded-lg transition duration-300"
          >
            Send Reset Link
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-4">
          Remembered your password?{" "}
          <a href="/login" className="text-orange-500 font-semibold hover:underline">
            Login
          </a>
        </p>
      </div>
    </div>
  );
}