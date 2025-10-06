import React, { useEffect, useState } from "react";
import axios from "axios";

export default function ComplexityTab({ code }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!code) return;

    const fetchAnalysis = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.post("http://localhost:8000/analyze", {
          code,
        });
        setResult(response.data.analysis); // backend returns { analysis: "..." }
      } catch (err) {
        console.error(err);
        setError("Failed to analyze code.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [code]);

  if (loading) return <div>Analyzing code complexity...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!result) return <div>Paste code to analyze.</div>;

  // Simple formatting: split into sections
  const lines = result.split("\n").map((line, idx) => (
    <p key={idx} className="mb-1">
      {line}
    </p>
  ));

  return (
    <div className="p-4 space-y-6 overflow-y-auto h-[80vh]">
      <div className="border p-3 rounded shadow">
        <h3 className="font-semibold mb-2">Code Complexity Analysis</h3>
        <div className="whitespace-pre-line">{lines}</div>
      </div>
    </div>
  );
}
