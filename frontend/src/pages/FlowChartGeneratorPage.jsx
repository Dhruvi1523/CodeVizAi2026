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
import { defineCodVizTheme } from "../utils/monacoTheme"; 
import Navbar from "../components/Navbar";
import {  GitCommitHorizontal } from "lucide-react";
import Editor from "@monaco-editor/react";

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
    operation:  { backgroundColor: '#6366f1', color: '#f1f5f9', border: '2px solid #a5b4fc' },
    condition:  { backgroundColor: '#f59e0b', color: '#0f172a', border: '2px solid #fcd34d' },
    start:      { backgroundColor: '#14b8a6', color: '#0f172a', border: '2px solid #6ee7b7' },
    end:        { backgroundColor: '#14b8a6', color: '#0f172a', border: '2px solid #6ee7b7' },
    subroutine: { backgroundColor: '#8b5cf6', color: '#f1f5f9', border: '2px solid #c4b5fd' },
    inputoutput:{ backgroundColor: '#334155', color: '#f1f5f9', border: '2px solid #64748b' },
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
    
    const [input, setInput] = useState( "score = 85\n\nif score >= 90:\n    print('This is an excellent Grade: A')\nelif score >= 80:\n    print('This is a good Grade: B')\nelif score >= 70:\n    print('This is a satisfactory Grade: C')\nelse:\n    print('This is Grade: F')" );
    const [status, setStatus] = useState("idle");
    const [errorMessage, setErrorMessage] = useState("");

    const handleGenerate = async () => {
        if (!input.trim()) {
            alert("Please paste some code first!");
            return;
        }
        setStatus("loading");
        setErrorMessage("");

        try {
            const res = await axios.post("https://codevizai2026.onrender.com/generate", {
                code: input,
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
    <div className="min-h-screen bg-[#0f172a] text-[#f1f5f9] flex flex-col p-4 font-sans">
      <header className="flex-shrink-0 mb-4">
        <Navbar />
      </header>
      
      <div className="flex-grow flex flex-col lg:flex-row gap-4 min-h-0">
        {/* Control Sidebar */}
        <aside className="lg:w-96 flex-shrink-0 bg-[#1e293b] rounded-xl border border-[#334155] p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <GitCommitHorizontal size={24} className="text-[#14b8a6]" />
            <h1 className="text-2xl font-bold text-[#f1f5f9]">Code to Flowchart</h1>
          </div>
          <label className="block mb-2 font-semibold text-sm text-[#94a3b8]">Python Code</label>
          <div className="w-full border rounded-md bg-[#0f172a] border-[#334155] flex-grow overflow-hidden">
            <Editor
              height="100%"
              theme="CodVizDark" // Your custom theme
              defaultLanguage="python"
              value={input}
              beforeMount={defineCodVizTheme} // Assumes you have this shared theme function
              onChange={(value) => setInput(value || "")}
              options={{
                minimap: { enabled: false }, fontSize: 14, wordWrap: "on", scrollBeyondLastLine: false,
              }}
            />
          </div>
          <button
            onClick={handleGenerate}
            disabled={status === "loading"}
            className="w-full mt-4 px-4 py-3 bg-[#6366f1] hover:opacity-90 font-bold rounded-md text-[#f1f5f9] disabled:bg-[#334155] disabled:cursor-not-allowed transition-colors"
          >
            {status === "loading" ? "Generating..." : "Generate Flowchart"}
          </button>
        </aside>

        {/* Visualization Area */}
        <main className="flex-grow bg-[#1e293b] rounded-xl border border-[#334155]">
          {status === 'success' && nodes.length > 0 ? (
            <ReactFlow
              nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} fitView
              proOptions={{ hideAttribution: true }}
            >
              <MiniMap nodeColor={(n) => n.style.backgroundColor || '#ddd'} />
              <Controls />
              <Background color="#334155" gap={24} />
            </ReactFlow>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#94a3b8] p-4">
              <p className="text-lg text-center">{getDisplayMessage()}</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default FlowchartGenerator;