# tracer.py

import sys
import io
import copy
import inspect
import ast
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# --- FastAPI App Setup ---
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CodeRequest(BaseModel):
    code: str

# --- Tracing Logic ---

class CallTreeNode:
    """A class to represent a node in our call tree for recursion."""
    def __init__(self, name, args, step_index, parent_id=None):
        self.id = id(self)
        self.parent_id = parent_id
        self.name = name
        self.args = args
        self.start_step = step_index
        self.end_step = -1
        self.children = []
        self.return_value = None

    def to_dict(self):
        """Converts the node and its children to a dictionary."""
        return {
            "id": self.id,
            "parent_id": self.parent_id,
            "name": self.name,
            "args": self.args,
            "start_step": self.start_step,
            "end_step": self.end_step,
            "children": [child.to_dict() for child in self.children],
            "return_value": self.return_value,
        }

def serialize_value(v):
    """Converts a Python object into a structured dictionary for the frontend."""
    if isinstance(v, (int, float, str, bool, type(None))):
        return {"type": "primitive", "value": v}
    
    if isinstance(v, list):
        # Limit list size to avoid performance issues with huge lists
        snapshot = [repr(item) for item in v[:50]]
        value = [serialize_value(item) for item in v[:50]]
        return {"type": "list", "id": id(v), "value": value, "snapshot": snapshot}

    # Fallback for other objects
    if hasattr(v, '__dict__'):
        return {"type": "object", "id": id(v), "class_name": v.__class__.__name__}
        
    return {"type": "other", "value": repr(v)}

def _parse_line_event(line, frame):
    """Use AST to understand what's happening on a line."""
    try:
        tree = ast.parse(line.strip())
        if not tree.body: return line.strip()
        node = tree.body[0]
        
        # Detect conditional statements (if, while)
        if isinstance(node, (ast.If, ast.While)):
            try:
                # Get the string representation of the condition (e.g., "n > 0")
                condition_str = ast.unparse(node.test).strip()
                # Evaluate the condition in the current frame to get the True/False result
                result = bool(eval(condition_str, frame.f_globals, frame.f_locals))
                return {
                    "type": "condition_check",
                    "condition_str": condition_str,
                    "result": result
                }
            except Exception:
                # If evaluation fails, fall back to the default behavior
                pass
        
        # Detect print function calls
        if isinstance(node, ast.Expr) and isinstance(node.value, ast.Call) and isinstance(node.value.func, ast.Name) and node.value.func.id == 'print':
            if node.value.args:
                try:
                    # Evaluate the argument to get the printed value
                    printed_value = eval(ast.unparse(node.value.args[0]), frame.f_globals, frame.f_locals)
                    return {
                        "type": "print_event",
                        "value": printed_value
                    }
                except Exception:
                    pass
        
        # Detect loops
        if isinstance(node, (ast.For, ast.While)):
            # Special handling to find the loop variable in a for loop
            loop_variable = None
            if isinstance(node, ast.For) and isinstance(node.target, ast.Name):
                loop_variable = node.target.id
                
            return {
                "type": "loop_iteration",
                "loop_type": "for" if isinstance(node, ast.For) else "while",
                "iteration": -1, # This will be filled by the tracer
                "loop_variable": {"name": loop_variable, "value": None}
            }

        # Detect list method calls (e.g., my_list.append(10))
        if isinstance(node, ast.Expr) and isinstance(node.value, ast.Call):
            call_node = node.value
            if isinstance(call_node.func, ast.Attribute) and hasattr(call_node.func.value, 'id'):
                var_name = call_node.func.value.id
                method_name = call_node.func.attr
                try:
                    arg_values = [eval(ast.unparse(arg), frame.f_globals, frame.f_locals) for arg in call_node.args]
                    list_obj = eval(var_name, frame.f_globals, frame.f_locals)
                    list_snapshot = copy.copy(list_obj) if isinstance(list_obj, list) else None
                    return {
                        "type": "array_operation",
                        "variable": var_name,
                        "method": method_name,
                        "args": [repr(arg) for arg in arg_values],
                        "list_snapshot": list_snapshot
                    }
                except Exception:
                    pass

        if isinstance(node, ast.Assign):
            # Detect binary operations (e.g., c = a + b)
            if isinstance(node.value, ast.BinOp):
                op_map = {ast.Add: '+', ast.Sub: '-', ast.Mult: '*', ast.Div: '/', ast.Mod: '%', ast.Pow: '**', ast.LShift: '<<', ast.RShift: '>>', ast.BitOr: '|', ast.BitAnd: '&', ast.BitXor: '^', ast.FloorDiv: '//'}
                try:
                    left_name, right_name = ast.unparse(node.value.left).strip(), ast.unparse(node.value.right).strip()
                    left_val, right_val = eval(left_name, frame.f_globals, frame.f_locals), eval(right_name, frame.f_globals, frame.f_locals)
                    result_val = eval(ast.unparse(node.value).strip(), frame.f_globals, frame.f_locals)
                    return {
                        "type": "binary_operation", "operands": {left_name: left_val, right_name: right_val},
                        "operator": op_map.get(type(node.value.op), '?'), "result_variable": node.targets[0].id, "result_value": result_val
                    }
                except Exception: pass
            
            # Detect list item assignment (e.g., my_list[0] = 100)
            if isinstance(node.targets[0], ast.Subscript):
                try:
                    var_name = node.targets[0].value.id
                    list_obj = eval(var_name, frame.f_globals, frame.f_locals)
                    list_snapshot = copy.copy(list_obj) if isinstance(list_obj, list) else None
                    return {
                        "type": "array_operation",
                        "variable": var_name,
                        "method": "assign_at_index",
                        "args": [],
                        "list_snapshot": list_snapshot
                    }
                except Exception: pass

            # Detect simple assignments (e.g., a = 10)
            try:
                value = eval(ast.unparse(node.value), frame.f_globals, frame.f_locals)
                return {"type": "assignment", "variable": node.targets[0].id, "value": value}
            except Exception: pass

        # Detect augmented assignments (e.g., result *= i)
        if isinstance(node, ast.AugAssign):
            op_map = {ast.Add: '+', ast.Sub: '-', ast.Mult: '*', ast.Div: '/', ast.Mod: '%', ast.Pow: '**', ast.LShift: '<<', ast.RShift: '>>', ast.BitOr: '|', ast.BitAnd: '&', ast.BitXor: '^', ast.FloorDiv: '//'}
            try:
                target_name = ast.unparse(node.target).strip()
                value_name = ast.unparse(node.value).strip()

                # Get values *before* the operation
                target_val = eval(target_name, frame.f_globals, frame.f_locals)
                value_val = eval(value_name, frame.f_globals, frame.f_locals)

                # Manually calculate the result of the operation
                operator_str = op_map.get(type(node.op), '?')
                result_val = eval(f"{target_val} {operator_str} {value_val}")

                return {
                    "type": "binary_operation",
                    "operands": {target_name: target_val, value_name: value_val},
                    "operator": operator_str,
                    "result_variable": target_name,
                    "result_value": result_val
                }
            except Exception:
                pass

        return line.strip() # Fallback for unhandled lines
    except Exception:
        return line.strip()

def run_with_trace(code_str: str):
    trace_steps = []
    output_buffer = io.StringIO()
    call_stack = []
    call_tree_root = None
    node_stack = []
    source_lines_cache = {}
    
    loop_states = {}

    def tracer(frame, event, arg):
        nonlocal call_stack, call_tree_root, node_stack, loop_states
        
        func_name = frame.f_code.co_name
        lineno = frame.f_lineno
        current_step_index = len(trace_steps)

        if frame.f_code not in source_lines_cache:
            try:
                source_lines_cache[frame.f_code] = inspect.getsourcelines(frame.f_code)[0]
            except (TypeError, OSError):
                source_lines_cache[frame.f_code] = code_str.strip().split('\n')

        line_text = ""
        if source_lines_cache[frame.f_code]:
            line_index = lineno - frame.f_code.co_firstlineno
            if 0 <= line_index < len(source_lines_cache[frame.f_code]):
                line_text = source_lines_cache[frame.f_code][line_index]
        
        if event == "line":
            current_line_trimmed = line_text.strip()
            if current_line_trimmed.startswith(('for ', 'while ')):
                loop_key = (frame.f_code, lineno)
                loop_states[loop_key] = {"iteration": 0, "start_line": lineno}
            
            parent_frame = frame.f_back
            if parent_frame and parent_frame.f_code:
                try:
                    parent_line_text = inspect.getsourcelines(parent_frame.f_code)[0][parent_frame.f_lineno - parent_frame.f_code.co_firstlineno].strip()
                    if parent_line_text.startswith(('for ', 'while ')):
                        loop_key = (parent_frame.f_code, parent_frame.f_lineno)
                        if loop_key in loop_states:
                            loop_states[loop_key]["iteration"] += 1
                            loop_event = {
                                "type": "loop_iteration",
                                "loop_type": "for" if parent_line_text.startswith('for') else "while",
                                "iteration": loop_states[loop_key]["iteration"],
                                "start_line": loop_states[loop_key]["start_line"]
                            }
                            if loop_event["loop_type"] == "for":
                                loop_ast = ast.parse(parent_line_text)
                                if isinstance(loop_ast.body[0], ast.For) and isinstance(loop_ast.body[0].target, ast.Name):
                                    var_name = loop_ast.body[0].target.id
                                    if var_name in frame.f_locals:
                                        loop_event["loop_variable"] = {
                                            "name": var_name,
                                            "value": frame.f_locals[var_name]
                                        }
                            
                            trace_steps.append({
                                "line": lineno,
                                "event": loop_event,
                                "locals": {k: serialize_value(v) for k, v in frame.f_locals.items() if not k.startswith('__')},
                                "stack": copy.deepcopy(call_stack)
                            })
                            return tracer
                except Exception:
                    pass

        if event == "call":
            if func_name != '<module>':
                call_stack.append(func_name)
                try:
                    args = inspect.getargvalues(frame).locals
                    args_repr = {k: repr(v) for k, v in args.items()}
                except Exception:
                    args_repr = {}
                parent_id = node_stack[-1].id if node_stack else None
                new_node = CallTreeNode(func_name, args_repr, current_step_index, parent_id)
                if not call_tree_root:
                    call_tree_root = new_node
                elif node_stack:
                    node_stack[-1].children.append(new_node)
                node_stack.append(new_node)

        if event == "line":
            line_event = _parse_line_event(line_text, frame)
            locals_copy = {k: serialize_value(v) for k, v in frame.f_locals.items() if not k.startswith('__')}
            trace_steps.append({
                "line": lineno, "event": line_event, "locals": locals_copy,
                "stack": copy.deepcopy(call_stack),
            })
        
        if event == "return":
            if call_stack and call_stack[-1] == func_name:
                call_stack.pop()

            # +++ NEW: Added logic for simple (non-recursive) returns +++
            if func_name != '<module>' and not (node_stack and node_stack[-1].name == func_name):
                 trace_steps.append({
                    "line": lineno,
                    "event": { "type": "return_value", "value": serialize_value(arg) },
                    "locals": {k: serialize_value(v) for k, v in frame.f_locals.items() if not k.startswith('__')},
                    "stack": copy.deepcopy(call_stack)
                })

            if func_name != '<module>' and node_stack and node_stack[-1].name == func_name:
                node = node_stack.pop()
                node.return_value = serialize_value(arg)
                node.end_step = len(trace_steps)
                
                if node_stack:
                    parent_node = node_stack[-1]
                    trace_steps.append({
                        "line": frame.f_back.f_lineno if frame.f_back else frame.f_lineno,
                        "event": { "type": "function_return_used", "source_node_id": node.id, "target_node_id": parent_node.id, "value": node.return_value },
                        "locals": {k: serialize_value(v) for k, v in frame.f_back.f_locals.items() if not k.startswith('__')} if frame.f_back else {},
                        "stack": copy.deepcopy(call_stack)
                    })
                else: # Root return
                    trace_steps.append({
                        "line": lineno,
                        "event": { "type": "function_root_return", "source_node_id": node.id, "value": node.return_value },
                        "locals": {},
                        "stack": copy.deepcopy(call_stack)
                    })
        return tracer

    original_stdout = sys.stdout
    sys.stdout = output_buffer
    sys.settrace(tracer)
    try:
        global_scope = {'__name__': '__main__'}
        compiled_code = compile(code_str, '<string>', 'exec')
        exec(compiled_code, global_scope)
    except Exception as e:
        output_buffer.write(f"\n--- ERROR ---\n{type(e).__name__}: {e}")
    finally:
        sys.settrace(None)
        sys.stdout = original_stdout
    return {
        "trace": trace_steps, "output": output_buffer.getvalue(),
        "call_tree": call_tree_root.to_dict() if call_tree_root else None
    }

def generate_simple_flowchart(code_str: str):
    flowchart = "graph TD\n"
    flowchart += "    classDef loop_node fill:#8b5cf6,stroke:#a78bfa,stroke-width:2px;\n"
    lines = code_str.strip().split('\n')
    last_node_id = "Start(Start)"
    flowchart += f"    {last_node_id}\n"
    node_counter = 0
    indent_level_stack = [(-1, "Start")]
    
    last_loop_node = None

    for i, line in enumerate(lines):
        line_number = i + 1
        trimmed_line = line.strip()
        if not trimmed_line or trimmed_line.startswith('#'): continue

        node_counter += 1
        node_id = f"N{node_counter}_L{line_number}"
        sanitized_line = trimmed_line.replace('"', '#quot;')
        current_indent = len(line) - len(line.lstrip(' '))
        
        while indent_level_stack and current_indent <= indent_level_stack[-1][0]:
            indent_level_stack.pop()
        
        from_node_id = indent_level_stack[-1][1]
        
        if trimmed_line.startswith(('if', 'elif', 'for', 'while')):
            flowchart += f'    {from_node_id} --> {node_id}{{{sanitized_line}}};\n'
            indent_level_stack.append((current_indent, node_id))
            last_loop_node = node_id
            if trimmed_line.startswith(('for', 'while')):
                flowchart += f'    class {node_id} loop_node;\n'
        else:
            flowchart += f'    {from_node_id} --> {node_id}["{sanitized_line}"];\n'
            if indent_level_stack and current_indent == indent_level_stack[-1][0]:
                indent_level_stack[-1] = (current_indent, node_id)
            else:
                indent_level_stack.append((current_indent, node_id))
                
        if last_loop_node and current_indent < indent_level_stack[-1][0] and (trimmed_line.startswith(('if', 'elif')) is False):
             flowchart += f'    {node_id} --- {last_loop_node};'
             last_loop_node = None
             
    last_actual_node = f"N{node_counter}_L{line_number}" if node_counter > 0 else "Start"
    flowchart += f"    {last_actual_node} --> End(End);"
    return flowchart

@app.post("/trace")
def trace_code_endpoint(request: CodeRequest):
    try:
        return run_with_trace(request.code)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/flowchart")
def create_flowchart_endpoint(request: CodeRequest):
    try:
        return {"mermaid": generate_simple_flowchart(request.code)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))