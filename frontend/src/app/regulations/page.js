"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function RegulationsPage() {
  const [regulations, setRegulations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    text: "",
    category: "data_privacy",
    source: "CUSTOM",
    jurisdiction: "GLOBAL",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRegulations();
  }, []);

  const fetchRegulations = async () => {
    try {
      const data = await api.regulations.getAll(0, 50);
      setRegulations(data.regulations || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await api.regulations.ingest(formData);
      setFormData({
        title: "",
        text: "",
        category: "data_privacy",
        source: "CUSTOM",
        jurisdiction: "GLOBAL",
      });
      await fetchRegulations();
      alert("Regulation added successfully!");
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure?")) return;
    try {
      await api.regulations.delete(id);
      await fetchRegulations();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-slate-900">Regulations</h1>
        <p className="text-slate-600 mt-2">
          Manage and track compliance requirements
        </p>
      </div>

      {/* Add New Regulation Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">
          Add New Regulation
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Regulation Text
            </label>
            <textarea
              value={formData.text}
              onChange={(e) =>
                setFormData({ ...formData, text: e.target.value })
              }
              rows="4"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option>data_privacy</option>
                <option>security</option>
                <option>financial</option>
                <option>other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Source
              </label>
              <select
                value={formData.source}
                onChange={(e) =>
                  setFormData({ ...formData, source: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option>CUSTOM</option>
                <option>GDPR</option>
                <option>DPDP_ACT</option>
                <option>SOC2</option>
                <option>PCI_DSS</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Jurisdiction
              </label>
              <select
                value={formData.jurisdiction}
                onChange={(e) =>
                  setFormData({ ...formData, jurisdiction: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option>GLOBAL</option>
                <option>EU</option>
                <option>INDIA</option>
                <option>US</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white rounded-lg font-medium"
          >
            {submitting ? "Adding..." : "Add Regulation"}
          </button>
        </form>
      </div>

      {/* Regulations List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">
            All Regulations ({regulations.length})
          </h2>
        </div>

        {loading && (
          <div className="p-6 text-center text-slate-600">Loading...</div>
        )}

        {error && (
          <div className="p-6 text-center text-red-600">Error: {error}</div>
        )}

        {!loading && !error && regulations.length === 0 && (
          <div className="p-6 text-center text-slate-600">
            No regulations yet. Add one above!
          </div>
        )}

        {!loading && !error && regulations.length > 0 && (
          <div className="divide-y divide-slate-200">
            {regulations.map((reg) => (
              <div key={reg.id} className="p-6 hover:bg-slate-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900">
                      {reg.title}
                    </h3>
                    <div className="mt-2 flex gap-2">
                      <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {reg.category}
                      </span>
                      <span className="inline-block px-2 py-1 bg-slate-100 text-slate-800 text-xs rounded">
                        {reg.source}
                      </span>
                      <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                        Risk: {reg.risk_level}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mt-2 line-clamp-2">
                      {reg.raw_text}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(reg.id)}
                    className="ml-4 px-3 py-1 text-red-600 hover:bg-red-50 rounded text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
