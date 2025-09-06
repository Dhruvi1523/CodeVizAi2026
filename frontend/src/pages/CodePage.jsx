// src/pages/CodePage.jsx

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import Navbar from "../components/Navbar";
import TraceLayout from "../components/TraceLayout";
import EditorPanel from "../components/EditorPanel";

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
  const [mermaidCode, setMermaidCode] = useState("");
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


  // useEffect(() => {
  //   if (window.mermaid) {
  //       window.mermaid.initialize({ startOnLoad: false, theme: 'dark', securityLevel: 'loose' });
  //       return;
  //   }
  //   const script = document.createElement('script');
  //   script.src = 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js';
  //   script.onload = () => {
  //     if (window.mermaid) {
  //       window.mermaid.initialize({ startOnLoad: false, theme: 'dark', securityLevel: 'loose' });
  //     }
  //   };
  //   document.body.appendChild(script);
  //   return () => {
  //     if (document.body.contains(script)) {
  //       document.body.removeChild(script);
  //     }
  //   };
  // }, []);

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
    try {
      const res = await fetch("http://127.0.0.1:8000/trace", {
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
    } catch (err) {
      setError(
        `Failed to fetch trace: ${err.message}. Is the backend server running?`
      );
    } finally {
      setIsLoading(false);
    }
  };

  // const handleFlowchart = useCallback(async () => {
  //   setIsLoading(true);
  //   setMermaidCode("");
  //   setError("");
  //   try {
  //     const res = await fetch("http://127.0.0.1:8000/flowchart", {
  //       method: "POST", headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ code: code || "" }),
  //     });
  //       if (!res.ok) {
  //       const data = await res.json();
  //       throw new Error(data.detail || `HTTP Error: ${res.status}`);
  //     }
  //     const data = await res.json();
  //     setMermaidCode(data.mermaid || "");
  //     setActiveTab("flowchart");
  //   } catch (err) {   setError(`Failed to fetch flowchart: ${err.message}.`);
  //   } finally {
  //       setIsLoading(false);
  //   }
  // }, [code]);

  useEffect(() => {
    let interval;
    if (isPlaying && currentStep < trace.length - 1) {
      interval = setInterval(
        () => setCurrentStep((prev) => prev + 1),
        1600 - speed
      );
    } else if (currentStep === trace.length - 1 && trace.length > 0) {
      setIsPlaying(false);
      if (output) {
        setTimeout(() => {
          setFinalOutputToShow(output);
        }, 1000);
      }
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentStep, trace.length, speed, output]);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || !monacoRef.current) return;

    const currentLine = trace[currentStep]?.line;
    const isError = !!trace[currentStep]?.error;

    // The key is to create a new array of decorations for the current line
    const newDecorations = currentLine
      ? [
          {
            range: new monacoRef.current.Range(currentLine, 1, currentLine, 1),
            options: {
              isWholeLine: true,
              // Apply the correct CSS class
              className: isError ? "highlight-error" : "highlight-line",
            },
          },
        ]
      : [];

    // Use deltaDecorations to replace the old decorations with the new ones.
    // It returns the new IDs, which we store in our ref.
    decorationIds.current = editor.deltaDecorations(
      decorationIds.current,
      newDecorations
    );

    // Ensure the highlighted line is visible
    if (currentLine) {
      editor.revealLineInCenter(currentLine);
    }
  }, [currentStep, trace]);

  // useEffect(() => {
  //   if (window.mermaid) {
  //       window.mermaid.initialize({ startOnLoad: false, theme: 'dark', securityLevel: 'loose' });
  //   }
  //   if (mermaidCode && activeTab === "flowchart" && mermaidContainerRef.current) {
  //       mermaidContainerRef.current.innerHTML = "";
  //       window.mermaid.render('mermaid-svg-1', mermaidCode).then(({ svg }) => {
  //           mermaidContainerRef.current.innerHTML = svg;
  //       });
  //   }
  // }, [mermaidCode, activeTab]);

  // useEffect(() => {
  //   if (activeTab !== 'flowchart' || !mermaidCode || !trace.length) return;
  //   const svg = mermaidContainerRef.current?.querySelector('svg');
  //   if (!svg) return;
  //   svg.querySelectorAll('.node, .edge-path').forEach(el => {
  //     el.style.stroke = '';
  //     el.style.strokeWidth = '';
  //     el.style.fillOpacity = '1';
  //   });
  //   const allNodes = svg.querySelectorAll('.node');
  //   allNodes.forEach(node => node.style.fillOpacity = '0.5');
  //   const currentLine = trace[currentStep]?.line;
  //   if (currentLine) {
  //       const activeNode = svg.querySelector(`[id$="_L${currentLine}"]`);
  //       if (activeNode) {
  //           activeNode.style.stroke = '#2dd4bf';
  //           activeNode.style.strokeWidth = '3px';
  //           activeNode.style.fillOpacity = '1';
  //       }
  //   }
  // }, [currentStep, trace, activeTab, mermaidCode]);

  useEffect(() => {
    const currentEvent = trace[currentStep]?.event;
    const prevEvent = trace[currentStep - 1]?.event;

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
    }
  }, [currentStep, trace]);

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


  return (
    <div className="flex flex-col h-screen bg-[#0f172a] text-[#f1f5f9] font-sans ">
      <Navbar />

      <div className="flex flex-col flex-grow  gap-2 min-h-0">
        <div className="flex-grow min-h-0">
          <PanelGroup direction="horizontal" className="h-full">
            {/* --- Left Panel: Code Editor --- */}
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

            {/* --- Right Panel: Visualization & State Inspector --- */}
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
                    {/* <button onClick={() => setActiveTab('flowchart')} className={`px-4 py-2 font-semibold transition-colors ${activeTab === 'flowchart' ? 'border-b-2 border-blue-500 text-white' : 'text-gray-400'}`}>Flowchart</button> */}
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
                            callTree={callTree}
                            // onFlowchart={handleFlowchart}
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
                              setCurrentStep(0); /* ... other resets */
                            }}
                            onSpeedChange={setSpeed}
                            speed={speed}
                            isLoading={isLoading}
                          />
                        )}
                        {/* {activeTab === "flowchart" && (
                          <div
                            ref={mermaidContainerRef}
                            className="p-4 rounded bg-gray-900 min-h-full flex items-center justify-center overflow-auto"
                          >
                            {!mermaidCode && !isLoading && (
                              <p className="text-gray-500">
                                Click "Generate Flowchart" to see the diagram.
                              </p>
                            )}{" "}
                            {isLoading && (
                              <p className="text-gray-400">Generating...</p>
                            )}
                          </div>
                        )} */}
                        {activeTab === "output" && (
                          <pre className="bg-gray-900 p-4 rounded-lg whitespace-pre-wrap h-full">
                            {output || "No output produced."}
                          </pre>
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
    </div>
  );
};

export default CodePage;
