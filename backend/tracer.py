import sys
import io

import sys
import io
import copy

def run_with_trace(code_str: str):
    """Executes Python code and captures a step-by-step trace including the call stack."""
    trace_steps = []
    output_buffer = io.StringIO()
    call_stack = []

    def tracer(frame, event, arg):
        nonlocal call_stack
        
        # --- NEW: Capture call and return events ---
        if event == "call":
            func_name = frame.f_code.co_name
            call_stack.append(func_name)
        
        if event == "line":
            locals_copy = {k: repr(v) for k, v in frame.f_locals.items() if not k.startswith('__')}
            trace_steps.append({
                "line": frame.f_lineno,
                "locals": locals_copy,
                "stack": copy.deepcopy(call_stack) # Add a snapshot of the stack
            })

        if event == "return":
            if call_stack:
                call_stack.pop()

        return tracer

    original_stdout = sys.stdout
    sys.stdout = output_buffer
    
    sys.settrace(tracer)
    
    try:
        exec(code_str, {})
    except Exception as e:
        trace_steps.append({
            "error": str(e),
            "line": getattr(e, '__traceback__', None).tb_lineno if hasattr(e, '__traceback__') else None,
            "stack": copy.deepcopy(call_stack)
        })
    finally:
        sys.settrace(None)
        sys.stdout = original_stdout

    return {
        "trace": trace_steps,
        "output": output_buffer.getvalue()
    }
    
def generate_simple_flowchart(code_str: str):
    """Generates a simplified Mermaid flowchart from Python code."""
    flowchart = "graph TD\n"
    lines = code_str.strip().split('\n')
    
    last_node = "Start"
    node_counter = 0
    
    # This is a simplified parser and serves as an example
    for i, line in enumerate(lines):
        trimmed_line = line.strip()
        if not trimmed_line or trimmed_line.startswith('#'):
            continue

        node_counter += 1
        node_id = f"N{node_counter}"
        # Sanitize line for Mermaid syntax
        sanitized_line = trimmed_line.replace('"', '#quot;')

        if trimmed_line.startswith(('if', 'elif')):
            condition = sanitized_line.replace(':', '')
            flowchart += f'    {last_node} --> {node_id}{{{condition}}};\n'
            # Simplified branching for demonstration
            last_node = node_id
        elif trimmed_line.startswith(('for', 'while')):
            loop_expr = sanitized_line.replace(':', '')
            flowchart += f'    {last_node} --> {node_id}[Loop: {loop_expr}];\n'
            last_node = node_id
        else:
            flowchart += f'    {last_node} --> {node_id}["{sanitized_line}"];\n'
            last_node = node_id

    flowchart += f"    {last_node} --> End(End);"
    return flowchart