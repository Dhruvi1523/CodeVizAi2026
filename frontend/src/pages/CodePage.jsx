import React, { useState, useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";
import ReactFlow, { Background, Controls, MiniMap } from 'reactflow';
import 'reactflow/dist/style.css';


// --- SVG Icons ---
const PlayIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" /></svg>;
const PauseIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M5.75 4.5a.75.75 0 00-.75.75v10.5a.75.75 0 001.5 0V5.25a.75.75 0 00-.75-.75zM14.25 4.5a.75.75 0 00-.75.75v10.5a.75.75 0 001.5 0V5.25a.75.75 0 00-.75-.75z" /></svg>;

const defaultCode = `def fibonacci(n):
  """Calculate the nth Fibonacci number recursively."""
  if n <= 1:
    return n
  return fibonacci(n-1) + fibonacci(n-2)

# Test the function
for i in range(5):
  print(f"fib({i}) = {fibonacci(i)}")`;

// --- Helper to render variables nicely ---
const ValueRenderer = ({ value }) => {
    let displayValue = JSON.stringify(value);
    let color = "text-purple-400";

    if (typeof value === 'object' && value !== null) {
        displayValue = JSON.stringify(value);
    } else if (typeof value === 'number') {
        color = "text-green-400";
        displayValue = String(value);
    } else if (typeof value === 'boolean') {
        color = "text-blue-400";
        displayValue = String(value);
    } else if (value === null) {
        color = "text-gray-500";
        displayValue = "None";
    }

    return <span className={`bg-[#0d1117] p-1 rounded-sm ${color}`}>{displayValue}</span>;
};


// --- Main Component ---
const CodePage = () => {
    const editorRef = useRef(null);
    const monacoRef = useRef(null);
    const [code, setCode] = useState(defaultCode);
    const [trace, setTrace] = useState([]);
    const [output, setOutput] = useState("");
    const [currentStep, setCurrentStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [decorations, setDecorations] = useState([]);
    const [error, setError] = useState("");
    const [activeVizTab, setActiveVizTab] = useState('Frames');
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);


    const handleEditorDidMount = (editor, monaco) => {
        editorRef.current = editor;
        monacoRef.current = monaco;
    };

    const handleRun = async () => {
        setTrace([]);
        setError("");
        setOutput("");
        setNodes([]);
        setEdges([]);
        if (editorRef.current) {
            setDecorations(editorRef.current.deltaDecorations(decorations, []));
        }
        try {
            const response = await fetch("http://localhost:8000/trace", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code, language: "python" }),
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            if (data.error) {
                setError(data.error);
                setOutput(data.output || "Execution failed.");
            } else {
                const traceData = data.trace || [];
                const firstLineIndex = traceData.findIndex(event => event.event === 'line');
                setTrace(traceData);
                setOutput(data.output || "");
                setCurrentStep(firstLineIndex !== -1 ? firstLineIndex : 0);
                setIsPlaying(false);
            }
        } catch (err) {
            console.error("Failed to fetch trace:", err);
            setError("Error: Could not connect to the backend server.");
        }
    };
    
    const stepThrough = (direction) => {
        setIsPlaying(false);
        if (direction === 'first') setCurrentStep(0);
        else if (direction === 'last') setCurrentStep(trace.length - 1);
        else if (direction === 'next') setCurrentStep(prev => Math.min(prev + 1, trace.length - 1));
        else if (direction === 'prev') setCurrentStep(prev => Math.max(prev - 1, 0));
    };

    // --- Flowchart Generation ---
    useEffect(() => {
        if (trace.length === 0) return;
        const generatedNodes = [];
        const generatedEdges = [];
        let yPos = 0;
        const xPos = 150;
        
        let lineNodes = {};
        trace.forEach((event) => {
            if (event.event !== 'line') return;
            const codeLine = code.split('\n')[event.line - 1]?.trim() || `Line ${event.line}`;
            const nodeId = `line-${event.line}`;

            if(!lineNodes[nodeId]){
                yPos += 80;
                lineNodes[nodeId] = { id: nodeId, data: { label: codeLine }, position: { x: xPos, y: yPos }, style: { background: '#2d3748', color: '#e2e8f0', borderColor: '#4a5568', borderRadius: '8px', width: 250 }};
            }
        });
        
        generatedNodes.push({ id: 'start', type: 'input', data: { label: 'Start' }, position: { x: xPos, y: yPos - (Object.keys(lineNodes).length * 80) - 80 }, style: { background: '#22c55e', color: 'white', borderColor: '#166534'} });

        generatedNodes.push(...Object.values(lineNodes));
        
        let lastLine = -1;
        trace.forEach((event) => {
            if(event.event === 'line') {
                 if(lastLine !== -1 && lastLine !== event.line) {
                     const sourceNode = `line-${lastLine}`;
                     const targetNode = `line-${event.line}`;
                     const edgeId = `e-${sourceNode}-${targetNode}`;
                     if(!generatedEdges.find(e => e.id === edgeId)) {
                          generatedEdges.push({ id: edgeId, source: sourceNode, target: targetNode, animated: true, arrowHeadType: 'arrowclosed' });
                     }
                 }
                 lastLine = event.line;
            }
        });
        
        const firstLineEvent = trace.find(e => e.event === 'line');
        if(firstLineEvent){
            generatedEdges.push({id: 'e-start-first', source: 'start', target: `line-${firstLineEvent.line}`, animated: true, arrowHeadType: 'arrowclosed'})
        }

        yPos += 80;
        generatedNodes.push({ id: 'end', type: 'output', data: { label: 'End' }, position: { x: xPos, y: yPos }, style: { background: '#ef4444', color: 'white', borderColor: '#991b1b'} });
        const lastLineEvent = trace.slice().reverse().find(e => e.event === 'line');
        if(lastLineEvent) {
             generatedEdges.push({ id: `e-last-end`, source: `line-${lastLineEvent.line}`, target: 'end', animated: true, arrowHeadType: 'arrowclosed' });
        }
        
        setNodes(generatedNodes);
        setEdges(generatedEdges);
    }, [trace, code]);

    useEffect(() => {
        const isFinished = currentStep >= trace.length -1;
        if (isFinished && trace.length > 0) setIsPlaying(false);

        const currentEvent = trace[currentStep];
        const prevEvent = trace[currentStep - 1];

        if (editorRef.current && monacoRef.current) {
            let newDecorations = [];
            if (prevEvent?.event === 'line') newDecorations.push({ range: new monacoRef.current.Range(prevEvent.line, 1, prevEvent.line, 1), options: { glyphMarginClassName: 'executed-line-arrow' } });
            if (currentEvent?.event === 'line') {
                editorRef.current.revealLineInCenter(currentEvent.line, 0);
                newDecorations.push({ range: new monacoRef.current.Range(currentEvent.line, 1, currentEvent.line, 1), options: { glyphMarginClassName: 'next-line-arrow' } });
            }
            setDecorations(editorRef.current.deltaDecorations(decorations, newDecorations));
        }
        
        setNodes(nds =>
            nds.map(node => {
                const eventId = currentEvent?.event === 'line' ? `line-${currentEvent.line}` : null;
                if (node.id === eventId) return { ...node, style: { ...node.style, borderColor: '#3b82f6', boxShadow: '0 0 10px #3b82f6' } };
                if (node.style?.borderColor === '#3b82f6') return {...node, style: {...node.style, borderColor: '#4a5568', boxShadow: 'none'}};
                return node;
            })
        );

        if (isPlaying && !isFinished) {
            const timer = setTimeout(() => setCurrentStep(prev => prev + 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [currentStep, isPlaying, trace]);

    const currentTraceEvent = trace[currentStep];
    const isFinished = currentStep >= trace.length - 1 && trace.length > 0;
    const internalFunctions = new Set(['trace_code', 'run_with_trace', 'run_python', '__enter__', '__exit__', '__init__', '<module>']);
    
    const buildFrames = () => {
        const frames = {};
        if (!trace.length) return [];
        const internalVariables = new Set(['self', 'new_target', 'exctype', 'excinst', 'exctb']);
        const filterLocals = (locals) => {
            const filtered = {};
            if(!locals) return filtered;
            for (const key in locals) {
                if (!internalVariables.has(key)) {
                    filtered[key] = locals[key];
                }
            }
            return filtered;
        };

        for (let i = 0; i <= currentStep; i++) {
            const event = trace[i];
            const userCallStack = (event.call_stack || []).filter(name => !internalFunctions.has(name));
            
            if (userCallStack.length > 0) {
                 const frameName = userCallStack[userCallStack.length - 1];
                 const frameKey = userCallStack.join(' -> ');
                 
                 if(!frames[frameKey]) {
                      frames[frameKey] = { name: frameName, locals: {}, returnValue: null };
                 }
                 if(event.locals) frames[frameKey].locals = { ...frames[frameKey].locals, ...filterLocals(event.locals) };
                 if (event.event === 'return' && event.function === frameName) frames[frameKey].returnValue = event.return_value;
            } else { 
                 if(event.locals) {
                    if (!frames["Global frame"]) frames["Global frame"] = { name: "Global frame", locals: {}, returnValue: null };
                    frames["Global frame"].locals = { ...frames["Global frame"].locals, ...filterLocals(event.locals) };
                 }
            }
        }
        
        const finalFrames = {};
        const latestUserStack = (currentTraceEvent?.call_stack || []).filter(name => !internalFunctions.has(name));
        if(frames["Global frame"]) finalFrames["Global frame"] = frames["Global frame"];
        
        let stackKey = "";
        for (const funcName of latestUserStack) {
            stackKey = stackKey ? `${stackKey} -> ${funcName}` : funcName;
            if (frames[stackKey]) finalFrames[stackKey] = frames[stackKey];
        }

        return Object.values(finalFrames);
    };
    const renderedFrames = buildFrames();

    return (
        <div className="h-screen bg-[#0d1117] text-gray-300 font-sans flex flex-col">
            <style>{`.next-line-arrow { background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" fill="%23ef4444"><path d="M8 13.5a1.5 1.5 0 0 0 1.06-.44l4.25-4.25a1.5 1.5 0 0 0 0-2.12L9.06 2.44a1.5 1.5 0 0 0-2.12 2.12L9.88 7.5H3.5a1.5 1.5 0 0 0 0 3h6.38L6.94 11.44a1.5 1.5 0 0 0 1.06 2.06Z"/></svg>') center center no-repeat; } .executed-line-arrow { background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" fill="%2322c55e"><path d="M8 13.5a1.5 1.5 0 0 0 1.06-.44l4.25-4.25a1.5 1.5 0 0 0 0-2.12L9.06 2.44a1.5 1.5 0 0 0-2.12 2.12L9.88 7.5H3.5a1.5 1.5 0 0 0 0 3h6.38L6.94 11.44a1.5 1.5 0 0 0 1.06 2.06Z"/></svg>') center center no-repeat; opacity: 0.5; }`}</style>
            
            <header className="flex-shrink-0 flex items-center justify-center bg-[#161b22] p-2 border-b border-gray-700">
                 <button onClick={handleRun} className="px-4 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">Visualize Execution</button>
            </header>

            <main className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 overflow-hidden">
                <div className="flex flex-col gap-4">
                    <div className="bg-[#161b22] rounded-lg border border-gray-700 overflow-hidden flex-grow">
                        <Editor height="100%" theme="vs-dark" defaultLanguage="python" value={code} onChange={(v) => setCode(v || "")} onMount={handleEditorDidMount} options={{ glyphMargin: true, automaticLayout: true, minimap: { enabled: false } }}/>
                    </div>
                    <div className="flex-shrink-0 p-3 bg-[#161b22] rounded-md border border-gray-700">
                        <div className="flex items-center justify-center gap-2">
                            <button onClick={() => stepThrough('first')} disabled={!trace.length} className="px-3 py-1 text-sm border border-gray-600 rounded bg-[#2d3748] hover:bg-gray-600 disabled:opacity-50">« First</button>
                            <button onClick={() => stepThrough('prev')} disabled={!trace.length} className="px-3 py-1 text-sm border border-gray-600 rounded bg-[#2d3748] hover:bg-gray-600 disabled:opacity-50">‹ Prev</button>
                            <button onClick={() => setIsPlaying(!isPlaying)} disabled={!trace.length || isFinished} className="p-2 rounded-full bg-gray-600 hover:bg-gray-500 text-white disabled:opacity-50">{isPlaying ? <PauseIcon className="h-5 w-5" /> : <PlayIcon className="h-5 w-5" />}</button>
                            <button onClick={() => stepThrough('next')} disabled={!trace.length || isFinished} className="px-3 py-1 text-sm border border-gray-600 rounded bg-[#2d3748] hover:bg-gray-600 disabled:opacity-50">Next ›</button>
                            <button onClick={() => stepThrough('last')} disabled={!trace.length} className="px-3 py-1 text-sm border border-gray-600 rounded bg-[#2d3748] hover:bg-gray-600 disabled:opacity-50">Last »</button>
                        </div>
                         <div className="text-center text-xs text-gray-400 mt-2">Step {currentStep + 1} of {trace.length}</div>
                    </div>
                </div>

                <div className="flex flex-col gap-4 overflow-hidden">
                    <div className="flex-shrink-0 bg-[#161b22] rounded-lg border border-gray-700 p-3">
                        <h3 className="text-md font-semibold mb-1 text-gray-400">Print Output</h3>
                        <pre className="text-sm whitespace-pre-wrap font-mono h-24 overflow-auto">{error || output}</pre>
                    </div>
                    <div className="bg-[#161b22] rounded-lg border border-gray-700 flex flex-col flex-grow">
                        <div className="flex border-b border-gray-700">
                            {["Frames", "Flowchart"].map(tab => (<button key={tab} onClick={() => setActiveVizTab(tab)} className={`px-4 py-2 text-sm ${activeVizTab === tab ? 'bg-[#2d3748] text-white' : 'text-gray-400 hover:bg-gray-700'}`}>{tab}</button>))}
                        </div>
                        <div className="p-3 flex-grow overflow-auto">
                            {activeVizTab === 'Frames' && (
                                <div className="space-y-3">
                                    {trace.length > 0 && renderedFrames.map((frame, index) => (
                                        <div key={index} className="border border-gray-700 rounded p-2">
                                            <p className="text-sm font-mono bg-[#2d3748] px-2 py-1 rounded-sm inline-block">{frame.name}</p>
                                            <div className="mt-2 text-sm font-mono space-y-1 pl-2">
                                                {Object.entries(frame.locals).map(([key, value]) => (
                                                    <div key={key} className="flex items-center">
                                                       <span>{key}</span>
                                                       <span className="mx-2 text-gray-500">→</span>
                                                       <ValueRenderer value={value} />
                                                    </div>
                                                ))}
                                                {frame.returnValue !== null && (
                                                    <div className="flex items-center text-red-400 font-bold">
                                                        <span>Return value</span>
                                                        <span className="mx-2">→</span>
                                                        <ValueRenderer value={frame.returnValue} />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {isFinished && <p className="text-sm text-gray-500">✅ Execution finished.</p>}
                                    {!trace.length && !error && <p className="text-sm text-gray-500">Click "Visualize Execution" to begin.</p>}
                                </div>
                            )}
                            {activeVizTab === 'Flowchart' && (
                                <div className="h-full w-full">
                                    <ReactFlow nodes={nodes} edges={edges} nodesConnectable={false} nodesDraggable={true}>
                                        <Background color="#4a5568" gap={16} />
                                    </ReactFlow>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CodePage;
