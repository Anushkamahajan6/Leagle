"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function PoliciesPage() {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    department: "Legal",
    owner: "",
    version: "1.0",
  });
  const [submitting, setSubmitting] = useState(false);
  const [complianceResults, setComplianceResults] = useState({});

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      const data = await api.policies.getAll(0, 50);
      setPolicies(data.policies || []);
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
      await api.policies.ingest(formData);
      setFormData({
        title: "",
        content: "",
        department: "Legal",
        owner: "",
        version: "1.0",
      });
      await fetchPolicies();
      alert("Policy added successfully!");
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleComplianceCheck = async (id) => {
    try {
      const result = await api.policies.complianceCheck(id);
      setComplianceResults((prev) => ({ ...prev, [id]: result }));
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure?")) return;
    try {
      await api.policies.delete(id);
      await fetchPolicies();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-slate-900">Policies</h1>
        <p className="text-slate-600 mt-2">
          Manage company policies and check compliance
        </p>
      </div>

      {/* Add New Policy Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">
          Add New Policy
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
              Policy Content
            </label>
            <textarea
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              rows="4"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Department
              </label>
              <select
                value={formData.department}
                onChange={(e) =>
                  setFormData({ ...formData, department: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option>Legal</option>
                <option>IT</option>
                <option>Security</option>
                <option>Operations</option>
                <option>HR</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Owner Email
              </label>
              <input
                type="email"
                value={formData.owner}
                onChange={(e) =>
                  setFormData({ ...formData, owner: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Version
              </label>
              <input
                type="text"
                value={formData.version}
                onChange={(e) =>
                  setFormData({ ...formData, version: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-400 text-white rounded-lg font-medium"
          >
            {submitting ? "Adding..." : "Add Policy"}
          </button>
        </form>
      </div>

      {/* Policies List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">
            All Policies ({policies.length})
          </h2>
        </div>

        {loading && (
          <div className="p-6 text-center text-slate-600">Loading...</div>
        )}

        {error && (
          <div className="p-6 text-center text-red-600">Error: {error}</div>
        )}

        {!loading && !error && policies.length === 0 && (
          <div className="p-6 text-center text-slate-600">
            No policies yet. Add one above!
          </div>
        )}

        {!loading && !error && policies.length > 0 && (
          <div className="divide-y divide-slate-200">
            {policies.map((policy) => (
              <div key={policy.id} className="p-6 hover:bg-slate-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900">
                      {policy.title}
                    </h3>
                    <div className="mt-2 flex gap-2 flex-wrap">
                      <span className="inline-block px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                        {policy.department}
                      </span>
                      <span className="inline-block px-2 py-1 bg-slate-100 text-slate-800 text-xs rounded">
                        v{policy.version}
                      </span>
                      <span className="inline-block px-2 py-1 bg-slate-100 text-slate-800 text-xs rounded">
                        Owner: {policy.owner}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mt-2 line-clamp-2">
                      {policy.content}
                    </p>

                    {/* Compliance Check Results */}
                    {complianceResults[policy.id] && (
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-slate-600">Compliance Score</p>
                            <p className="text-xl font-bold text-blue-600">
                              {complianceResults[policy.id].compliance_score}%
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-600">
                              Applicable Regulations
                            </p>
                            <p className="text-xl font-bold text-blue-600">
                              {
                                complianceResults[policy.id]
                                  .applicable_regulations
                              }
                            </p>
                          </div>
                        </div>
                        {complianceResults[policy.id].gaps.length > 0 && (
                          <div className="mt-3">
                            <p className="text-sm font-medium text-slate-700 mb-1">
                              Gaps:
                            </p>
                            <ul className="text-xs text-slate-600 space-y-1">
                              {complianceResults[policy.id].gaps.map(
                                (gap, i) => (
                                  <li key={i}>• {gap}</li>
                                )
                              )}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="ml-4 flex gap-2">
                    <button
                      onClick={() => handleComplianceCheck(policy.id)}
                      className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded text-sm"
                    >
                      Check Compliance
                    </button>
                    <button
                      onClick={() => handleDelete(policy.id)}
                      className="px-3 py-1 text-red-600 hover:bg-red-50 rounded text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
