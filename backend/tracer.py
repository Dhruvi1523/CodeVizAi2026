import json
import sys
import linecache
import io
from contextlib import redirect_stdout

# =========================
# Python Advanced Tracer
# =========================
trace_data = []

def safe_serialize(value, maxlen=120):
    """Convert Python object to JSON-safe string."""
    try:
        if isinstance(value, (int, float, str, bool, type(None))):
            s = str(value)
            return s if len(s) <= maxlen else s[:maxlen] + "..."
        if callable(value):
            return f"<function {getattr(value, '__name__', 'lambda')}>"
        if isinstance(value, type):
            return f"<class {value.__name__}>"
        if isinstance(value, dict):
            items = list(value.items())[:5]
            return {k: safe_serialize(v) for k, v in items} | (
                {"...": "..."} if len(value) > 5 else {}
            )
        if isinstance(value, (list, tuple, set)):
            seq = list(value)[:5]
            result = [safe_serialize(v) for v in seq]
            if len(value) > 5:
                result.append("...")
            return result if not isinstance(value, tuple) else tuple(result)
        s = str(value)
        return s if len(s) <= maxlen else s[:maxlen] + "..."
    except Exception:
        return "<unserializable>"

def get_call_stack(frame):
    """Get the function call stack from a frame."""
    stack = []
    while frame:
        name = frame.f_code.co_name
        if name in ("run_asgi", "handle", "run_endpoint_function", "<module>"):
            break
        stack.append(name)
        frame = frame.f_back
    return list(reversed(stack))

def tracer(frame, event, arg):
    """The main tracer function called by sys.settrace."""
    global trace_data
    if event == "line":
        trace_data.append({
            "event": "line",
            "line": frame.f_lineno,
            "function": frame.f_code.co_name,
            "locals": {k: safe_serialize(v) for k, v in frame.f_locals.items() if k != "__builtins__"},
            "call_stack": get_call_stack(frame)
        })
    # You can add handlers for 'call', 'return', 'exception' here if needed
    return tracer

def run_python(code: str):
    """Compiles and runs Python code with tracing, capturing output."""
    global trace_data
    trace_data = []
    filename = "<user_code>"
    
    try:
        compiled = compile(code, filename, "exec")
    except SyntaxError as e:
        return {"error": f"Syntax Error: {e}", "trace": [], "output": ""}

    env = {}
    lines = code.splitlines(True)
    linecache.cache[filename] = (len(code), None, lines, filename)
    
    output_stream = io.StringIO()
    
    sys.settrace(tracer)
    try:
        with redirect_stdout(output_stream):
            exec(compiled, env, env)
    except Exception as e:
        # Capture runtime errors
        exc_type, exc_value, exc_traceback = sys.exc_info()
        line = exc_traceback.tb_lineno
        sys.settrace(None)
        error_message = f"Error on line {line}: {e}"
        return {"error": error_message, "trace": trace_data, "output": output_stream.getvalue()}
    finally:
        sys.settrace(None)
        
    return {"trace": trace_data, "output": output_stream.getvalue()}

def run_with_trace(language: str, code: str):
    """Main runner function to select language."""
    try:
        if language == "python":
            return run_python(code)
        # Add other languages like javascript here if needed
        else:
            return {"error": f"Language '{language}' not supported"}
    except Exception as e:
        return {"error": str(e)}
