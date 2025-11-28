import React, { useEffect, useState } from "react";
import axios from "axios";
import Plot from "react-plotly.js";

export default function ComplexityTab({ code, inputSizes }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [selectedFunc, setSelectedFunc] = useState("");

  useEffect(() => {
    if (!code) return;

    const fetchAnalysis = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.post("https://codevizai2026.onrender.com/analyze_code", {
          code,
          func_name: selectedFunc || null,
          input_sizes: inputSizes,
        });

        setResult(response.data);
        console.log(response.data)

        if (response.data.detected_functions.length > 0 && !selectedFunc) {
          setSelectedFunc(response.data.detected_functions[0]);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to analyze code.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [code, selectedFunc, inputSizes]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-80 text-gray-300 text-lg">
        ⏳ Analyzing code complexity...
      </div>
    );

  if (error)
    return <div className="text-center text-red-400 mt-4">{error}</div>;

  if (!result)
    return (
      <div className="text-center text-gray-400 mt-4">
        Paste Python code and select a function to analyze.
      </div>
    );

  const {
    static_analysis,
    profiling_times,
    profiling_memory,
    empirical_time_complexity,
    empirical_space_complexity,
    detected_functions,
  } = result;

  const recursionBadge = static_analysis.recursion_type && (
    <span className="bg-red-900/40 text-red-300 text-xs px-2 py-0.5 rounded ml-2 border border-red-700/60">
      {static_analysis.recursion_type}
    </span>
  );

  const loopBadge = static_analysis.max_loop_depth > 0 && (
    <span className="bg-blue-900/40 text-blue-300 text-xs px-2 py-0.5 rounded ml-2 border border-blue-700/60">
      Loop depth: {static_analysis.max_loop_depth}
    </span>
  );

  return (
    <div className="h-full space-y-6 overflow-y-auto p-4  bg-[#0f172a] text-gray-100">
      {/* Function Selector */}
      {detected_functions.length > 1 && (
        <div className="flex items-center gap-2">
          <label className="font-semibold text-gray-300">Select Function:</label>
          <select
            value={selectedFunc}
            onChange={(e) => setSelectedFunc(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-md px-2 py-1 text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            {detected_functions.map((fn) => (
              <option key={fn} value={fn} className="bg-gray-800">
                {fn}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Static Analysis */}
      <div className="bg-gray-800/80 rounded-xl shadow-md border border-gray-700 p-5">
        <h3 className="text-lg font-semibold text-gray-100 mb-2">
          Static Analysis
        </h3>
        <p className="text-gray-300">
          Recursion: {static_analysis.recursion_type || "None"} {recursionBadge}
        </p>
        <p className="text-gray-300 mt-1">
          Maximum Loop Nesting Depth: {static_analysis.max_loop_depth} {loopBadge}
        </p>
      </div>

      {/* Profiling Chart */}
      <div className="bg-gray-800/80 rounded-xl shadow-md border border-gray-700 p-5">
        <h3 className="text-lg font-semibold text-gray-100 mb-2">Profiling</h3>
        <Plot
          data={[
            {
              x: inputSizes,
              y: profiling_times,
              type: "scatter",
              mode: "lines+markers",
              name: "Execution Time (s)",
              marker: { color: "#3b82f6" },
              line: { color: "#3b82f6" },
            },
            {
              x: inputSizes,
              y: profiling_memory,
              type: "scatter",
              mode: "lines+markers",
              name: "Memory Usage (MB)",
              marker: { color: "#22c55e" },
              line: { color: "#22c55e" },
              yaxis: "y2",
            },
          ]}
          layout={{
            paper_bgcolor: "#0f172a",
            plot_bgcolor: "#0f172a",
            font: { color: "#e2e8f0" },
            title: "Execution Time & Memory Usage vs Input Size",
            xaxis: { title: "Input Size (n)", gridcolor: "#334155" },
            yaxis: { title: "Time (seconds)", gridcolor: "#334155" },
            yaxis2: {
              title: "Memory (MB)",
              overlaying: "y",
              side: "right",
            },
            margin: { t: 40, r: 40, l: 50, b: 40 },
            autosize: true,
          }}
          style={{ width: "100%", height: "400px" }}
          config={{ displayModeBar: false }}
        />
      </div>

      {/* Empirical Complexity */}
      <div className="bg-gray-800/80 rounded-xl shadow-md border border-gray-700 p-5">
        <h3 className="text-lg font-semibold text-gray-100 mb-3">
          Estimated Complexity
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 text-center">
            <p className="text-gray-400 text-sm mb-1">Time Complexity</p>
            <p className="font-bold text-blue-400 text-lg">
              {empirical_time_complexity}
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 text-center">
            <p className="text-gray-400 text-sm mb-1">Space Complexity</p>
            <p className="font-bold text-green-400 text-lg">
              {empirical_space_complexity}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
