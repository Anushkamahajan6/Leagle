import { useState } from "react";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export default function Ingest() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [debug, setDebug] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setError(null);
    setResult(null);
  };

  const handleUpload = async () => {
    if (!file) return alert("Upload a PDF first");

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const url = debug
        ? "http://localhost:8000/api/ingest/upload?debug=true"
        : "http://localhost:8000/api/ingest/upload";

      const res = await fetch(url, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || `HTTP ${res.status}`);
      }

      const data = await res.json();
      setResult(data);
      alert("✅ Processed successfully 🚀");
      setFile(null);
    } catch (err) {
      const errorMsg = err.message || "Unknown error occurred";
      setError(errorMsg);
      console.error("Upload error:", err);
      alert(`❌ Error: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisReport, setAnalysisReport] = useState(null);

  const handleRunAnalysis = async () => {
    if (!result || !result.document_id) return;

    setAnalysisLoading(true);
    setAnalysisReport(null);

    try {
      const res = await fetch(`http://localhost:8000/api/analytics/compare/${result.document_id}`, {
        method: "POST",
      });

      if (!res.ok) throw new Error("Analysis failed");

      const data = await res.json();
      setAnalysisReport(data.report);
      alert("✅ Gap Analysis Complete!");
    } catch (err) {
      alert(`❌ Analysis Error: ${err.message}`);
    } finally {
      setAnalysisLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Field>
        <FieldLabel htmlFor="pdf-upload">Upload PDF</FieldLabel>

        <Input
          id="pdf-upload"
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          disabled={loading}
          className="hidden"
        />

        <label
          htmlFor="pdf-upload"
          className={`cursor-pointer inline-block px-4 py-2 bg-blue-600 text-white rounded-lg transition-transform active:scale-95 ${loading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700 shadow-md"
            }`}
        >
          📄 Choose PDF File
        </label>

        <FieldDescription>
          Upload a PDF document (max 50MB). It will be processed through extraction, chunking, and embedding.
        </FieldDescription>

        {file && (
          <p className="text-sm font-medium text-blue-600 mt-2 flex items-center gap-1">
            <span className="animate-pulse">⏳</span> Selected: {file.name}
          </p>
        )}

        <div className="mt-4 flex items-center gap-4">
          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className={`px-6 py-2 rounded-lg text-white font-bold transition-all ${loading || !file
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700 shadow-lg hover:-translate-y-0.5"
              }`}
          >
            {loading ? "⏳ Ingesting..." : "Upload & Process"}
          </button>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={debug}
              onChange={(e) => setDebug(e.target.checked)}
              disabled={loading}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-500 font-medium">Debug output</span>
          </label>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg shadow-sm">
            <p className="text-sm text-red-700">
              <strong>Processing Failed:</strong> {error}
            </p>
          </div>
        )}

        {result && (
          <div className="mt-6 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="p-5 bg-white border border-green-200 rounded-2xl shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <h3 className="text-lg font-bold text-green-800">✅ Ingestion Successful</h3>
                  <p className="text-xs text-green-600 font-medium">Document ID: {result.document_id}</p>
                </div>
                {!analysisReport && (
                  <button
                    onClick={handleRunAnalysis}
                    disabled={analysisLoading}
                    className={`px-4 py-2 rounded-full text-sm font-bold shadow-sm transition-all ${analysisLoading
                        ? "bg-gray-100 text-gray-400"
                        : "bg-blue-600 text-white hover:bg-blue-700 active:scale-95"
                      }`}
                  >
                    {analysisLoading ? "🧠 Analyzing Chunks..." : "⚡ Run Comparative Gap Analysis"}
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                {[
                  { label: "Size", value: `${result.pipeline_stats.file_size_mb} MB` },
                  { label: "Pages", value: result.pipeline_stats.extracted_pages },
                  { label: "Chunks", value: result.pipeline_stats.num_chunks },
                  { label: "Embeddings", value: result.pipeline_stats.num_embeddings },
                ].map((stat, i) => (
                  <div key={i} className="bg-gray-50 p-2 rounded-lg">
                    <p className="text-gray-400 uppercase tracking-tighter font-bold">{stat.label}</p>
                    <p className="text-gray-800 text-sm font-black">{stat.value}</p>
                  </div>
                ))}
              </div>

              {analysisReport && (
                <div className="mt-6 pt-4 border-t space-y-6 animate-in zoom-in-95 duration-300">
                  {/* COMPREHENSIVE LEGAL DETERMINATION */}
                  {analysisReport.comprehensive_synthesis && (
                    <div className="p-5 bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl border-2 border-purple-200 shadow-lg space-y-4">
                      <div className="flex items-center justify-between border-b border-purple-200 pb-3">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">⚖️</div>
                          <div>
                            <h3 className="text-lg font-black text-purple-900">Comprehensive Legal Determination</h3>
                            <p className="text-xs text-purple-600">AI-Generated Compliance Audit Report</p>
                          </div>
                        </div>
                        <div className={`px-4 py-2 rounded-full text-sm font-black ${
                          analysisReport.comprehensive_synthesis.overall_compliance_status === "COMPLIANT" ? "bg-green-100 text-green-700" :
                          analysisReport.comprehensive_synthesis.overall_compliance_status === "PARTIALLY_COMPLIANT" ? "bg-yellow-100 text-yellow-700" :
                          "bg-red-100 text-red-700"
                        }`}>
                          {analysisReport.comprehensive_synthesis.overall_compliance_status}
                        </div>
                      </div>

                      {/* Executive Summary */}
                      <div>
                        <h4 className="text-sm font-bold text-purple-900 mb-2">Executive Summary</h4>
                        <p className="text-sm text-gray-800 leading-relaxed">
                          {analysisReport.comprehensive_synthesis.executive_summary}
                        </p>
                      </div>

                      {/* Legal Determination */}
                      <div className="p-4 bg-white rounded-lg border-l-4 border-purple-500">
                        <h4 className="text-sm font-bold text-purple-900 mb-2">Legal Determination</h4>
                        <p className="text-sm text-gray-800 leading-relaxed font-medium">
                          {analysisReport.comprehensive_synthesis.legal_determination}
                        </p>
                      </div>

                      {/* Critical Issues */}
                      {analysisReport.comprehensive_synthesis.critical_issues?.length > 0 && (
                        <div>
                          <h4 className="text-sm font-bold text-red-900 mb-3">🚨 Critical Issues</h4>
                          <div className="space-y-3">
                            {analysisReport.comprehensive_synthesis.critical_issues.map((issue, idx) => (
                              <div key={idx} className={`p-3 rounded-lg border-l-4 ${
                                issue.severity === "CRITICAL" ? "bg-red-50 border-red-500" :
                                issue.severity === "HIGH" ? "bg-orange-50 border-orange-500" :
                                "bg-yellow-50 border-yellow-500"
                              }`}>
                                <p className="text-sm font-bold text-gray-900">{issue.issue}</p>
                                <p className="text-xs text-gray-700 mt-1">
                                  <strong>Affected Areas:</strong> {issue.affected_areas?.join(", ")}
                                </p>
                                <p className="text-xs text-red-700 mt-1 font-medium">
                                  <strong>Legal Exposure:</strong> {issue.legal_exposure}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Systemic Patterns */}
                      {analysisReport.comprehensive_synthesis.systemic_patterns?.length > 0 && (
                        <div>
                          <h4 className="text-sm font-bold text-orange-900 mb-2">📊 Systemic Patterns</h4>
                          <ul className="text-xs text-gray-700 list-disc list-inside space-y-1">
                            {analysisReport.comprehensive_synthesis.systemic_patterns.map((pattern, idx) => (
                              <li key={idx}>{pattern}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Immediate Actions */}
                      {analysisReport.comprehensive_synthesis.immediate_actions?.length > 0 && (
                        <div>
                          <h4 className="text-sm font-bold text-blue-900 mb-3">✅ Immediate Actions Required</h4>
                          <div className="space-y-2">
                            {analysisReport.comprehensive_synthesis.immediate_actions.map((action, idx) => (
                              <div key={idx} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <div className="flex items-start gap-3">
                                  <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                                    {action.priority}
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm font-bold text-gray-900">{action.action}</p>
                                    <p className="text-xs text-gray-600 mt-1">
                                      <strong>Timeline:</strong> {action.timeline} days | <strong>Owner:</strong> {action.responsible_party}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Regulatory Exposure */}
                      {analysisReport.comprehensive_synthesis.regulatory_exposure_summary && (
                        <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                          <h4 className="text-sm font-bold text-red-900 mb-2">⚠️ Regulatory Exposure Summary</h4>
                          <p className="text-xs text-red-800">{analysisReport.comprehensive_synthesis.regulatory_exposure_summary}</p>
                        </div>
                      )}

                      {/* Compliance Score */}
                      <div className="flex items-center justify-between p-3 bg-blue-100 rounded-lg">
                        <span className="font-bold text-blue-900">Overall Compliance Score:</span>
                        <div className="text-lg font-black text-blue-700">
                          {analysisReport.comprehensive_synthesis.compliance_score}%
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Individual Chunk Findings */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-bold text-gray-900">Detail: Per-Chunk Analysis</h4>
                      <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-black">
                        Score: {analysisReport.overall_alignment_score}% Match
                      </div>
                    </div>

                    <div className="space-y-4">
                      {analysisReport.findings.map((finding, idx) => (
                        <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${finding.risk_impact === "HIGH" ? "bg-red-100 text-red-600" :
                                finding.risk_impact === "MEDIUM" ? "bg-orange-100 text-orange-600" :
                                  "bg-green-100 text-green-600"
                              }`}>
                              {finding.risk_impact} RISK GAP
                            </span>
                            <span className="text-[10px] text-gray-400 font-mono">CHUNK #{idx + 1}</span>
                          </div>
                          <p className="text-xs italic text-gray-500">"{finding.chunk_preview}"</p>
                          <p className="text-sm font-bold text-gray-800">{finding.alignment_summary}</p>
                          <ul className="text-xs text-red-600 list-disc list-inside font-medium">
                            {finding.specific_gaps.map((gap, gIdx) => (
                              <li key={gIdx}>{gap}</li>
                            ))}
                          </ul>
                          <div className="pt-2 flex items-center gap-2">
                            <span className="text-[10px] font-bold text-gray-400">CITES:</span>
                            {finding.matched_regulations.map((reg, rIdx) => (
                              <span key={rIdx} className="px-2 py-1 bg-white border rounded shadow-sm text-[9px] font-bold text-blue-600">
                                {reg}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {debug && result.extraction && (
                <div className="mt-3 p-3 bg-gray-900 rounded-xl text-[10px] font-mono text-green-400 overflow-hidden">
                  <p className="text-white font-bold mb-2">/internal/debug/extraction_stream</p>
                  <p className="whitespace-pre-wrap opacity-80">
                    {result.extraction.text_preview}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </Field>
    </div>
  );
}