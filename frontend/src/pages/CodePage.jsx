import React, { useState, useRef, useEffect, useCallback } from "react";
import Editor from "@monaco-editor/react";
import mermaid from "mermaid";
import { motion, AnimatePresence } from "framer-motion";

// --- Sub-component for the Smart Variables Table ---
const VariablesTable = ({ currentLocals = {}, prevLocals = {}, step }) => {
  const allKeys = new Set([...Object.keys(currentLocals), ...Object.keys(prevLocals)]);

  return (
    <table className="w-full text-sm font-mono border-collapse">
      <thead>
        <tr className="border-b-2 border-gray-600">
          <th className="p-2 text-left w-1/3 font-semibold">Variable</th>
          <th className="p-2 text-left font-semibold">Value</th>
        </tr>
      </thead>
      <tbody>
        {Array.from(allKeys).sort().map(key => {
          const currentValue = currentLocals[key];
          const prevValue = prevLocals[key];
          
          let highlightClass = "";
          if (currentValue !== prevValue) {
            highlightClass = prevValue === undefined ? 'highlight-added' : 'animate-pulse-modified';
          }

          return (
            <tr key={`${key}-${step}`} className={`border-b border-gray-700 ${highlightClass}`}>
              <td className="p-2 align-top text-gray-300">{key}</td>
              <td className="p-2 text-yellow-300 whitespace-pre-wrap break-all">{currentValue}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

// --- Sub-component for the Animated Call Stack ---
const CallStack = ({ stackFrames = [] }) => {
  return (
    <div className="flex flex-col-reverse h-full bg-gray-900/50 rounded-lg p-2 overflow-hidden">
      <AnimatePresence>
        {stackFrames.map((frame, index) => (
          <motion.div
            key={`${frame}-${index}-${stackFrames.length}`}
            layout
            initial={{ opacity: 0, y: 25, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: -30, scale: 0.9 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="bg-purple-800/50 border border-purple-600 rounded-md p-3 text-center font-mono font-semibold shadow-lg mt-2"
          >
            {frame}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// --- Main Page Component ---
const CodePage = () => {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const [code, setCode] = useState(
`def fib(n):
  if n <= 1:
    return n
  # Recursive call
  result = fib(n-1) + fib(n-2)
  return result

print(fib(5))`
  );
  
  const [trace, setTrace] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(500);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("trace");
  const [mermaidCode, setMermaidCode] = useState("");
  const mermaidContainerRef = useRef(null);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
  };
  
  const handleRun = async () => {
    setTrace([]);
    setOutput("");
    setError("");
    setCurrentStep(0);
    setIsPlaying(false);
    setActiveTab("trace");

    try {
      const res = await fetch("http://127.0.0.1:8000/trace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code || "" }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || `HTTP Error: ${res.status}`);
      
      setTrace(data.trace || []);
      setOutput(data.output || "");
    } catch (err) {
      setError(`Failed to fetch trace: ${err.message}. Is the backend server running?`);
    }
  };

  const handleFlowchart = useCallback(async () => {
    setMermaidCode("");
    try {
      const res = await fetch("http://127.0.0.1:8000/flowchart", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code || "" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || `HTTP Error: ${res.status}`);
      setMermaidCode(data.mermaid || "");
      setActiveTab("flowchart");
    } catch (err) {
      setError(`Failed to fetch flowchart: ${err.message}.`);
    }
  }, [code]);

  useEffect(() => {
    let interval;
    if (isPlaying && currentStep < trace.length - 1) {
      interval = setInterval(() => setCurrentStep(prev => prev + 1), 1100 - speed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentStep, trace.length, speed]);
  
  useEffect(() => {
    if (!editorRef.current || !monacoRef.current) return;
    const model = editorRef.current.getModel();
    if (!model) return;

    const decorations = model.getAllDecorations();
    const oldDecorations = decorations.filter(d => d.options.className?.startsWith('highlight-')).map(d => d.id);
    
    const currentTraceStep = trace[currentStep];
    let newDecorations = [];
    if (currentTraceStep?.line) {
      editorRef.current.revealLineInCenter(currentTraceStep.line);
      newDecorations.push({
        range: new monacoRef.current.Range(currentTraceStep.line, 1, currentTraceStep.line, 1),
        options: { isWholeLine: true, className: currentTraceStep.error ? 'highlight-error' : 'highlight-line' },
      });
    }
    editorRef.current.deltaDecorations(oldDecorations, newDecorations);
  }, [currentStep, trace]);

  useEffect(() => {
    if (mermaidCode && activeTab === "flowchart" && mermaidContainerRef.current) {
      mermaidContainerRef.current.innerHTML = "";
      mermaid.initialize({ startOnLoad: false, theme: 'dark', securityLevel: 'loose' });
      try {
        mermaid.render("flowchartDiv", mermaidCode).then(({ svg }) => {
          mermaidContainerRef.current.innerHTML = svg;
        });
      } catch (e) {
        console.error("Mermaid render error:", e)
        mermaidContainerRef.current.innerHTML = "Error rendering flowchart.";
      }
    }
  }, [mermaidCode, activeTab]);

  const currentTraceStep = trace[currentStep] || {};
  const prevTraceStep = trace[currentStep - 1] || {};

  return (
    <div className="flex h-screen bg-gray-900 text-gray-200 font-sans">
      {/* Left Panel: Code Editor & Main Controls */}
      <div className="w-1/2 flex flex-col p-4 gap-4">
        <div className="flex-grow border border-gray-700 rounded-lg overflow-hidden">
            <Editor
            height="100%" theme="vs-dark" defaultLanguage="python"
            value={code} onMount={handleEditorDidMount} onChange={(val) => setCode(val || "")}
            options={{ minimap: { enabled: false }, fontSize: 14, wordWrap: 'on' }}
            />
        </div>
        <div className="flex-shrink-0 flex gap-4 items-center">
          <button onClick={handleRun} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold">Run Code</button>
          <button onClick={handleFlowchart} className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold">Generate Flowchart</button>
        </div>
      </div>

      {/* Right Panel: Visualization (Split Vertically) */}
      <div className="w-1/2 flex flex-col p-4 gap-4">
        {/* Top half of the right panel */}
        <div className="flex-1 flex flex-col gap-2 min-h-0">
          <div className="flex border-b border-gray-700">
            <button onClick={() => setActiveTab('trace')} className={`px-4 py-2 font-semibold ${activeTab === 'trace' ? 'border-b-2 border-blue-500 text-white' : 'text-gray-400'}`}>Trace</button>
            <button onClick={() => setActiveTab('flowchart')} className={`px-4 py-2 font-semibold ${activeTab === 'flowchart' ? 'border-b-2 border-blue-500 text-white' : 'text-gray-400'}`}>Flowchart</button>
            <button onClick={() => setActiveTab('output')} className={`px-4 py-2 font-semibold ${activeTab === 'output' ? 'border-b-2 border-blue-500 text-white' : 'text-gray-400'}`}>Output</button>
          </div>
          <div className="flex-grow bg-gray-800 rounded-lg p-4 overflow-auto">
            {error && <div className="p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-300 whitespace-pre-wrap">{error}</div>}
            
            {activeTab === 'trace' && !error && (
              trace.length === 0 
              ? <p className="text-gray-500">Click "Run Code" to start tracing.</p>
              : <div className="flex flex-col gap-4 h-full">
                  <div className="flex items-center justify-center gap-4 p-2 bg-gray-900/50 rounded-lg">
                      <button onClick={() => { setIsPlaying(false); setCurrentStep(0); }} className="px-3 py-1 bg-gray-600 rounded">Reset</button>
                      <button onClick={() => setCurrentStep((s) => Math.max(0, s - 1))} disabled={currentStep === 0} className="px-3 py-1 bg-gray-600 rounded disabled:opacity-50">Prev</button>
                      <button onClick={() => setIsPlaying(!isPlaying)} className="px-4 py-2 bg-blue-600 rounded w-24">{isPlaying ? 'Pause' : 'Play'}</button>
                      <button onClick={() => setCurrentStep((s) => Math.min(trace.length - 1, s + 1))} disabled={currentStep >= trace.length - 1} className="px-3 py-1 bg-gray-600 rounded disabled:opacity-50">Next</button>
                      <div className="flex items-center gap-2"><label className="text-sm">Speed</label><input type="range" min="100" max="1000" value={speed} onChange={e => setSpeed(Number(e.target.value))} className="w-24" /></div>
                  </div>
                  <input type="range" min="0" max={trace.length-1} value={currentStep} onChange={e => setCurrentStep(Number(e.target.value))} className="w-full" />
                  <p className="text-sm text-center -mt-2">Step {currentStep + 1} / {trace.length} (Line: {currentTraceStep.line || 'N/A'})</p>
                  <div className="flex-grow overflow-auto"><VariablesTable step={currentStep} currentLocals={currentTraceStep.locals || {}} prevLocals={prevTraceStep.locals || {}} /></div>
                </div>
            )}
            {activeTab === 'flowchart' && ( <div ref={mermaidContainerRef} className="p-4 rounded bg-gray-900 min-h-full">{!mermaidCode && <p className="text-gray-500">Click "Generate Flowchart" to see the diagram.</p>}</div> )}
            {activeTab === 'output' && ( <div><h3 className="font-bold text-lg mb-2">Program Output</h3><pre className="bg-gray-900 p-4 rounded-lg whitespace-pre-wrap">{output || 'No output produced.'}</pre></div> )}
          </div>
        </div>

        {/* Bottom half of the right panel */}
        <div className="flex-1 flex flex-col gap-2 min-h-0">
            <h3 className="font-bold text-lg flex-shrink-0">Call Stack</h3>
            <div className="flex-grow overflow-hidden">
                <CallStack stackFrames={currentTraceStep.stack} />
            </div>
        </div>
      </div>
    </div>
  );
};

export default CodePage;