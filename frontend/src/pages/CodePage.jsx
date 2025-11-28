// src/pages/CodePage.jsx

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import Navbar from "../components/Navbar";
import TraceLayout from "../components/TraceLayout";
import EditorPanel from "../components/EditorPanel";
import ComplexityTab from "../components/ComplexityTab";
import { AlertTriangle, X, ClipboardCopy } from "lucide-react";
import Explanation from "../components/ExplanationTab";

const CodePage = () => {
  const [code, setCode] = useState(
    `# Factorial using recursion
def factorial(n):
    if n == 0 or n == 1:  # base case
        return 1
    else:
        return n * factorial(n - 1)

# Example usage
num = 5
print("Factorial of", num, "is:", factorial(num))
`
  );

  const [trace, setTrace] = useState([]);
  const [callTree, setCallTree] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(500);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("trace");
  // const [mermaidCode, setMermaidCode] = useState("");
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lineTrails, setLineTrails] = useState([]);
  const variableRefs = useRef(new Map());
  const visualizerContainerRef = useRef(null);
  const [dataPackets, setDataPackets] = useState([]);
  const [loopArrow, setLoopArrow] = useState(null);
  const mermaidContainerRef = useRef(null);
  const [finalOutputToShow, setFinalOutputToShow] = useState(null);
  const decorationIds = useRef([]);
  const [runtimeError, setRuntimeError] = useState(null);
  const [callBridge, setCallBridge] = useState(null);
  const callStackFrameRefs = useRef(new Map());
  const [hoveredVariable, setHoveredVariable] = useState(null);
  const variableHighlightIds = useRef([]);
  const [fullExplanation, setFullExplanation] = useState(null);
  const [isExplaining, setIsExplaining] = useState(false);

  const handleRun = async () => {
    setIsLoading(true);
    setError("");
    setTrace([]);
    setOutput("");
    setCallTree(null);
    setCurrentStep(0);
    setIsPlaying(false);
    setActiveTab("trace");
    setLineTrails([]);
    setLoopArrow(null);
    setFinalOutputToShow(null);
    setRuntimeError(null);
    callStackFrameRefs.current.clear();
    setFullExplanation(null);
    try {
      const res = await fetch("https://codevizai2026.onrender.com/trace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code || "" }),
      });
      if (!res.ok) {
        const data = await res
          .json()
          .catch(() => ({ detail: "An unknown error occurred" }));
        throw new Error(data.detail || `HTTP Error: ${res.status}`);
      }
      const data = await res.json();
      setTrace(data.trace || []);
      setOutput(data.output || "");
      setCallTree(data.call_tree || null);

      if (data.trace && data.trace.length > 0) {
        setCurrentStep(0);
      }
    } catch (err) {
      setError(
        `Failed to fetch trace: ${err.message}. Is the backend server running?`
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handler functions for variable hover ---
  const handleVariableHover = (variableName) => {
    setHoveredVariable(variableName);
  };
  const handleVariableLeave = () => {
    setHoveredVariable(null);
  };

  const fetchFullExplanation = useCallback(async () => {
    if (fullExplanation || isExplaining) return; // Don't fetch if already have it or loading

    setIsExplaining(true);
    try {
      const res = await fetch("https://codevizai2026.onrender.com/ai/explain_full", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code }),
      });

      console.log(res)
      if (!res.ok) throw new Error("Failed to fetch AI explanation");

      const data = await res.json();
      if (data.full_explanation) {
        setFullExplanation(data.full_explanation);
      } else {
        setFullExplanation("⚠️ No explanation returned from API.");
      }
    } catch (e) {
      setFullExplanation(
        `❌ Error: ${e.message}. Ensure backend is running and API Key is set.`
      );
    } finally {
      setIsExplaining(false);
    }
  }, [code, fullExplanation, isExplaining]);

  useEffect(() => {
    if (activeTab === "explain" && !fullExplanation) {
      fetchFullExplanation();
    }
  }, [activeTab, fullExplanation, fetchFullExplanation]);

  useEffect(() => {
    const isReturnStep = trace[currentStep]?.event?.type === "return_value";
    const calculatedDelay = isPlaying
      ? isReturnStep
        ? 1500
        : 2100 - speed
      : null;

    let interval;
    if (isPlaying && currentStep < trace.length - 1 && calculatedDelay) {
      interval = setInterval(
        () => setCurrentStep((prev) => prev + 1),
        calculatedDelay
      );
    } else if (currentStep === trace.length - 1 && trace.length > 0) {
      setIsPlaying(false);
      if (output && !runtimeError) {
        setTimeout(() => {
          setFinalOutputToShow(output);
        }, 1000);
      }
    }
    return () => clearInterval(interval);
  }, [
    isPlaying,
    currentStep,
    trace.length,
    speed,
    output,
    runtimeError,
    trace,
  ]);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || !monacoRef.current || trace.length === 0) return;

    const currentEvent = trace[currentStep]?.event;
    const prevEvent = trace[currentStep - 1]?.event;
    const currentStepData = trace[currentStep];
    const currentLine = currentStepData?.line;
    const isError = currentEvent?.type === "error";

    // --- Logic for Editor Line Highlighting ---
    const newDecorations = currentLine
      ? [
          {
            range: new monacoRef.current.Range(currentLine, 1, currentLine, 1),
            options: {
              isWholeLine: true,
              className: isError ? "highlight-error" : "highlight-line",
            },
          },
        ]
      : [];
    decorationIds.current = editor.deltaDecorations(
      decorationIds.current,
      newDecorations
    );
    if (currentLine) {
      editor.revealLineInCenter(currentLine);
    }
    if (editor && monacoRef.current && activeTab === "trace") {
      editor.layout();
    }
    // --- Logic for Runtime Errors ---
    if (isError) {
      setIsPlaying(false);
      setRuntimeError(currentEvent);
    }

    //  Logic for the Call Bridge Animation ---
    if (currentEvent?.type === "call") {
      const editorContainer = editor.getDomNode();
      if (!editorContainer) return;

      const sourceLine = currentStepData.line;
      const editorRect = editorContainer.getBoundingClientRect();
      const startTop = editor.getTopForLineNumber(sourceLine);
      const lineHeight = editor.getOption(
        monacoRef.current.editor.EditorOption.lineHeight
      );

      const nextStepStack = trace[currentStep + 1]?.stack;
      if (nextStepStack?.length > 0) {
        const newFrameName = nextStepStack[nextStepStack.length - 1];
        const newFrameKey = `${newFrameName}-${nextStepStack.length}`;
        const targetElement = callStackFrameRefs.current.get(newFrameKey);

        if (targetElement) {
          const endRect = targetElement.getBoundingClientRect();

          // LOGIC FOR ARGUMENT PASSING ANIMATION ---
          const newPackets = [];
          // Loop through the arguments provided by the backend 'call' event
          for (const [argName, argValue] of Object.entries(
            currentEvent.arguments
          )) {
            newPackets.push({
              id: `arg-${argName}-${currentStep}`,
              value: String(argValue.value), // Get the primitive value
              // Start from the middle of the calling line in the editor
              from: {
                x: editorRect.left + editorRect.width / 2,
                y: editorRect.top + startTop + lineHeight / 2,
              },
              // End at the top of the new stack frame
              to: {
                x: endRect.left + endRect.width / 2,
                y: endRect.top + 20, // Small offset from the top
              },
            });
          }
          // Set the state to trigger the animation
          setDataPackets(newPackets);
          // --- END OF NEW LOGIC ---

          // --- Existing Call Bridge Logic ---
          const startPosition = {
            top: editorRect.top + startTop,
            left: editorRect.left + 20,
            width: editorRect.width - 40,
            height: lineHeight,
          };
          setCallBridge({ start: startPosition, end: endRect });
          setTimeout(() => setCallBridge(null), 800);
        }
      }
    }

    if (!editorRef.current) return;
    const editorContainer = editorRef.current.getDomNode();
    if (!editorContainer) return;
    const editorRect = editorContainer.getBoundingClientRect();

    if (currentEvent?.type === "loop_iteration" && prevEvent?.line) {
      const startLine = currentEvent.start_line;
      const startTop = editorRef.current.getTopForLineNumber(startLine);
      const endLine = prevEvent.line;
      const endTop = editorRef.current.getTopForLineNumber(endLine);
      const height = editorRef.current.getOption(
        monacoRef.current.editor.EditorOption.lineHeight
      );

      if (editorRect) {
        const startY = editorRect.top + startTop + height / 2;
        const endY = editorRect.top + endTop + height / 2;
        setLoopArrow({
          id: `${currentStep}-loop`,
          from: { y: endY, x: editorRect.left + 5 },
          to: { y: startY, x: editorRect.left + 5 },
        });
      }
    } else {
      setLoopArrow(null);
    }

    if (
      currentEvent &&
      typeof currentEvent === "object" &&
      currentEvent.type === "error"
    ) {
      setIsPlaying(false); // Stop playback immediately
      setRuntimeError(currentEvent); // Set the error state to show a modal
    }

    if (
      currentEvent &&
      typeof currentEvent === "object" &&
      currentEvent.type === "binary_operation"
    ) {
      const newPackets = [];
      const vizRect = visualizerContainerRef.current?.getBoundingClientRect();
      if (!vizRect) return;

      setTimeout(() => {
        for (const varName of Object.keys(currentEvent.operands)) {
          const varEl = variableRefs.current.get(varName);
          if (varEl) {
            const startRect = varEl.getBoundingClientRect();
            newPackets.push({
              id: `${currentStep}-${varName}`,
              value: String(currentEvent.operands[varName]),
              from: {
                x: startRect.left + startRect.width / 2,
                y: startRect.top + startRect.height / 2,
              },
              to: { x: vizRect.left + vizRect.width / 2, y: vizRect.top + 60 },
            });
          }
        }
        setDataPackets(newPackets);
      }, 50);
    }

    if (
      prevEvent &&
      typeof prevEvent === "object" &&
      prevEvent.type === "binary_operation"
    ) {
      const resultVarName = prevEvent.result_variable;
      const resultVarEl = variableRefs.current.get(resultVarName);
      const vizRect = visualizerContainerRef.current?.getBoundingClientRect();

      if (resultVarEl && vizRect) {
        const endRect = resultVarEl.getBoundingClientRect();
        const resultPacket = {
          id: `${currentStep}-result`,
          value: String(prevEvent.result_value),
          from: { x: vizRect.left + vizRect.width / 2, y: vizRect.top + 120 },
          to: {
            x: endRect.left + endRect.width / 2,
            y: endRect.top + endRect.height / 2,
          },
        };
        setTimeout(() => setDataPackets([resultPacket]), 100);
      }

      if (
        currentEvent &&
        typeof currentEvent === "object" &&
        currentEvent.type === "return_value"
      ) {
        const editor = editorRef.current;
        const editorContainer = editor?.getDomNode();
        if (!editorContainer) return;

        // 1. Get START position: The stack frame that is returning.
        // The returning frame is the last one on the *current* step's stack.
        const stack = currentStepData.stack;
        if (stack && stack.length > 0) {
          const returningFrameName = stack[stack.length - 1];
          const frameKey = `${returningFrameName}-${stack.length}`;
          const startElement = callStackFrameRefs.current.get(frameKey);

          if (startElement) {
            const startRect = startElement.getBoundingClientRect();

            // 2. Get END position: The line of code in the parent that will use the value.
            // The backend conveniently provides the caller's line number in the *next* step.
            const nextStepData = trace[currentStep + 1];
            if (nextStepData) {
              const targetLine = nextStepData.line;
              const editorRect = editorContainer.getBoundingClientRect();
              const top = editor.getTopForLineNumber(targetLine);
              const lineHeight = editor.getOption(
                monacoRef.current.editor.EditorOption.lineHeight
              );

              // 3. Set the data packet state to trigger the animation
              const returnValuePacket = {
                id: `return-${currentStep}`,
                value: String(currentEvent.value.value), // Assuming primitive value
                from: {
                  x: startRect.left + startRect.width / 2,
                  y: startRect.top + startRect.height / 2,
                },
                to: {
                  x: editorRect.left + 40, // Position it over the line number
                  y: editorRect.top + top + lineHeight / 2,
                },
                type: "return_value",
              };
              setDataPackets([returnValuePacket]);
            }
          }
        }
      }
    }
  }, [currentStep, trace, activeTab]);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || !monacoRef.current) return;

    if (hoveredVariable) {
      const model = editor.getModel();
      if (!model) return;
      // Find all occurrences of the hovered variable name
      const matches = model.findMatches(
        hoveredVariable,
        true,
        false,
        true,
        null,
        true
      );

      const newDecorations = matches.map((match) => ({
        range: match.range,
        options: { className: "highlight-variable", stickiness: 1 },
      }));

      // Apply the decorations and store their IDs
      variableHighlightIds.current = editor.deltaDecorations(
        variableHighlightIds.current,
        newDecorations
      );
    } else {
      // If nothing is hovered, clear the decorations
      variableHighlightIds.current = editor.deltaDecorations(
        variableHighlightIds.current,
        []
      );
    }
  }, [hoveredVariable]);

  const prevTraceStep = trace[currentStep - 1];
  const currentTraceStep = trace[currentStep];
  let sourceLinePosition = null;

  if (currentTraceStep && editorRef.current && monacoRef.current) {
    const isNewFrame =
      currentTraceStep.stack.length > (prevTraceStep?.stack.length || 0);
    if (isNewFrame && prevTraceStep?.line) {
      const editorContainer = editorRef.current.getDomNode();
      if (editorContainer) {
        const editorRect = editorContainer.getBoundingClientRect();
        const top = editorRef.current.getTopForLineNumber(prevTraceStep.line);
        sourceLinePosition = {
          x: editorRect.left + 40,
          y: editorRect.top + top,
        };
      }
    }
  }

  const handleCopyExplanation = () => {
    if (!fullExplanation) return;
    navigator.clipboard.writeText(fullExplanation);
    alert("Explanation copied!");
  };

  return (
    <div className="flex flex-col h-screen bg-[#0f172a] text-[#f1f5f9] font-sans ">
      <Navbar />

      <div className="flex flex-col flex-grow gap-2 min-h-0">
        <div className="flex-grow min-h-0">
          <PanelGroup direction="horizontal" className="h-full">
            <Panel defaultSize={50} minSize={25}>
              <EditorPanel
                code={code}
                setCode={setCode}
                onRun={handleRun}
                // Pass other handlers like onFlowchart if needed
                isLoading={isLoading}
                editorRef={editorRef}
                monacoRef={monacoRef}
              />
            </Panel>

            <PanelResizeHandle className="w-2 bg-[#0f172a] hover:bg-[#6366f1]/50 transition-colors flex items-center justify-center">
              <div className="w-1 h-10 bg-[#334155] rounded-full"></div>
            </PanelResizeHandle>

            <Panel defaultSize={50} minSize={30}>
              <div className="h-full w-full flex flex-col gap-4 bg-[#1e293b]">
                <div className="flex-1 flex flex-col gap-2 min-h-0">
                  <div className="flex border-b border-gray-700">
                    <button
                      onClick={() => setActiveTab("trace")}
                      className={`px-4 py-2 font-semibold transition-colors ${
                        activeTab === "trace"
                          ? "border-b-2 border-blue-500 text-white"
                          : "text-gray-400"
                      }`}
                    >
                      Trace
                    </button>
                    <button
                      onClick={() => setActiveTab("output")}
                      className={`px-4 py-2 font-semibold transition-colors ${
                        activeTab === "output"
                          ? "border-b-2 border-blue-500 text-white"
                          : "text-gray-400"
                      }`}
                    >
                      Output
                    </button>
                    <button
                      onClick={() => setActiveTab("complexity")}
                      className={`px-4 py-2 font-semibold transition-colors ${
                        activeTab === "complexity"
                          ? "border-b-2 border-blue-500 text-white"
                          : "text-gray-400"
                      }`}
                    >
                      Complexity
                    </button>
                    <button
                      onClick={() => setActiveTab("explain")}
                      className={`px-4 py-2 font-semibold transition-colors ${
                        activeTab === "explain"
                          ? "border-b-2 border-green-500 text-white"
                          : "text-gray-400"
                      }`}
                    >
                      Explaination
                    </button>
                  </div>
                  <div className="flex-grow bg-[#1e293b] rounded-lg border border-[#334155] m-4 min-h-0 ">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="p-4 h-full"
                      >
                        {error && (
                          <div className="p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-300 whitespace-pre-wrap">
                            {error}
                          </div>
                        )}
                        {activeTab === "trace" && !error && (
                          <TraceLayout
                            trace={trace}
                            currentStep={currentStep}
                            setCurrentStep={setCurrentStep} // Pass setCurrentStep for the scrubber
                            callTree={callTree}
                            isPlaying={isPlaying}
                            onPlay={() => setIsPlaying(true)}
                            onPause={() => setIsPlaying(false)}
                            onNext={() =>
                              setCurrentStep((s) =>
                                Math.min(trace.length - 1, s + 1)
                              )
                            }
                            onPrev={() =>
                              setCurrentStep((s) => Math.max(0, s - 1))
                            }
                            onReset={() => {
                              setIsPlaying(false);
                              setCurrentStep(0);
                            }}
                            onSpeedChange={setSpeed}
                            speed={speed}
                            isLoading={isLoading}
                            // --- NEW: Pass the refs map down ---
                            callStackFrameRefs={callStackFrameRefs}
                            onVariableHover={handleVariableHover}
                            onVariableLeave={handleVariableLeave}
                          />
                        )}

                        {activeTab === "output" && (
                          <pre className="bg-gray-900 p-4 rounded-lg whitespace-pre-wrap h-full">
                            {output || "No output produced."}
                          </pre>
                        )}
                        {activeTab === "complexity" && (
                          <ComplexityTab code={code} />
                        )}
                        {activeTab === "explain" && (
                          <div className="h-full bg-slate-900/50 p-6 rounded-lg border border-slate-700 flex flex-col">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="text-xl font-bold text-green-400">
                                Full Code Analysis
                              </h3>
                              <button
                                onClick={handleCopyExplanation}
                                disabled={isExplaining || !fullExplanation}
                                className="text-slate-400 hover:text-green-400 disabled:opacity-50 transition-colors"
                                title="Copy Explanation"
                              >
                                <ClipboardCopy size={20} />
                              </button>
                            </div>

                            <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
                              {isExplaining ? (
                                <div className="flex flex-col items-center justify-center h-full text-indigo-400 animate-pulse">
                                  <p className="text-lg">
                                    🧠 Generating comprehensive analysis...
                                  </p>
                                  <p className="text-sm text-slate-500 mt-2">
                                    This may take a few seconds.
                                  </p>
                                </div>
                              ) : (
                                <Explanation
                                  fullExplanation={fullExplanation}
                                />
                              )}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </Panel>
          </PanelGroup>
        </div>
      </div>

      <AnimatePresence>
        {finalOutputToShow && (
          <motion.div
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gray-800 rounded-xl p-8 border border-teal-500 shadow-2xl w-full max-w-lg"
              initial={{ scale: 0.5, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 250, damping: 20 }}
            >
              <h2 className="text-2xl font-bold text-teal-300 mb-4">
                Execution Complete!
              </h2>
              <h3 className="text-lg font-semibold text-gray-300 mb-2">
                Final Output:
              </h3>
              <pre className="bg-gray-900 p-4 rounded-lg whitespace-pre-wrap text-gray-200">
                {finalOutputToShow}
              </pre>
              <div className="flex justify-end mt-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFinalOutputToShow(null)}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold"
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence onExitComplete={() => setDataPackets([])}>
        {dataPackets.map((packet) => (
          <motion.div
            key={packet.id}
            className="fixed z-50 bg-yellow-400 text-black font-mono font-bold px-2.5 py-1 rounded-full text-sm shadow-lg pointer-events-none"
            initial={packet.from}
            animate={{
              ...packet.to,
              opacity: 0,
              scale: 0.5,
              transition: { duration: 0.9, ease: "easeInOut" },
            }}
            exit={{ opacity: 0 }}
          >
            {packet.value}
          </motion.div>
        ))}
      </AnimatePresence>

      <AnimatePresence>
        {runtimeError && (
          // --- MODIFIED: Backdrop with Blur Effect ---
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* --- MODIFIED: Modal with improved styling --- */}
            <motion.div
              className="relative bg-slate-800 border border-slate-700/50 rounded-xl shadow-2xl w-full max-w-lg"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <div className="p-8">
                {/* --- MODIFIED: Title with Icon --- */}
                <div className="flex items-center gap-4 mb-4">
                  <AlertTriangle size={32} className="text-red-500" />
                  <h2 className="text-2xl font-bold text-red-400">
                    Runtime Error
                  </h2>
                </div>

                {/* --- MODIFIED: More distinct styling for error message --- */}
                <div className="bg-slate-900/50 border border-slate-700 p-4 rounded-lg mt-4">
                  <p className="text-lg font-semibold text-slate-200">
                    {runtimeError.error_type}
                  </p>
                  <pre className="mt-2 whitespace-pre-wrap text-slate-300 font-mono text-sm">
                    {runtimeError.error_message}
                  </pre>
                </div>

                <p className="mt-4 text-sm text-slate-400">
                  Execution stopped at line {trace[currentStep]?.line}.
                </p>
              </div>

              {/* --- Option B: Styled Footer Button (uncomment to use) --- */}
              <div className="flex justify-end gap-4 p-4 bg-slate-900/50 rounded-b-xl border-t border-slate-700/50">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setRuntimeError(null)}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold"
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CodePage;
