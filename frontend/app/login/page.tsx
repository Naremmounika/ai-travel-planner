"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import API from "../../src/utils/api";
import axios, { AxiosError } from "axios";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await API.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);

      router.push("/dashboard");
    } catch (error: unknown) {
      const err = error as AxiosError<{ message: string }>;

      setError(
        err.response?.data?.message ||
          "Invalid email or password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-200">

      <div className="w-96 bg-white shadow-xl rounded-2xl p-6">

        <h1 className="text-2xl font-bold text-center mb-6">
          Welcome Back 👋
        </h1>

        {error && (
          <p className="text-red-500 text-sm mb-3 bg-red-50 p-2 rounded">
            {error}
          </p>
        )}

        <input
          type="email"
          placeholder="Email"
          className="border p-2 w-full mb-3 rounded focus:outline-blue-400"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="border p-2 w-full mb-3 rounded focus:outline-blue-400"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          className={`w-full py-2 rounded text-white font-semibold transition ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <button
          onClick={() => router.push("/register")}
          className="text-blue-600 mt-4 text-sm w-full"
        >
          Don't have an account? Register
        </button>

      </div>
    </div>
  );
}