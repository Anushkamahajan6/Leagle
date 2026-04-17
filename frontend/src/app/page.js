"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [backendHealth, setBackendHealth] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check backend health
        const health = await api.health();
        setBackendHealth(health);

        // Fetch regulations
        const regsData = await api.regulations.getAll(0, 100);
        const regCount = regsData.total || regsData.regulations?.length || 0;

        // Fetch policies
        const polsData = await api.policies.getAll(0, 100);
        const polCount = polsData.total || polsData.policies?.length || 0;

        setStats({
          regulations: regCount,
          policies: polCount,
        });
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-2">
          AI-Powered Compliance Management System
        </p>
      </div>

      {/* Backend Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-2">
          <div
            className={`w-3 h-3 rounded-full ${
              backendHealth ? "bg-green-500" : "bg-red-500"
            }`}
          />
          <span className="text-sm font-medium">
            {backendHealth ? "✅ Backend Connected" : "❌ Backend Offline"}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      {!loading && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Regulations Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-600 font-medium">
                  Regulations
                </p>
                <p className="text-3xl font-bold text-slate-900 mt-2">
                  {stats.regulations}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Compliance requirements tracked
                </p>
              </div>
              <div className="text-3xl">📋</div>
            </div>
            <Link
              href="/regulations"
              className="mt-4 inline-block text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View All →
            </Link>
          </div>

          {/* Policies Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-600 font-medium">Policies</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">
                  {stats.policies}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Company policies managed
                </p>
              </div>
              <div className="text-3xl">📄</div>
            </div>
            <Link
              href="/policies"
              className="mt-4 inline-block text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View All →
            </Link>
          </div>
        </div>
      )}

      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin">⏳</div>
          <p className="text-slate-600 mt-2">Loading dashboard...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">
            <strong>Error:</strong> {error}
          </p>
          <p className="text-red-700 text-xs mt-2">
            Make sure the backend is running: Run `python main.py` in the
            backend folder
          </p>
        </div>
      )}

      {/* Info Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-blue-900 mb-3">
          🚀 Getting Started
        </h2>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>
            • <strong>Regulations:</strong> Upload compliance requirements and
            find similar regulations
          </li>
          <li>
            • <strong>Policies:</strong> Manage company policies and check
            compliance
          </li>
          <li>
            • <strong>Semantic Search:</strong> AI-powered similarity matching
            using Qdrant
          </li>
          <li>
            • <strong>API Docs:</strong> Interactive API testing at{" "}
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-blue-900"
            >
              localhost:8000/docs
            </a>
          </li>
        </ul>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Link
            href="/regulations"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
          >
            Browse Regulations
          </Link>
          <Link
            href="/policies"
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium"
          >
            Browse Policies
          </Link>
          <a
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg text-sm font-medium"
          >
            API Documentation
          </a>
          <Link
            href="/regulations"
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium"
          >
            Add New Regulation
          </Link>
        </div>
      </div>
    </div>
  );
}
