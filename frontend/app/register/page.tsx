"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import API from "../../src/utils/api";
import axios, { AxiosError } from "axios";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    try {
      setLoading(true);
      setError("");

      await API.post("/auth/register", {
        name,
        email,
        password,
      });

      router.push("/login");
    } catch (error: unknown) {
      const err = error as AxiosError<{ message: string }>;

      setError(
        err.response?.data?.message ||
          "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-blue-200">

      <div className="w-96 bg-white shadow-xl rounded-2xl p-6">

        <h1 className="text-2xl font-bold text-center mb-6">
          Create Account 🚀
        </h1>

        {error && (
          <p className="text-red-500 text-sm mb-3 bg-red-50 p-2 rounded">
            {error}
          </p>
        )}

        <input
          type="text"
          placeholder="Full Name"
          className="border p-2 w-full mb-3 rounded focus:outline-green-400"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          className="border p-2 w-full mb-3 rounded focus:outline-green-400"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="border p-2 w-full mb-3 rounded focus:outline-green-400"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleRegister}
          disabled={loading}
          className={`w-full py-2 rounded text-white font-semibold transition ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-500 hover:bg-green-600"
          }`}
        >
          {loading ? "Creating Account..." : "Register"}
        </button>

        <button
          onClick={() => router.push("/login")}
          className="text-blue-600 mt-4 text-sm w-full"
        >
          Already have an account? Login
        </button>

      </div>
    </div>
  );
}