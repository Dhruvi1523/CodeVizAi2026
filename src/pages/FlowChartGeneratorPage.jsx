import { useState, useCallback, useEffect } from "react";
import axios from "axios";
import ReactFlow, {
    MiniMap,
    Controls,
    Background,
    useEdgesState,
    useNodesState,
    MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import dagre from "dagre";

// --- Dagre layout function (no changes needed) ---
const getLayoutedElements = (nodes, edges, direction = 'TB') => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setGraph({ rankdir: direction, nodesep: 50, ranksep: 50 });
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    nodes.forEach((node) => {
        // Give more space to nodes with more text
        const width = 150 + Math.max(0, (node.data.label.length - 20) * 5);
        dagreGraph.setNode(node.id, { width, height: 50 });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    nodes.forEach((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        if (nodeWithPosition) {
            node.position = {
                x: nodeWithPosition.x - nodeWithPosition.width / 2,
                y: nodeWithPosition.y - nodeWithPosition.height / 2,
            };
        }
    });

    return { nodes, edges };
};

// ✅ NEW: Custom hook to handle styling and layout logic
const useFlowchartStyling = () => {
    const styleStaticFlowchart = useCallback((data) => {
        const styledEdges = data.edges.map(e => ({
            ...e,
            type: "smoothstep",
            animated: e.label === "True" || e.label === "False",
            markerEnd: { type: MarkerType.ArrowClosed },
            style: {
                strokeWidth: 2,
                stroke: e.label === "True" || e.label === "False" ? "#f97316" : "#334155",
            },
        }));
        return getLayoutedElements(data.nodes, styledEdges);
    }, []);

    const styleExecutionTrace = useCallback((data) => {
        const traceNodes = data.trace.map((item, index) => ({
            id: `trace-${index}`,
            data: { label: `Line ${item.line_no}: ${item.func_name}` },
            position: { x: 0, y: 0 },
            style: { background: "#10b981", color: "white" }
        }));
        const traceEdges = data.trace.slice(1).map((_, index) => ({
            id: `e-trace-${index}-${index+1}`,
            source: `trace-${index}`,
            target: `trace-${index+1}`,
            type: "smoothstep",
            markerEnd: { type: MarkerType.ArrowClosed }
        }));
        return getLayoutedElements(traceNodes, traceEdges);
    }, []);

    return { styleStaticFlowchart, styleExecutionTrace };
};


function FlowchartGenerator() {
    const [input, setInput] = useState({ code: "", lang: "python" });
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [status, setStatus] = useState("idle");
    const [jobId, setJobId] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [analysisType, setAnalysisType] = useState("static");
    
    // ✅ Use the new custom hook
    const { styleStaticFlowchart, styleExecutionTrace } = useFlowchartStyling();

    const handleGenerate = async () => {
        if (!input.code.trim()) {
            alert("Please paste some code first!");
            return;
        }
        setStatus("pending");
        setJobId(null);
        setErrorMessage("");
        setNodes([]);
        setEdges([]);

        if (analysisType === "static") {
            handleStaticAnalysis();
        } else {
            handleExecutionTrace();
        }
    };

    const handleStaticAnalysis = async () => {
        try {
            const res = await axios.post("http://localhost:8000/submit", input);
            setJobId(res.data.jobId);
        } catch (err) {
            console.error("Submission error:", err);
            setStatus("error");
            setErrorMessage("Failed to submit job to the backend.");
        }
    };

    const handleExecutionTrace = async () => {
        try {
            const res = await axios.post("http://localhost:8000/trace", input);
            const { nodes: layoutedNodes, edges: layoutedEdges } = styleExecutionTrace(res.data);
            setNodes(layoutedNodes);
            setEdges(layoutedEdges);
            setStatus('success');
        } catch (err) {
            console.error("Trace error:", err);
            setStatus("error");
            setErrorMessage(err.response?.data?.detail || "Failed to get execution trace.");
        }
    };

    useEffect(() => {
        if (status !== 'pending' || !jobId) return;

        const intervalId = setInterval(async () => {
            try {
                const res = await axios.get(`http://localhost:8000/status/${jobId}`);
                if (res.data.status === 'success') {
                    clearInterval(intervalId);
                    const { nodes: layoutedNodes, edges: layoutedEdges } = styleStaticFlowchart(res.data.result);
                    setNodes(layoutedNodes);
                    setEdges(layoutedEdges);
                    setStatus('success');
                } else if (res.data.status === 'failed') {
                    clearInterval(intervalId);
                    setStatus('error');
                    setErrorMessage(res.data.error || "An unknown error occurred.");
                }
            } catch (err) {
                clearInterval(intervalId);
                setStatus('error');
                setErrorMessage("Could not retrieve job status.");
                console.error("Polling error:", err);
            }
        }, 2000);

        return () => clearInterval(intervalId);
    }, [status, jobId, setNodes, setEdges, setStatus, setErrorMessage, styleStaticFlowchart]);
    
    const onConnect = useCallback((params) => setEdges((eds) => [...eds, { ...params }]), [setEdges]);

    const getDisplayMessage = () => {
        switch (status) {
            case 'pending': return "Analyzing code...";
            case 'error': return `Error: ${errorMessage}`;
            default: return 'Paste code and click "Generate"';
        }
    };

    return (
        <div className="flex h-screen font-sans">
            <div className="w-1/3 p-4 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white flex flex-col">
                <h1 className="text-2xl font-bold mb-4 text-blue-600 dark:text-blue-400">CodeFlow</h1>
                
                <div className="mb-4">
                    <label className="block mb-2 font-semibold text-sm">Analysis Type</label>
                    <div className="flex rounded-md shadow-sm">
                        <button onClick={() => setAnalysisType('static')} className={`px-4 py-2 rounded-l-md w-1/2 transition-colors ${analysisType === 'static' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800'}`}>
                            Static Flowchart
                        </button>
                        <button onClick={() => setAnalysisType('trace')} className={`px-4 py-2 rounded-r-md w-1/2 transition-colors ${analysisType === 'trace' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800'}`}>
                            Execution Trace
                        </button>
                    </div>
                </div>

                <label className="block mb-2 font-semibold text-sm">Language</label>
                <select value={input.lang} onChange={(e) => setInput({ ...input, lang: e.target.value })} className="w-full p-2 border rounded mb-4 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700">
                    <option value="python">Python</option>
                </select>

                <label className="block mb-2 font-semibold text-sm">Code</label>
                <textarea
                    rows="12"
                    value={input.code}
                    onChange={(e) => setInput({ ...input, code: e.target.value })}
                    className="w-full p-2 border rounded mb-4 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 flex-grow font-mono text-sm"
                    placeholder="Paste your code here..."
                />

                <button
                    onClick={handleGenerate}
                    disabled={status === "pending"}
                    className="w-full mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
                >
                    {status === "pending" ? "Generating..." : "Generate"}
                </button>
            </div>

            <div className="w-2/3 bg-gray-50 dark:bg-gray-800">
                {status === 'success' && nodes.length > 0 ? (
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        fitView
                    >
                        <MiniMap nodeColor={(n) => n.style?.background || "#6366f1"} />
                        <Controls />
                        <Background gap={16} color="#e2e8f0" />
                    </ReactFlow>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                        <p className="text-lg">{getDisplayMessage()}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default FlowchartGenerator;