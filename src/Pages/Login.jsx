// LoginPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Step 1: Sign in with Firebase
      const user = await login(email, password);
      if (!user) throw new Error("Login failed. Check your credentials.");

      // Step 2: Get Firebase ID token
      const token = await user.getIdToken();

      // Step 3: Send token to your backend to fetch user profile/role
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Backend login failed.");
      // alert("Role: " + data.user.role);

      // Step 4: Redirect based on role
      if (data.user.role === "admin") {
        // cache data using localStorage or context if needed
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/admin-dashboard");
      } else if (data.user.role === "organizer") {
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/creator-dashboard");
      } else {
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/");
      }

    } catch (err) {
      // Firebase error messages are not user-friendly, clean them up
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        setError("Invalid email or password.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many attempts. Please try again later.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-500 to-gray-900">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 mb-10">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-orange-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            KE
          </div>
        </div>

        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Welcome to Book Event
        </h2>

        {/* Error message */}
        {error && (
          <div className="bg-red-100 text-red-600 text-sm px-4 py-2 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
            <p className="text-right text-sm mt-1">
              <a href="/forgot-password" className="text-orange-500 hover:underline font-semibold">
                Forgot Password?
              </a>
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 rounded-lg transition duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-4">
          Don't have an account?{" "}
          <a href="/register" className="text-orange-500 font-semibold hover:underline">
            Register
          </a>
        </p>
      </div>
    </div>
  );
}