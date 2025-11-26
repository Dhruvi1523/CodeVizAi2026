// LCSInteractivePage.jsx — Final Tailwind React component
// - Left: horizontal string rows A and B with animated arrows and green/red flash
// - Right: bottom-up DP table with first row/column = 0
// - Unicode arrows (AR1: ↖, ↑, ←) used to show dependencies inside DP cells
// - Explanation panel (fixed size) and Rules panel (monospace equations) below
// - Path reconstruction & incremental reveal; highlights in both strings
// - Tailwind CSS classes only; responsive mobile-first layout

import React, { useEffect, useRef, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";
export default function LCSInteractivePage() {
  const [A, setA] = useState("ABCBDAB");
  const [B, setB] = useState("BDCABA");

  const [dp, setDp] = useState([]); // null = not filled
  const [steps, setSteps] = useState([]);
  const [stepIdx, setStepIdx] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(900);
  const intervalRef = useRef(null);

  const [path, setPath] = useState([]);
  const [reveal, setReveal] = useState("");
  const [highlightA, setHighlightA] = useState([]);
  const [highlightB, setHighlightB] = useState([]);
  const revealRef = useRef(null);

  // reset when inputs change
  useEffect(() => {
    resetAll();
  }, [A, B]);

  // play timer
  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setStepIdx((s) => Math.min(steps.length - 1, s + 1));
      }, Math.max(50, speed));
    } else {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => clearInterval(intervalRef.current);
  }, [playing, speed, steps.length]);

  // apply step to dp
  useEffect(() => {
    if (stepIdx < 0 || stepIdx >= steps.length) return;
    const s = steps[stepIdx];
    setDp((prev) => {
      const copy = prev.map((r) => [...r]);
      copy[s.i][s.j] = s.val;
      return copy;
    });
  }, [stepIdx]);

  // compute bottom-up steps
  function computeBottomUp() {
    const n = A.length,
      m = B.length;
    const temp = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));
    const seq = [];
    for (let i = 0; i <= n; i++) {
      for (let j = 0; j <= m; j++) {
        if (i === 0 || j === 0) {
          temp[i][j] = 0;
          seq.push({ i, j, val: 0, type: "base" });
        } else {
          const diag = temp[i - 1][j - 1];
          const top = temp[i - 1][j];
          const left = temp[i][j - 1];
          if (A[i - 1] === B[j - 1]) {
            const v = 1 + diag;
            temp[i][j] = v;
            seq.push({ i, j, val: v, type: "match", diag, top, left });
          } else {
            const v = Math.max(top, left);
            temp[i][j] = v;
            seq.push({
              i,
              j,
              val: v,
              type: "mismatch",
              diag,
              top,
              left,
              chosen: top >= left ? "top" : "left",
            });
          }
        }
      }
    }
    setDp(
      Array.from({ length: A.length + 1 }, () => Array(B.length + 1).fill(null))
    );
    setSteps(seq);
    setStepIdx(-1);
    setPlaying(false);
    setPath([]);
    setReveal("");
    setHighlightA([]);
    setHighlightB([]);
  }

  function jumpToEnd() {
    if (!steps.length) return;
    const final = Array.from({ length: A.length + 1 }, () =>
      Array(B.length + 1).fill(0)
    );
    for (const s of steps) final[s.i][s.j] = s.val;
    setDp(final);
    setStepIdx(steps.length - 1);
  }
  function resetAll() {
    setDp([]);
    setSteps([]);
    setStepIdx(-1);
    setPlaying(false);
    setPath([]);
    setReveal("");
    setHighlightA([]);
    setHighlightB([]);
    clearInterval(intervalRef.current);
    clearInterval(revealRef.current);
    intervalRef.current = null;
    revealRef.current = null;
  }

  function reconstructPath() {
    if (!dp.length) return alert("Compute DP first");
    // ensure full
    for (let i = 0; i <= A.length; i++)
      for (let j = 0; j <= B.length; j++)
        if (dp[i][j] === null)
          return alert("Finish animation or Jump to End first");
    let i = A.length,
      j = B.length;
    const p = [];
    while (i > 0 && j > 0) {
      if (A[i - 1] === B[j - 1]) {
        p.push([i - 1, j - 1]);
        i--;
        j--;
      } else if (dp[i - 1][j] >= dp[i][j - 1]) i--;
      else j--;
    }
    p.reverse();
    setPath(p);
    animateReveal(p);
  }

  function animateReveal(p) {
    clearInterval(revealRef.current);
    setReveal("");
    setHighlightA([]);
    setHighlightB([]);
    let k = 0;
    revealRef.current = setInterval(() => {
      if (k >= p.length) {
        clearInterval(revealRef.current);
        return;
      }
      const [ai, bj] = p[k];
      setReveal((r) => r + A[ai]);
      setHighlightA((h) => [...h, ai]);
      setHighlightB((h) => [...h, bj]);
      k++;
    }, Math.max(120, Math.floor(speed / 2)));
  }

function explanationLeft() {
  if (stepIdx < 0) {
    return (
      <div className="text-slate-300 text-sm">
        Press <b className="text-sky-300">Compute</b> then Play / Next / Prev to animate.
      </div>
    );
  }

  const s = steps[stepIdx];
  const { i, j } = s;
  const dispI = i - 1, dispJ = j - 1;

  if (s.type === "base") {
    return (
      <div className="space-y-1">
        <div className="text-yellow-300 font-bold flex items-center gap-2">
          <span className="text-lg">📌</span> Base Case
        </div>
        <div className="text-slate-300 text-sm">
          Either <b>A index = {dispI}</b> or <b>B index = {dispJ}</b> means empty prefix <br />
          → value = <span className="text-yellow-300 font-semibold">0</span>
        </div>
      </div>
    );
  }

  if (s.type === "match") {
    return (
      <div className="space-y-1">
        <div className="text-green-400 font-bold flex items-center gap-2">
          <span className="text-lg">✅</span> Match Found!
        </div>

        <div className="text-sm text-slate-300">
          A[{dispI}] = B[{dispJ}] → 
          <span className="text-green-300 font-bold"> '{A[dispI]}' </span>
        </div>

        <div className="text-sm text-slate-300 font-mono bg-[#0f1b30] px-2 py-1 rounded">
          value = 1 + LCS({dispI - 1}, {dispJ - 1})
          <span className="pl-2 text-green-300 font-semibold">= {s.val}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="text-red-400 font-bold flex items-center gap-2">
        <span className="text-lg">❌</span> Mismatch
      </div>

      <div className="text-sm text-slate-300">
        A[{dispI}] = '{A[dispI]}' vs B[{dispJ}] = '{B[dispJ]}'
      </div>

      <div className="text-sm text-slate-300 font-mono bg-[#30181840] px-2 py-1 rounded">
        max( LCS({dispI - 1}, {dispJ}), LCS({dispI}, {dispJ - 1}) )
        <span className="pl-2 text-blue-300 font-semibold">= {s.val}</span>
      </div>
    </div>
  );
}




function rulesPanel() {
  if (stepIdx < 0) return null;
  const { i, j, type } = steps[stepIdx];

  if( i == 0 || j == 0){
    return null ;
  }
  const dispI = i - 1, dispJ = j - 1;

  if (type === "match") {
    return (
      <div className="space-y-3 text-sm">
        <div className="p-3 bg-green-200 rounded-lg text-black font-semibold">
          1 + LCS({dispI - 1}, {dispJ - 1})
        </div>
        <div className="p-2 bg-[#0b1220] text-slate-300 rounded-lg">
          max(LCS({dispI - 1}, {dispJ}), LCS({dispI}, {dispJ - 1}))
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 text-sm">
      <div className="p-2 bg-[#0b1220] text-slate-300 rounded-lg">
        1 + LCS({dispI - 1}, {dispJ - 1})
      </div>
      <div className="p-3 bg-red-300 rounded-lg text-black font-semibold">
        max(LCS({dispI - 1}, {dispJ}), LCS({dispI}, {dispJ - 1}))
      </div>
    </div>
  );
}




  // Left strings area (two horizontal rows) with green/red flash based on current cell being match/mismatch
  function renderStringsLeft() {
    const cur = stepIdx >= 0 ? steps[stepIdx] : null;
    const curI = cur ? cur.i - 1 : -1;
    const curJ = cur ? cur.j - 1 : -1;
    return (
      <div className="bg-[#071026] p-4 rounded-lg">
        <div className="mb-4">
          <div className="text-sm text-slate-400 mb-2">A (horizontal)</div>
          <div className="flex flex-wrap gap-3 items-end justify-start">
            {A.split("").map((ch, idx) => {
              const active = idx === curI;
              const chosen = highlightA.includes(idx);
              const flash = active
                ? chosen
                  ? "bg-green-400 text-black animate-pulse"
                  : "bg-red-400 text-black animate-pulse"
                : "";
              return (
                <div key={idx} className="text-center">
                  <div className="h-4">
                    {active ? (
                      <span className="text-yellow-300">▲</span>
                    ) : (
                      <span className="text-transparent">▲</span>
                    )}
                  </div>
                  <div
                    className={`px-3 py-2 rounded-md border border-slate-700 ${flash} ${
                      !flash && "bg-[#0b1220] text-white"
                    }`}
                  >
                    {ch}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">{idx}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <div className="text-sm text-slate-400 mb-2">B (horizontal)</div>
          <div className="flex flex-wrap gap-3 items-end justify-start">
            {B.split("").map((ch, idx) => {
              const active = idx === curJ;
              const chosen = highlightB.includes(idx);
              const flash = active
                ? chosen
                  ? "bg-green-400 text-black animate-pulse"
                  : "bg-red-400 text-black animate-pulse"
                : "";
              return (
                <div key={idx} className="text-center">
                  <div className="h-4">
                    {active ? (
                      <span className="text-yellow-300">▲</span>
                    ) : (
                      <span className="text-transparent">▲</span>
                    )}
                  </div>
                  <div
                    className={`px-3 py-2 rounded-md border border-slate-700 ${flash} ${
                      !flash && "bg-[#0b1220] text-white"
                    }`}
                  >
                    {ch}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">{idx}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-4 text-sm text-slate-300">
          Final LCS reveal:{" "}
          <span className="text-yellow-300 font-semibold">
            {reveal || "(empty)"}
          </span>
        </div>
      </div>
    );
  }

  // Right DP table area with unicode arrows showing dependencies (↖, ↑, ←)
function renderDPTable() {
  const n = A.length, m = B.length;

  return (
    <div className="bg-[#071026] p-4 rounded-xl shadow-xl overflow-auto">
      <table className="border-collapse mx-auto text-sm">
        <tbody>

          {/* B string header row */}
          <tr>
            
            <td className="w-6"></td>

            {/* Empty left top corner */}
            <td className="px-3 py-1 text-xs text-slate-400 text-center"></td>

            {/* B indices: -1, 0,1,2... */}
            {Array.from({ length: m + 1 }).map((_, j) => (
              <td
                key={`bidx-${j}`}
                className="px-3 py-1 text-xs text-slate-400 text-center"
              >
                {j - 1}
              </td>
            ))}
          </tr>

          {/* B characters row */}
          <tr>
            <td className="w-6"></td>
            <td className="px-3 py-1 text-xs text-slate-300 text-center font-medium">
              {/* blank */} 
            </td>

            {Array.from({ length: m + 1 }).map((_, j) => (
              <td
                key={`bchar-${j}`}
                className="px-3 py-1 text-xs text-slate-300 text-center font-medium"
              >
                {j === 0 ? "" : B[j - 1]}
              </td>
            ))}
          </tr>

          {/* DP grid rows */}
          {Array.from({ length: n + 1 }).map((_, i) => (
            <tr key={`row-${i}`}>
              {/* A characters */}
              <td className="px-1 py-2 text-xs text-slate-300 text-center font-medium">
                {i === 0 ? "" : A[i - 1]}
              </td>

              {/* A indices */}
              <td className="px-1 py-2 text-xs text-slate-400 text-center">
                {i - 1}
              </td>

              {Array.from({ length: m + 1 }).map((_, j) => {
                const filled = dp[i]?.[j] !== undefined && dp[i][j] !== null;
                const active =
                  stepIdx >= 0 &&
                  steps[stepIdx]?.i === i &&
                  steps[stepIdx]?.j === j;

                const onPath = path.some(([pi, pj]) => pi + 1 === i && pj + 1 === j);

                let bg = "bg-[#0b1220] text-white border border-slate-700";

                if (onPath) bg = "bg-yellow-300 text-black border border-yellow-500";
                else if (active) {
                  switch (steps[stepIdx]?.type) {
                    case "base":
                      bg = "bg-blue-300 text-black border border-blue-500";
                      break;
                    case "match":
                      bg = "bg-green-400 text-black border border-green-600";
                      break;
                    case "mismatch":
                      bg = "bg-red-400 text-black border border-red-600";
                      break;
                  }
                }

                return (
                  <td key={`cell-${i}-${j}`} className={`px-3 py-2 text-center transition-all ${bg}`}>
                    {filled ? dp[i][j] : ""}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

  // keyboard shortcuts
  useEffect(() => {
    function onKey(e) {
      if (e.key === " " || e.key === "k") {
        setPlaying((p) => !p);
        e.preventDefault();
      } else if (e.key === "ArrowRight") {
        setStepIdx((s) => Math.min(steps.length - 1, s + 1));
      } else if (e.key === "ArrowLeft") {
        setStepIdx((s) => Math.max(-1, s - 1));
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [steps.length]);

  return (
    <div className="w-screen h-screen bg-[#0f172a] text-white flex flex-col overflow-hidden">
      {/* Top Title Section */}
      <header className="flex items-center gap-4 px-4 py-3 border-b border-slate-700 bg-[#0b1220] shadow-lg">
        <Link
          to="/dynamic-programming"
          className="p-2 text-[#94a3b8] hover:bg-[#1e293b] hover:text-[#f1f5f9] rounded-full transition-colors"
          title="Back to Algorithms"
        >
          <ChevronLeft size={22} />
        </Link>

        <div className="w-px h-6 bg-[#334155]"></div>

        <h1 className="text-2xl font-bold tracking-wide text-[#e2e8f0]">
          Longest Common Subsequence (LCS)
        </h1>
      </header>

      {/* Controls */}
      <div className="px-4 py-5 bg-[#0b1220] border-b border-slate-800 flex flex-wrap items-center gap-3 text-sm shadow-inner">
        <input
          value={A}
          onChange={(e) => setA(e.target.value.toUpperCase())}
          placeholder="String A"
          className="px-3 py-1 rounded-lg bg-[#1e293b] border border-slate-600 w-[140px] text-slate-200 focus:ring-2 ring-sky-500"
        />

        <input
          value={B}
          onChange={(e) => setB(e.target.value.toUpperCase())}
          placeholder="String B"
          className="px-3 py-1 rounded-lg bg-[#1e293b] border border-slate-600 w-[140px] text-slate-200 focus:ring-2 ring-sky-500"
        />

        <button
          onClick={computeBottomUp}
          className="px-4 py-1 rounded-lg bg-sky-400 text-black font-semibold shadow hover:bg-sky-300"
        >
          Compute
        </button>

        <button
          onClick={() => setPlaying((p) => !p)}
          className="px-4 py-1 rounded-lg bg-[#1c2a45] hover:bg-[#243452] border border-slate-700 shadow"
        >
          {playing ? "Pause" : "Play"}
        </button>

        <button
          onClick={() => {
            setPlaying(false);
            setStepIdx((s) => Math.min(steps.length - 1, s + 1));
          }}
          className="px-4 py-1 rounded-lg bg-[#1c2a45] hover:bg-[#243452] border border-slate-700 shadow"
        >
          Next
        </button>

        <button
          onClick={() => {
            setPlaying(false);
            setStepIdx((s) => Math.max(-1, s - 1));
          }}
          className="px-4 py-1 rounded-lg bg-[#1c2a45] hover:bg-[#243452] border border-slate-700 shadow"
        >
          Prev
        </button>

        <button
          onClick={jumpToEnd}
          className="px-4 py-1 rounded-lg bg-[#1c2a45] border border-slate-700 shadow hover:bg-[#243452]"
        >
          Jump
        </button>

        <button
          onClick={reconstructPath}
          className="px-4 py-1 rounded-lg bg-amber-300 text-black font-semibold shadow hover:bg-amber-200"
        >
          LCS
        </button>

        <div className="flex items-center gap-2 ml-auto">
          <label className="text-xs text-slate-400">Speed</label>
          <input
            type="range"
            min={200}
            max={2000}
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="h-2 accent-sky-400"
          />
          <button
            onClick={resetAll}
            className="px-3 py-1 rounded-lg border border-slate-700 hover:bg-[#1c2538] shadow"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Middle Area */}
      <div className="flex flex-grow overflow-hidden gap-2 px-2 py-2">
        {/* String Animation */}
        <div className="w-[40%] min-w-[260px] p-4 bg-[#0b1220] rounded-lg border border-slate-800 shadow-xl flex flex-col overflow-hidden justify-center">
          {renderStringsLeft()}
        </div>

        {/* DP Table */}
        <div className="flex-grow bg-[#0b1220] rounded-lg border border-slate-800 p-4 shadow-xl overflow-hidden flex items-center justify-center">
          <div className="overflow-auto max-h-full max-w-full border border-slate-700 rounded-lg shadow-md">
            {renderDPTable()}
          </div>
        </div>
      </div>

      {/* Explanation + Rules */}
      <div className="h-[175px] bg-[#0b1220] border-t border-slate-800 grid grid-cols-3 gap-4 p-3 shadow-inner">
  {/* Explanation */}
  <div className="col-span-2 bg-[#111d33] border border-slate-700 rounded-xl shadow-lg p-3 flex flex-col">
    <div className="text-lg font-bold text-sky-300 mb-1">Explanation</div>
    <div className="text-sm leading-relaxed overflow-y-auto flex-1 pr-2">
      {explanationLeft()}
    </div>
  </div>

  {/* Rules */}
  <div className="bg-[#111d33] border border-slate-700 rounded-xl shadow-lg p-3 flex flex-col">
    <div className="text-lg font-bold text-sky-300 mb-1">Rules</div>
    <div className="text-sm overflow-y-auto flex-1">
      {rulesPanel()}
    </div>
  </div>
</div>

    </div>
  );
}
