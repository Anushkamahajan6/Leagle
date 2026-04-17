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
          className={`cursor-pointer inline-block px-4 py-2 bg-blue-600 text-white rounded-lg ${
            loading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
          }`}
        >
          📄 Choose PDF File
        </label>

        <FieldDescription>
          Upload a PDF document (max 50MB). It will be processed through extraction, chunking, and embedding.
        </FieldDescription>

        {file && (
          <p className="text-sm text-green-600 mt-2">✅ {file.name}</p>
        )}

        <div className="mt-4 space-y-2">
          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className={`px-4 py-2 rounded-lg text-white font-medium ${
              loading || !file
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {loading ? "⏳ Processing..." : "Upload & Process"}
          </button>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={debug}
              onChange={(e) => setDebug(e.target.checked)}
              disabled={loading}
            />
            <span className="text-sm text-gray-600">Debug mode (detailed output)</span>
          </label>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">
              <strong>Error:</strong> {error}
            </p>
          </div>
        )}

        {result && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg space-y-3">
            <div>
              <h3 className="font-semibold text-green-900">✅ Ingestion Successful</h3>
              <p className="text-sm text-green-700">{result.message}</p>
            </div>

            <div className="text-sm text-gray-700 space-y-1">
              <div>
                <span className="font-medium">File Size:</span> {result.pipeline_stats.file_size_mb} MB
              </div>
              <div>
                <span className="font-medium">Pages:</span> {result.pipeline_stats.extracted_pages}
              </div>
              <div>
                <span className="font-medium">Characters:</span> {result.pipeline_stats.extracted_chars.toLocaleString()}
              </div>
              <div>
                <span className="font-medium">Chunks:</span> {result.pipeline_stats.num_chunks}
              </div>
              <div>
                <span className="font-medium">Embeddings:</span> {result.pipeline_stats.num_embeddings}
              </div>
              <div>
                <span className="font-medium">Tokens Used:</span> {result.pipeline_stats.tokens_used.toLocaleString()}
              </div>
              <div>
                <span className="font-medium">Strategy:</span> {result.pipeline_stats.chunking_strategy}
              </div>
            </div>

            {debug && result.extraction && (
              <div className="mt-3 p-2 bg-white rounded border border-green-100 text-xs">
                <p className="font-semibold text-gray-800 mb-1">Extraction Debug:</p>
                <p className="text-gray-600 whitespace-pre-wrap">
                  {result.extraction.text_preview}
                </p>
              </div>
            )}
          </div>
        )}
      </Field>
    </div>
  );
}