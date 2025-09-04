from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import io

app = Flask(__name__)
CORS(app)  # Allow frontend http://localhost:5173 to call backend

def run_with_trace(code_str):
    """Executes Python code and captures a step-by-step trace."""
    trace_steps = []
    output_buffer = io.StringIO()
    
    def tracer(frame, event, arg):
        if event == "line":
            # Capture a copy of local variables at each line
            locals_copy = {k: str(v) for k, v in frame.f_locals.items() if not k.startswith('__')}
            trace_steps.append({
                "line": frame.f_lineno,
                "locals": locals_copy,
            })
        return tracer

    # Redirect stdout to capture print statements
    original_stdout = sys.stdout
    sys.stdout = output_buffer
    
    sys.settrace(tracer)
    
    try:
        # The exec() function executes the code, and tracer() captures the steps
        exec(code_str, {})
    except Exception as e:
        # Capture the exception details
        trace_steps.append({
            "error": str(e),
            "line": sys.exc_info()[2].tb_lineno
        })
    finally:
        sys.settrace(None)
        # Restore original stdout
        sys.stdout = original_stdout

    return {
        "trace": trace_steps,
        "output": output_buffer.getvalue()
    }

def generate_simple_flowchart(code_str):
    """Generates a simplified Mermaid flowchart from Python code."""
    flowchart = "graph TD\n"
    lines = code_str.strip().split('\n')
    
    last_node = "Start"
    node_counter = 0

    for i, line in enumerate(lines):
        trimmed_line = line.strip()
        if not trimmed_line:
            continue

        node_counter += 1
        node_id = f"L{node_counter}"
        
        # A very basic parser to identify control flow
        if trimmed_line.startswith('def'):
            func_name = trimmed_line.split('(')[0][4:]
            flowchart += f"    {last_node} --> {node_id}[Function: {func_name}];\n"
        elif trimmed_line.startswith(('if', 'elif')):
            condition = trimmed_line.replace(':', '')
            flowchart += f"    {last_node} --> {node_id}{{{condition}}};\n"
            flowchart += f"    {node_id} -- True --> L{node_counter+1};\n"
            flowchart += f"    {node_id} -- False --> End;\n" # Simplified for this example
        elif trimmed_line.startswith(('for', 'while')):
            loop_expr = trimmed_line.replace(':', '')
            flowchart += f"    {last_node} --> {node_id}[Loop: {loop_expr}];\n"
            flowchart += f"    {node_id} -- Iterate --> L{node_counter+1};\n"
            flowchart += f"    {node_id} -- Done --> End;\n" # Simplified
        else:
            flowchart += f"    {last_node} --> {node_id}[{trimmed_line}];\n"
        
        last_node = node_id

    flowchart += f"    {last_node} --> End(End);"
    return flowchart

# --------- API endpoints ---------
@app.post("/trace")
def trace():
    try:
        # Force JSON parsing and catch any errors
        data = request.get_json(force=True)
    except Exception as e:
        # Return a clear error message to the frontend
        return jsonify({"error": f"Invalid JSON received: {str(e)}"}), 400

    code = data.get("code")
    if not isinstance(code, str):
        return jsonify({"error": "Request must include a 'code' field with a string value."}), 400

    try:
        result = run_with_trace(code)
        # Check for any errors during execution and return a 400 if one occurred
        if any('error' in step for step in result.get('trace', [])):
            error_step = next(step for step in result['trace'] if 'error' in step)
            return jsonify({"error": error_step['error'], "trace": result['trace']}), 400
        
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": f"Internal server error during tracing: {str(e)}"}), 500

# Update the @app.post("/flowchart") route in the same way.
@app.post("/flowchart")
def flowchart():
    try:
        data = request.get_json(force=True)
    except Exception as e:
        return jsonify({"error": f"Invalid JSON received: {str(e)}"}), 400

    code = data.get("code")
    if not isinstance(code, str):
        return jsonify({"error": "Request must include a 'code' field with a string value."}), 400

    mermaid_code = generate_simple_flowchart(code)
    return jsonify({"mermaid": mermaid_code}), 200

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=8000, debug=True)