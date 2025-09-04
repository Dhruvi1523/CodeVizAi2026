from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from tracer import run_with_trace  # Import our tracer function
import traceback, sys, io, ast
from typing import List, Dict, Any
app = FastAPI()

# ✅ Allow frontend connection
# Your React port might be 3000, 5173 (Vite), etc. Adjust if needed.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic model for incoming request body
class CodeInput(BaseModel):
    language: str
    code: str

@app.get("/")
def read_root():
    return {"message": "CodeVizAI Backend is running!"}

# --- Utility: Execute python code and capture trace ---
def trace_execution(code: str) -> Dict[str, Any]:
    """
    Execute Python code and capture simple trace (line numbers, locals).
    Very minimal instrumentation — production code should use `sys.settrace`, 
    ast instrumentation, or VizTracer for deep tracing.
    """

    trace_data = []
    output_buffer = io.StringIO()
    error_message = None
    error_line = None

    def tracer(frame, event, arg):
        if event == "line":
            local_copy = frame.f_locals.copy()
            trace_data.append({
                "event": "line",
                "line": frame.f_lineno,
                "locals": local_copy,
                "call_stack": [frame.f_code.co_name]
            })
        elif event == "call":
            trace_data.append({
                "event": "call",
                "line": frame.f_lineno,
                "function": frame.f_code.co_name,
                "locals": frame.f_locals.copy(),
                "call_stack": [frame.f_code.co_name]
            })
        elif event == "return":
            trace_data.append({
                "event": "return",
                "line": frame.f_lineno,
                "return": arg,
                "call_stack": [frame.f_code.co_name]
            })
        return tracer

    try:
        sys.settrace(tracer)
        exec(compile(code, filename="<user_code>", mode="exec"), {}, {})
    except Exception as e:
        error_message = f"{e.__class__.__name__}: {e}"
        _, _, tb = sys.exc_info()
        if tb is not None:
            error_line = tb.tb_next.tb_lineno if tb.tb_next else tb.tb_lineno
    finally:
        sys.settrace(None)

    return {
        "trace": trace_data,
        "output": output_buffer.getvalue(),
        "error": error_message,
        "error_line": error_line,
    }


# --- POST /trace ---
@app.post("/trace")
async def trace_code(request: CodeInput):
    if request.language != "python":
        return {"error": "Only Python is supported at the moment."}
    result = trace_execution(request.code)
    return result


# --- Generate flowchart (minimal AST -> Mermaid) ---
def generate_mermaid_flowchart(code: str) -> str:
    """
    Parse Python code AST and generate simple Mermaid flowchart.
    Very naive implementation: shows `If`, `For`, and `While`.
    """
    try:
        tree = ast.parse(code)
    except Exception:
        return "graph TD\nA[Error] --> B[Invalid Python code];"

    nodes = []
    edges = []

    class FlowVisitor(ast.NodeVisitor):
        def __init__(self):
            self.node_count = 0

        def add_node(self, label):
            self.node_count += 1
            node_id = f"N{self.node_count}"
            nodes.append(f"{node_id}[{label}]")
            return node_id

        def visit_FunctionDef(self, node):
            func_id = self.add_node(f"Function: {node.name}")
            for stmt in node.body:
                self.visit(stmt)
            return func_id

        def visit_If(self, node):
            if_id = self.add_node("If condition")
            for stmt in node.body:
                self.visit(stmt)
            for stmt in node.orelse:
                self.visit(stmt)
            return if_id

        def visit_For(self, node):
            for_id = self.add_node("For loop")
            for stmt in node.body:
                self.visit(stmt)
            return for_id

        def visit_While(self, node):
            while_id = self.add_node("While loop")
            for stmt in node.body:
                self.visit(stmt)
            return while_id

    visitor = FlowVisitor()
    visitor.visit(tree)

    all_nodes = ";\n".join(nodes)
    mermaid = f"graph TD\n{all_nodes}"
    return mermaid


# --- POST /flowchart ---
@app.post("/flowchart")
async def flowchart_code(request: CodeInput):
    mermaid_code = generate_mermaid_flowchart(request.code)
    return {"mermaid_code": mermaid_code}