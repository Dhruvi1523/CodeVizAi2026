import sys
import linecache

#it's global list stores all tracing events as dictionarie
trace_data = []

#convert arbitary python values into JSON
def safe_serialize(value, maxlen=120):
    """Convert any Python object to a JSON-safe, readable form."""
    try:
        if isinstance(value, (int, float, str, bool, type(None))):
            s = str(value)
            return s if len(s) <= maxlen else s[:maxlen] + "..."

        if callable(value):  # functions, lambdas, methods
            return f"<function {getattr(value, '_name_', 'lambda')}>"

        if isinstance(value, type):  # classes
            return f"<class {value._name_}>"

        if isinstance(value, dict):
            # show only first 5 items for brevity
            items = list(value.items())[:5]
            return {k: safe_serialize(v) for k, v in items} | (
                {"...": "..."} if len(value) > 5 else {}
            )

        if isinstance(value, (list, tuple, set)):
            seq = list(value)[:5]  # first 5 elements
            result = [safe_serialize(v) for v in seq]
            if len(value) > 5:
                result.append("...")
            return result if not isinstance(value, tuple) else tuple(result)

        # fallback: stringify safely
        s = str(value)
        return s if len(s) <= maxlen else s[:maxlen] + "..."
    except Exception:
        return "<unserializable>"

def get_call_stack(frame):
    stack = []
    while frame:
        name = frame.f_code.co_name
        if name in ("run_asgi", "handle", "run_endpoint_function"):
            break
        stack.append(name)
        frame = frame.f_back
    return list(reversed(stack))

def tracer(frame, event, arg):
    if event == "line":
        trace_data.append({
            "event": "line",
            "line": frame.f_lineno,
            "function": frame.f_code.co_name,
            "locals": {k: safe_serialize(v) 
                       for k, v in frame.f_locals.items() 
                       if k != "_builtins_"},
            "globals": {k: safe_serialize(v) for k, v in frame.f_globals.items()
                        if not k.startswith("") and k not in ("sys", "_builtins_")},
            "call_stack": get_call_stack(frame)
        })
    elif event == "return":
        trace_data.append({
            "event": "return",
            "function": frame.f_code.co_name,
            "return_value": safe_serialize(arg),
            "locals": {k: safe_serialize(v) 
                       for k, v in frame.f_locals.items() 
                       if k != "_builtins_"}
        })
    elif event == "call":
        trace_data.append({
            "event": "call",
            "function": frame.f_code.co_name,
            "locals": {k: safe_serialize(v) 
                       for k, v in frame.f_locals.items() 
                       if k != "_builtins_"}
        })
    elif event == "exception":
        exc_type, exc_value, _ = arg
        trace_data.append({
            "event": "exception",
            "function": frame.f_code.co_name,
            "line": frame.f_lineno,
            "code": linecache.getline(frame.f_code.co_filename, frame.f_lineno).strip(),
            "exception_type": exc_type._name_,
            "message": str(exc_value)
        })
    return tracer

def run_with_trace(code: str):
    global trace_data
    trace_data = []

    filename = "<user_code>"
    compiled = compile(code, filename, "exec")
    env = {}

    # Load the code into linecache so getline() can find it
    lines = code.splitlines(True)
    linecache.cache[filename] = (len(code), None, lines, filename)

    sys.settrace(tracer)
    try:
        exec(compiled, env, env)
    except Exception as e:
        sys.settrace(None)
        return {"error": str(e), "trace": trace_data}
    finally:
        sys.settrace(None)

    return {"trace": trace_data}
