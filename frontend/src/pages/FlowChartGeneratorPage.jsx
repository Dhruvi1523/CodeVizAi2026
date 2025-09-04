import { useState, useCallback } from "react";
import axios from "axios";
import ReactFlow, {
    MiniMap,
    Controls,
Background,
    useNodesState,
    useEdgesState,
    MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import dagre from "dagre";

// ✅ This function uses Dagre to automatically position the nodes.
const getLayoutedElements = (nodes, edges, direction = 'TB') => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({ rankdir: direction, nodesep: 50, ranksep: 50 });

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: 200, height: 50 });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    nodes.forEach((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        if (nodeWithPosition) {
            node.position = {
                x: nodeWithPosition.x - 100, // half of width
                y: nodeWithPosition.y - 25,  // half of height
            };
        }
    });

    return { nodes, edges };
};

// ✅ This function parses the flowchart.js syntax and applies styles
const parseAndStyleFlowchart = (syntax) => {
    const nodeDefinitions = new Map();
    const edges = [];
    
    // Define our color scheme for different node types
    const styleMap = {
        operation:  { backgroundColor: '#93c5fd', color: '#1a202c' },
        condition:  { backgroundColor: '#fcd34d', color: '#1a202c' },
        start:      { backgroundColor: '#86efac', color: '#1a202c' },
        end:        { backgroundColor: '#86efac', color: '#1a202c' },
        subroutine: { backgroundColor: '#d8b4fe', color: '#1a202c' },
        inputoutput:{ backgroundColor: '#fdba74', color: '#1a202c' },
    };

    const lines = syntax.split('\n').filter(line => line.trim() !== '');

    // First pass: define nodes
    lines.forEach(line => {
        if (line.includes('=>')) {
            const [idAndType, label] = line.split(':');
            const [id, type] = idAndType.split('=>');
            const nodeId = id.trim();
            const nodeType = type.trim();

            nodeDefinitions.set(nodeId, {
                id: nodeId,
                data: { label: label.trim() },
                position: { x: 0, y: 0 },
                style: styleMap[nodeType] || {}, // Apply style from our map
            });
        }
    });

    // Second pass: define edges
    lines.forEach(line => {
        if (line.includes('->')) {
            const parts = line.split('->');
            for (let i = 0; i < parts.length - 1; i++) {
                let source = parts[i].trim();
                const target = parts[i + 1].trim();
                let label = null;

                const match = source.match(/(\w+)\((.+)\)/);
                if (match) {
                    source = match[1];
                    label = match[2];
                }

                if (nodeDefinitions.has(source) && nodeDefinitions.has(target)) {
                    edges.push({
                        id: `e-${source}-${target}-${i}`,
                        source,
                        target,
                        label,
                        type: 'smoothstep',
                        markerEnd: { type: MarkerType.ArrowClosed },
                        style: { stroke: '#a78bfa', strokeWidth: 2 },
                    });
                }
            }
        }
    });
    
    return { nodes: Array.from(nodeDefinitions.values()), edges };
};

function FlowchartGenerator() {
    // ✅ Reintroduce state for nodes and edges for React Flow
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    
    const [input, setInput] = useState({ code: "score = 85\n\nif score >= 90:\n    print('This is an excellent Grade: A')\nelif score >= 80:\n    print('This is a good Grade: B')\nelif score >= 70:\n    print('This is a satisfactory Grade: C')\nelse:\n    print('This is Grade: F')" });
    const [status, setStatus] = useState("idle");
    const [errorMessage, setErrorMessage] = useState("");

    const handleGenerate = async () => {
        if (!input.code.trim()) {
            alert("Please paste some code first!");
            return;
        }
        setStatus("loading");
        setErrorMessage("");

        try {
            const res = await axios.post("http://localhost:8000/generate", {
                code: input.code,
                lang: 'python'
            });
            
            // ✅ NEW WORKFLOW: Parse -> Layout -> Set
            // 1. Parse the text syntax and apply styles
            const parsedData = parseAndStyleFlowchart(res.data.flowchart_code);
            // 2. Use Dagre to calculate node positions
            const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(parsedData.nodes, parsedData.edges);

            setNodes(layoutedNodes);
            setEdges(layoutedEdges);
            setStatus("success");

        } catch (err) {
            console.error("Generation error:", err);
            setStatus("error");
            setErrorMessage(err.response?.data?.detail || "Failed to generate flowchart.");
        }
    };
    
    const getDisplayMessage = () => {
        switch (status) {
            case 'loading': return "Analyzing code...";
            case 'error': return `Error: ${errorMessage}`;
            default: return 'Paste code and click "Generate"';
        }
    };

    return (
        <div className="flex h-screen font-sans bg-gray-900 text-white">
            <div className="w-1/3 p-4 bg-gray-800 flex flex-col border-r border-gray-700">
                <h1 className="text-2xl font-bold mb-4 text-blue-400">CodeFlow (React Flow)</h1>
                <label className="block mb-2 font-semibold text-sm text-gray-400">Python Code</label>
                <textarea
                    rows="12"
                    value={input.code}
                    onChange={(e) => setInput({ ...input, code: e.target.value })}
                    className="w-full p-2 border rounded mb-4 bg-gray-900 border-gray-600 flex-grow font-mono text-sm text-gray-200"
                    placeholder="Paste your Python code here..."
                />
                <button
                    onClick={handleGenerate}
                    disabled={status === "loading"}
                    className="w-full mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 font-bold rounded disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
                >
                    {status === "loading" ? "Generating..." : "Generate Flowchart"}
                </button>
            </div>

            <div className="w-2/3">
                {/* ✅ The main renderer is now the ReactFlow component */}
                {status === 'success' && nodes.length > 0 ? (
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        fitView
                    >
                        <MiniMap nodeColor={(n) => n.style.backgroundColor || '#ddd'} />
                        <Controls />
                        <Background color="#4b5563" />
                    </ReactFlow>
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                        <p className="text-lg">{getDisplayMessage()}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default FlowchartGenerator;