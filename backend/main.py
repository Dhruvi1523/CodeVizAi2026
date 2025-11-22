import timeit
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .routers import flowchart, dp_visualizer, ai_router,tracer_router
from pydantic import BaseModel
import ast
from memory_profiler import memory_usage

# --- FastAPI App Initialization ---
app = FastAPI()

# --- Middleware for CORS ---
# This allows your React frontend (running on a different port) to communicate with this backend.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"], # Add your frontend's URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(flowchart.router, tags=["Flowchart Generator"])
app.include_router(dp_visualizer.router, prefix="/api", tags=["DP Visualizer"])
app.include_router(tracer_router.router, tags=["Trace Code"])
# app.include_router(complexity_analyzer.router, tags=["Complexity Analyzer"])
app.include_router(ai_router.router, tags=["AI Explanation"])

@app.get("/")
def read_root():
    return {"message": "Welcome to the DP and Flowchart Visualizer API"}




class CodeRequest(BaseModel):
    code: str
    func_name: str | None = None
    input_sizes: list[int] = [10, 20, 40, 80]

# ----------------------
# Function extraction
# ----------------------
def extract_functions(code: str):
    tree = ast.parse(code)
    return [node.name for node in ast.walk(tree) if isinstance(node, ast.FunctionDef)]

# ----------------------
# AST complexity analysis
# ----------------------
def analyze_ast_complexity(code: str):
    tree = ast.parse(code)
    max_loop_depth = 0
    recursion_type = None  # None, "linear", "exponential"
    max_recursion_depth = 0

    def visit_node(node, current_depth=0, func_name=None):
        nonlocal max_loop_depth, recursion_type, max_recursion_depth

        # Loop depth
        if isinstance(node, (ast.For, ast.While)):
            max_loop_depth = max(max_loop_depth, current_depth + 1)

        # Recursion detection
        if isinstance(node, ast.FunctionDef):
            # Count recursive calls in function body
            call_count = sum(
                1 for nn in ast.walk(node)
                if isinstance(nn, ast.Call) and getattr(nn.func, 'id', '') == node.name
            )
            if call_count > 0:
                recursion_type = "linear" if call_count == 1 else "exponential"
                max_recursion_depth = max(max_recursion_depth, 1)  # minimum 1
            # Visit children
            for child in ast.iter_child_nodes(node):
                visit_node(child, current_depth, node.name)
        else:
            for child in ast.iter_child_nodes(node):
                visit_node(child, current_depth + (1 if isinstance(node, (ast.For, ast.While)) else 0), func_name)

    visit_node(tree)
    return {
        "max_loop_depth": max_loop_depth,
        "recursion_type": recursion_type,
        "max_recursion_depth": max_recursion_depth
    }

# ----------------------
# Profiling (optional)
# ----------------------
def profile_times(func, input_sizes):
    times = []
    for n in input_sizes:
        try:
            t = timeit.timeit(lambda: func(n), number=3)
            times.append(t)
        except Exception:
            times.append(float('nan'))
    return times

def profile_memory(func, input_sizes):
    mems = []
    for n in input_sizes:
        try:
            mem = max(memory_usage((func, (n,)), interval=0.01))
            mems.append(mem)
        except Exception:
            mems.append(float('nan'))
    return mems

# ----------------------
# Complexity estimation
# ----------------------
def estimate_time_complexity(ast_result):
    if ast_result["recursion_type"] == "linear":
        return "O(n)"
    elif ast_result["recursion_type"] == "exponential":
        return "O(2^n)"
    elif ast_result["max_loop_depth"] > 0:
        return f"O(n^{ast_result['max_loop_depth']})"
    else:
        return "O(1)"

def estimate_space_complexity(ast_result):
    """
    Simple heuristic:
    - Recursion depth contributes to stack space
    - Linear recursion or loops allocating arrays -> O(n)
    """
    space = 1  # O(1) default
    if ast_result["recursion_type"] == "linear":
        space = "O(n)"
    elif ast_result["recursion_type"] == "exponential":
        space = "O(n)"  # stack grows linearly
    elif ast_result["max_loop_depth"] > 0:
        space = "O(n)"  # loops creating arrays/lists
    return space

# ----------------------
# LLM-style explanation
# ----------------------
def llm_explain(ast_result, time_complexity, space_complexity):
    loops = ast_result["max_loop_depth"]
    recursion = ast_result["recursion_type"]
    explanation = f"Maximum loop nesting depth: {loops}. "
    if recursion:
        explanation += f"Recursion type: {recursion}. "
    explanation += f"Estimated time complexity: {time_complexity}. "
    explanation += f"Estimated space complexity: {space_complexity}."
    teaching_note = "Consider reducing loop nesting or using iterative approaches for recursion."
    return {
        "time_complexity": time_complexity,
        "space_complexity": space_complexity,
        "explanation": explanation,
        "teaching_note": teaching_note
    }

# ----------------------
# FastAPI endpoint
# ---------------------
   

@app.post("/analyze_code")
def analyze_code(request: CodeRequest):
    code = request.code
    func_name = request.func_name

    # 1. Extract function name if missing
    functions = extract_functions(code)
    if not func_name:
        if functions:
            func_name = functions[0]
        else:
            # Fallback logic
            func_name = "main"
            # Indent code to wrap in main if needed (simplified)
            # Note: This fallback is risky, better to enforce a function name
    
    # 2. AST Analysis
    try:
        ast_result = analyze_ast_complexity(code)
    except SyntaxError as e:
         return {"error": f"Syntax Error: {e}"}

    # 3. SECURE EXECUTION (The Fix)
    local_scope = {} # Create an empty sandbox
    try:
        # Execute code inside 'local_scope', NOT globals()
        exec(code, {}, local_scope)
        
        if func_name not in local_scope:
             return {"error": f"Function '{func_name}' not found in code."}
             
        func = local_scope[func_name]
    except Exception as e:
        return {"error": f"Code execution failed: {e}"}

    # 4. Profiling (Wrapped in Try/Except to prevent server crashes)
    try:
        times = profile_times(func, request.input_sizes)
        memory = profile_memory(func, request.input_sizes)
    except Exception as e:
        return {"error": f"Profiling failed (possible infinite recursion): {e}"}

     # Profiling
    times = profile_times(func, request.input_sizes)
    memory = profile_memory(func, request.input_sizes)

    
    time_complexity = estimate_time_complexity(ast_result)
    space_complexity = estimate_space_complexity(ast_result)
    llm_result = llm_explain(ast_result, time_complexity, space_complexity)

    return {
        "static_analysis": ast_result,
        "profiling_times": times,
        "profiling_memory": memory,
        "empirical_time_complexity": time_complexity,
        "empirical_space_complexity": space_complexity,
        "llm_explanation": llm_result,
        "detected_functions": functions
    }