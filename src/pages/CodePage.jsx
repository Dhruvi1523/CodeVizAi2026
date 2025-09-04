// import React, { useState, useRef, useEffect } from "react";
// import Editor from "@monaco-editor/react";
// import mermaid from "mermaid";

// // --- SVG Icons ---
// const PlayIcon = (props) => (
//   <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
//     <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
//   </svg>
// );
// const PauseIcon = (props) => (
//   <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
//     <path d="M5.75 4.5a.75.75 0 00-.75.75v10.5a.75.75 0 001.5 0V5.25a.75.75 0 00-.75-.75zM14.25 4.5a.75.75 0 00-.75.75v10.5a.75.75 0 001.5 0V5.25a.75.75 0 00-.75-.75z" />
//   </svg>
// );
// const StopIcon = (props) => (
//   <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
//     <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
//   </svg>
// );
// const BackIcon = (props) => (
//   <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
//     <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L9.414 11H13a1 1 0 100-2H9.414l1.293-1.293z" clipRule="evenodd" />
//   </svg>
// );
// const NextIcon = (props) => (
//   <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
//     <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
//   </svg>
// );

// const defaultCode = `def fibonacci(n):
//     """Calculate the nth Fibonacci number recursively."""
//     if n <= 1:
//         return n
//     return fibonacci(n-1) + fibonacci(n-2)

// # Test the function
// for i in range(5):
//     print(f"fib({i}) = {fibonacci(i)}")
// `;

// const ValueRenderer = ({ value }) => {
//   let displayValue;
//   let color = "text-purple-400";
//   if (typeof value === 'object' && value !== null) {
//     displayValue = JSON.stringify(value);
//   } else if (typeof value === 'number') {
//     color = "text-green-400";
//     displayValue = String(value);
//   } else if (typeof value === 'boolean') {
//     color = "text-blue-400";
//     displayValue = String(value);
//   } else if (value === null || value === undefined) {
//     color = "text-gray-500";
//     displayValue = "None";
//   } else {
//     displayValue = `"${String(value)}"`;
//   }
//   return <span className={`bg-[#0d1117] p-1 rounded-sm ${color}`}>{displayValue}</span>;
// };

// const CodePage = () => {
//   const editorRef = useRef(null);
//   const monacoRef = useRef(null);
//   const [code, setCode] = useState(defaultCode);
//   const [trace, setTrace] = useState([]);
//   const [output, setOutput] = useState("");
//   const [currentStep, setCurrentStep] = useState(0);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [decorations, setDecorations] = useState([]);
//   const [error, setError] = useState("");
//   const [errorLine, setErrorLine] = useState(null);
//   const [activeTab, setActiveTab] = useState('Run');
//   const [executionStarted, setExecutionStarted] = useState(false);
//   const [mermaidCode, setMermaidCode] = useState("");
//   const [loadingFlowchart, setLoadingFlowchart] = useState(false);
//   const mermaidContainerRef = useRef(null);

//   const handleEditorDidMount = (editor, monaco) => {
//     editorRef.current = editor;
//     monacoRef.current = monaco;
//   };

//   const handleRun = async () => {
//     setTrace([]);
//     setError("");
//     setOutput("Running...");
//     setCurrentStep(0);
//     setErrorLine(null);
//     setActiveTab("Execution");
//     setExecutionStarted(true);
//     if (editorRef.current) {
//       setDecorations(editorRef.current.deltaDecorations(decorations, []));
//     }
//     try {
//       const response = await fetch("/trace", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ code, language: "python" }),
//       });
//       const data = await response.json();
//       const traceData = data.trace || [];
//       const errorEvent = traceData.find(e => e.event === 'exception');
//       if (data.error || errorEvent) {
//         setError(data.error || `${errorEvent.exception_type}: ${errorEvent.message}`);
//         setOutput(data.output || "");
//         if (errorEvent) setErrorLine(errorEvent.line);
//         setActiveTab('Run');
//       } else {
//         setTrace(traceData);
//         setOutput(data.output || "");
//         setCurrentStep(0);
//         setIsPlaying(false);
//       }
//     } catch (err) {
//       setError("Error: Could not connect to the backend server. Make sure the Flask server is running.");
//       setActiveTab('Run');
//     }
//   };

//   const handleFlowchart = async () => {
//     setActiveTab("Flowchart");
//     setLoadingFlowchart(true);
//     setMermaidCode("");
//     try {
//       const response = await fetch("/flowchart", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ code }),
//       });
//       const data = await response.json();
//       if (response.ok) {
//         setMermaidCode(data.mermaid_code);
//       } else {
//         setError(data.error || "Failed to generate flowchart.");
//         setMermaidCode("graph TD\nA[Error] --> B[Could not generate flowchart];");
//       }
//     } catch (err) {
//       setError("Error: Could not connect to the flowchart generator server. Make sure the Flask server is running.");
//       setMermaidCode("graph TD\nA[Network Error] --> B[Could not connect to server];");
//     } finally {
//       setLoadingFlowchart(false);
//     }
//   };

//   const handleReset = () => {
//     setCode(defaultCode);
//     setTrace([]);
//     setOutput("");
//     setError("");
//     setCurrentStep(0);
//     setIsPlaying(false);
//     setExecutionStarted(false);
//     setMermaidCode("");
//     setActiveTab("Run");
//     if (editorRef.current) {
//       setDecorations(editorRef.current.deltaDecorations(decorations, []));
//     }
//   };

//   const stepThrough = (direction) => {
//     setIsPlaying(false);
//     let step = currentStep;
//     if (direction === 'next') step = Math.min(step + 1, trace.length - 1);
//     else if (direction === 'prev') step = Math.max(step - 1, 0);
//     setCurrentStep(step);
//   };

//   const handleSliderChange = (e) => {
//     setIsPlaying(false);
//     setCurrentStep(Number(e.target.value));
//   };

//   useEffect(() => {
//     if (activeTab === 'Flowchart' && mermaidCode && mermaidContainerRef.current) {
//       mermaidContainerRef.current.innerHTML = "";
//       try {
//         mermaid.initialize({ startOnLoad: false, theme: 'dark' });
//         mermaid.render('mermaid-svg-graph', mermaidCode, (svgCode) => {
//           mermaidContainerRef.current.innerHTML = svgCode;
//         });
//       } catch (e) {
//         mermaidContainerRef.current.innerHTML = "Error rendering flowchart.";
//       }
//     }
//   }, [activeTab, mermaidCode]);

//   useEffect(() => {
//     const isFinished = currentStep >= trace.length - 1;
//     if (isFinished && trace.length > 0) {
//       setIsPlaying(false);
//     }
//     const currentEvent = trace[currentStep];
//     if (editorRef.current && monacoRef.current) {
//       let newDecorations = [];
//       if (currentEvent?.line) {
//         editorRef.current.revealLineInCenter(currentEvent.line, 0);
//         newDecorations.push({
//           range: new monacoRef.current.Range(currentEvent.line, 1, currentEvent.line, 1),
//           options: { className: 'bg-blue-900 bg-opacity-70', isWholeLine: true }
//         });
//       }
//       if (errorLine) {
//         newDecorations.push({
//           range: new monacoRef.current.Range(errorLine, 1, errorLine, 1),
//           options: { className: 'bg-red-900 bg-opacity-70', isWholeLine: true }
//         });
//       }
//       setDecorations(editorRef.current.deltaDecorations(decorations, newDecorations));
//     }
//     if (isPlaying && !isFinished) {
//       const timer = setTimeout(() => setCurrentStep(prev => prev + 1), 700);
//       return () => clearTimeout(timer);
//     }
//   }, [currentStep, isPlaying, trace, errorLine]);

//   const currentTraceEvent = trace[currentStep];
//   const isFinished = currentStep >= trace.length - 1 && trace.length > 0;
//   const userCallStack = (currentTraceEvent?.call_stack || []);
//   const currentLocals = currentTraceEvent?.locals || {};

//   return (
//     <div className="h-screen bg-[#0d1117] text-gray-300 font-sans flex flex-col">
//       <header className="flex-shrink-0 flex items-center bg-[#161b22] p-2 border-b border-gray-700 gap-4">
//         <button
//           onClick={handleRun}
//           className="flex items-center px-4 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
//         >
//           <PlayIcon className="h-5 w-5 mr-1" /> Run
//         </button>
//         <button
//           onClick={handleFlowchart}
//           className="px-3 py-1.5 text-sm hover:bg-gray-700 rounded-md"
//         >
//           Generate Flowchart
//         </button>
//         <button
//           onClick={handleReset}
//           className="px-3 py-1.5 text-sm hover:bg-gray-700 rounded-md"
//         >
//           Reset
//         </button>
//       </header>

//       <main className="flex-grow flex flex-col gap-4 p-4 overflow-hidden">
//         <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-4 h-[70%]">
//           <div className="bg-[#161b22] rounded-lg border border-gray-700 overflow-hidden">
//             <Editor
//               height="100%"
//               theme="vs-dark"
//               defaultLanguage="python"
//               value={code}
//               onChange={(v) => setCode(v || "")}
//               onMount={handleEditorDidMount}
//               options={{ glyphMargin: true, automaticLayout: true, minimap: { enabled: false } }}
//             />
//           </div>
//           <div className="bg-[#161b22] rounded-lg border border-gray-700 flex flex-col">
//             <div className="flex border-b border-gray-700">
//               {["Run", "Execution", "Flowchart"].map(tab => (
//                 <button
//                   key={tab}
//                   onClick={() => setActiveTab(tab)}
//                   className={`px-4 py-2 text-sm ${activeTab === tab ? 'bg-[#2d3748] text-white' : 'text-gray-400 hover:bg-gray-700'}`}
//                 >
//                   {tab}
//                 </button>
//               ))}
//             </div>
//             <div className="p-4 flex-grow overflow-auto">
//               {activeTab === 'Run' && (
//                 <pre className="text-sm whitespace-pre-wrap font-mono h-full overflow-auto">
//                   {error || output}
//                 </pre>
//               )}
//               {activeTab === 'Execution' && (
//                 executionStarted ? (
//                   trace.length > 0 ? (
//                     <div className="flex flex-col h-full gap-4">
//                       <p className="text-center text-sm">
//                         Executing line: <span className="font-bold text-yellow-400">{currentTraceEvent?.line}</span>
//                       </p>
//                       <div className="flex-grow space-y-3 overflow-auto">
//                         <div>
//                           <h4 className="font-semibold text-gray-400">Call Stack</h4>
//                           <div className="mt-2 space-y-1">
//                             {userCallStack.map((func, index) => (
//                               <div key={index} className="text-sm font-mono p-1 bg-[#2d3748] rounded">{func}</div>
//                             ))}
//                             {userCallStack.length === 0 &&
//                               <div className="text-sm font-mono p-1 bg-[#2d3748] rounded">Global Scope</div>}
//                           </div>
//                         </div>
//                         <div>
//                           <h4 className="font-semibold text-gray-400">Local Variables</h4>
//                           <div className="mt-2 space-y-1 text-sm font-mono">
//                             {Object.entries(currentLocals).map(([key, value]) => (
//                               <div key={key}>
//                                 <span>{key}</span>
//                                 <span className="mx-2 text-gray-500">=</span>
//                                 <ValueRenderer value={value} />
//                               </div>
//                             ))}
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   ) : (
//                     <p className="text-gray-400">{output}</p>
//                   )
//                 ) : (
//                   <p className="text-gray-400">{error || "Click 'Run' to begin visualization."}</p>
//                 )
//               )}
//               {activeTab === 'Flowchart' && (
//                 <div className="p-4 bg-[#0d1117] rounded-md h-full w-full flex items-center justify-center overflow-auto">
//                   {loadingFlowchart ? (
//                     <p className="text-gray-400">Generating flowchart...</p>
//                   ) : (
//                     mermaidCode ? (
//                       <div ref={mermaidContainerRef} id="mermaid-chart-container" className="w-full h-full"></div>
//                     ) : (
//                       <p className="text-gray-400">Click 'Generate Flowchart' to create a visual representation of your code.</p>
//                     )
//                   )}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//         {executionStarted && trace.length > 0 && (
//           <div className="flex-shrink-0 p-3 bg-[#161b22] rounded-md border border-gray-700">
//             <div className="flex items-center justify-center gap-4 my-2">
//               <button
//                 onClick={() => stepThrough('prev')}
//                 disabled={!trace.length || currentStep === 0}
//                 className="p-2 rounded-full bg-gray-600 hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 <BackIcon className="h-5 w-5" />
//               </button>
//               <button
//                 onClick={() => setIsPlaying(!isPlaying)}
//                 disabled={!trace.length || isFinished}
//                 className="p-2 rounded-full bg-gray-600 hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 {isPlaying ? <PauseIcon className="h-6 w-6" /> : <PlayIcon className="h-6 w-6" />}
//               </button>
//               <button
//                 onClick={() => stepThrough('next')}
//                 disabled={!trace.length || isFinished}
//                 className="p-2 rounded-full bg-gray-600 hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 <NextIcon className="h-5 w-5" />
//               </button>
//             </div>
//             <input
//               type="range"
//               min="0"
//               max={trace.length > 0 ? trace.length - 1 : 0}
//               value={currentStep}
//               onChange={handleSliderChange}
//               disabled={!trace.length}
//               className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
//             />
//             <div className="text-center text-xs text-gray-400 mt-2">
//               Step {trace.length > 0 ? currentStep + 1 : 0} of {trace.length}
//             </div>
//           </div>
//         )}
//       </main>
//     </div>
//   );
// };

// export default CodePage;






import React, { useState, useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";
import mermaid from "mermaid";

const CodePage = () => {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const [code, setCode] = useState(
    `def fib(n):
    if n <= 1:
        return n
    return fib(n-1) + fib(n-2)

print(fib(5))`
  );
  const [trace, setTrace] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [mermaidCode, setMermaidCode] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const mermaidContainerRef = useRef(null);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
  };

  // Highlight the current line in Monaco
  useEffect(() => {
    if (!editorRef.current || !monacoRef.current) return;

    const decorations = editorRef.current.deltaDecorations([], []);
    const currentTraceStep = trace[currentStep];

    if (currentTraceStep) {
      const { line, error } = currentTraceStep;
      if (line) {
        editorRef.current.revealLineInCenter(line);
        const className = error ? 'highlight-error' : 'highlight-line';
        const newDecorations = [
          {
            range: new monacoRef.current.Range(line, 1, line, 1),
            options: { isWholeLine: true, className: className },
          },
        ];
        editorRef.current.deltaDecorations(decorations, newDecorations);
      }
    }
  }, [currentStep, trace, editorRef, monacoRef]);

  // Render Mermaid flowchart
  useEffect(() => {
    if (mermaidCode && mermaidContainerRef.current) {
      mermaidContainerRef.current.innerHTML = "";
      mermaid.initialize({ startOnLoad: false, theme: 'dark' });
      mermaid.render("flowchartDiv", mermaidCode).then(({ svg }) => {
        mermaidContainerRef.current.innerHTML = svg;
      }).catch(err => {
        console.error("Mermaid render error:", err);
        mermaidContainerRef.current.innerHTML = "Error rendering flowchart.";
      });
    }
  }, [mermaidCode]);

  const handleRun = async () => {
    setTrace([]);
    setOutput("");
    setError("");
    setCurrentStep(0);

    try {
      const res = await fetch("http://127.0.0.1:8000/trace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code || "" }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `HTTP Error: ${res.status}`);
      }

      const data = await res.json();
      setTrace(data.trace || []);
      setOutput(data.output || "");
      if (data.trace.some(step => step.error)) {
        setError(data.trace.find(step => step.error).error);
      }
    } catch (err) {
      setError(`Failed to fetch trace: ${err.message}. Is the backend server running?`);
      console.error("Error in handleRun:", err);
    }
  };

  const handleFlowchart = async () => {
    setMermaidCode("");
    try {
      const res = await fetch("http://127.0.0.1:8000/flowchart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code || "" }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `HTTP Error: ${res.status}`);
      }

      const data = await res.json();
      setMermaidCode(data.mermaid || "");
    } catch (err) {
      setError(`Failed to fetch flowchart: ${err.message}. Is the backend server running?`);
      console.error("Error fetching flowchart:", err);
    }
  };

  const currentTraceStep = trace[currentStep] || {};

  return (
    <div className="flex h-screen">
      {/* Code editor */}
      <div className="w-1/2 p-4">
        <Editor
          height="90vh"
          theme="vs-dark"
          defaultLanguage="python"
          value={code}
          onMount={handleEditorDidMount}
          onChange={(val) => setCode(val || "")}
        />
        <div className="flex gap-2 mt-2">
          <button
            onClick={handleRun}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Run
          </button>
          <button
            onClick={handleFlowchart}
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            Flowchart
          </button>
        </div>
      </div>

      {/* Visualization */}
      <div className="w-1/2 p-4 overflow-auto">
        <h2 className="font-bold mb-2">Execution Trace</h2>
        {error && <pre className="text-red-500">{error}</pre>}
        {!error && trace.length === 0 && <p>Click Run to see the trace.</p>}
        {!error && trace.length > 0 && (
          <>
            <div className="p-2 border rounded">
              <p>Current Line: {currentTraceStep.line || "N/A"}</p>
              <p>Locals:</p>
              <pre>{JSON.stringify(currentTraceStep.locals, null, 2)}</pre>
            </div>
            <div className="flex gap-2 mt-4">
              <button 
                onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
                disabled={currentStep === 0}
                className="px-4 py-2 bg-gray-500 text-white rounded disabled:opacity-50"
              >
                Prev
              </button>
              <button
                onClick={() => setCurrentStep((s) => Math.min(trace.length - 1, s + 1))}
                disabled={currentStep >= trace.length - 1}
                className="px-4 py-2 bg-gray-500 text-white rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <h3 className="font-bold mt-4">Output</h3>
            <pre>{output}</pre>
          </>
        )}

        <h2 className="font-bold mt-6 mb-2">Flowchart</h2>
        <div id="flowchart" ref={mermaidContainerRef} className="bg-white p-4 rounded"></div>
      </div>
    </div>
  );
};

export default CodePage;