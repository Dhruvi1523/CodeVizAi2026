
# # --- IMPORTS ---
# import sys
# import io
# import copy
# import inspect
# import ast

# # --- AST ANALYSIS (STATIC) ---
# class CodeAnalyzer(ast.NodeVisitor):
#     def __init__(self):
#         self.line_event_map = {}
#         self.loop_context_map = {}

#     def visit_Assign(self, node):
#         lineno = node.lineno
#         # ⭐ CHANGED: Detects my_list[i] = value
#         if isinstance(node.targets[0], ast.Subscript):
#             self.line_event_map[lineno] = {
#                 "type": "array_operation",
#                 "method": "assign_at_index", # This tells the frontend which animation to use
#                 "target_var": ast.unparse(node.targets[0].value).strip(),
#                 "slice_str": ast.unparse(node.targets[0].slice).strip(),
#                 "value_str": ast.unparse(node.value).strip(),
#             }
#         elif isinstance(node.value, ast.BinOp):
#             # ... (binary operation logic remains the same)
#             op_map = {ast.Add: '+', ast.Sub: '-', ast.Mult: '*', ast.Div: '/', ast.Mod: '%', ast.Pow: '**', ast.LShift: '<<', ast.RShift: '>>', ast.BitOr: '|', ast.BitAnd: '&', ast.BitXor: '^', ast.FloorDiv: '//'}
#             self.line_event_map[lineno] = {
#                 "type": "binary_operation",
#                 "target_var": ast.unparse(node.targets[0]).strip(),
#                 "left_str": ast.unparse(node.value.left).strip(),
#                 "right_str": ast.unparse(node.value.right).strip(),
#                 "op_str": op_map.get(type(node.value.op), '?'),
#             }
#         else:
#             # ... (simple assignment logic remains the same)
#             self.line_event_map[lineno] = {
#                 "type": "assignment",
#                 "target_var": ast.unparse(node.targets[0]).strip(),
#                 "value_str": ast.unparse(node.value).strip(),
#             }
#         self.generic_visit(node)

#     def visit_AugAssign(self, node):
#         lineno = node.lineno
#         op_map = {ast.Add: '+', ast.Sub: '-', ast.Mult: '*', ast.Div: '/', ast.Mod: '%', ast.Pow: '**', ast.LShift: '<<', ast.RShift: '>>', ast.BitOr: '|', ast.BitAnd: '&', ast.BitXor: '^', ast.FloorDiv: '//'}
#         self.line_event_map[lineno] = {
#             "type": "binary_operation",
#             "target_var": ast.unparse(node.target).strip(),
#             "left_str": ast.unparse(node.target).strip(),
#             "right_str": ast.unparse(node.value).strip(),
#             "op_str": op_map.get(type(node.op), '?'),
#         }
#         self.generic_visit(node)

#     def visit_Expr(self, node):
#         lineno = node.lineno
#         if isinstance(node.value, ast.Call):
#             call = node.value
#             # ... (print logic remains the same)
#             if isinstance(call.func, ast.Name) and call.func.id == 'print':
#                 self.line_event_map[lineno] = {
#                     "type": "print_event",
#                     "arg_strs": [ast.unparse(arg).strip() for arg in call.args]
#             }
#             # ⭐ CHANGED: Detects my_list.append(), my_list.pop(), etc.
#             elif isinstance(call.func, ast.Attribute):
#                 # Check if it's a common list method
#                 if call.func.attr in ['append', 'pop', 'insert', 'remove']:
#                      self.line_event_map[lineno] = {
#                         "type": "array_operation",
#                         "method": call.func.attr, # e.g., 'append'
#                         "target_var": ast.unparse(call.func.value).strip(),
#                         "arg_strs": [ast.unparse(arg).strip() for arg in call.args]
#                     }
#         self.generic_visit(node)

#     def visit_Delete(self, node):
#         lineno = node.lineno
#         if isinstance(node.targets[0], ast.Subscript):
#             self.line_event_map[lineno] = {
#                 "type": "array_operation",
#                 "method": "delete_by_index",
#                 "target_var": ast.unparse(node.targets[0].value).strip(),
#                 "slice_str": ast.unparse(node.targets[0].slice).strip(),
#             }
#         self.generic_visit(node)

#     def visit_If(self, node):
#         self.line_event_map[node.lineno] = {
#             "type": "condition_check",
#             "condition_str": ast.unparse(node.test).strip()
#         }
#         self.generic_visit(node)
        
#     def visit_Return(self, node):
#         if node.value:
#             self.line_event_map[node.lineno] = {
#                 "type": "return_statement",
#                 "value_str": ast.unparse(node.value).strip()
#             }
#         self.generic_visit(node)

#     def visit_While(self, node):
#         self.line_event_map[node.lineno] = {
#             "type": "condition_check",
#             "condition_str": ast.unparse(node.test).strip()
#         }
#         for body_node in node.body:
#             for i in range(body_node.lineno, getattr(body_node, 'end_lineno', body_node.lineno) + 1):
#                 self.loop_context_map[i] = { "type": "while", "loop_line": node.lineno }
#         self.generic_visit(node)

#     def visit_For(self, node):
#         loop_line = node.lineno
#         variable = getattr(node.target, 'id', 'loop_var')
#         iterable = ast.unparse(node.iter).strip()
#         self.line_event_map[loop_line] = { "type": "for_loop_start" }
#         if node.body:
#             start_line = node.body[0].lineno
#             end_line = max(getattr(item, 'end_lineno', item.lineno) for item in node.body)
#             for i in range(start_line, end_line + 1):
#                 self.loop_context_map[i] = {
#                     'type': 'for', 'loop_line': loop_line, 'variable': variable,
#                     'iterable': iterable, 'start_line': start_line
#                 }
#         self.generic_visit(node)

# # --- Tracing Data Structures & Helpers ---
# class CallTreeNode:
#     def __init__(self, name, args, step_index, parent_id=None):
#         self.id = id(self)
#         self.parent_id = parent_id
#         self.name = name
#         self.args = args
#         self.start_step = step_index
#         self.end_step = -1
#         self.children = []
#         self.return_value = None

#     def to_dict(self):
#         return {
#             "id": self.id, "parent_id": self.parent_id, "name": self.name,
#             "args": self.args, "start_step": self.start_step, "end_step": self.end_step,
#             "children": [child.to_dict() for child in self.children],
#             "return_value": self.return_value,
#         }

# def serialize_value(v):
#     if isinstance(v, (int, float, str, bool, type(None))):
#         return {"type": "primitive", "value": v}
#     if isinstance(v, list):
#         return {"type": "list", "id": id(v), "value": [serialize_value(item) for item in v[:50]]}
#     if isinstance(v, dict):
#         return {"type": "dict", "id": id(v), "value": {str(k): serialize_value(val) for k, val in list(v.items())[:25]}}
#     if hasattr(v, '__dict__'):
#         return {"type": "object", "id": id(v), "class_name": v.__class__.__name__}
#     return {"type": "other", "value": repr(v)}

# def _enrich_event(static_event, frame):
#     event = copy.deepcopy(static_event)
#     g, l = frame.f_globals, frame.f_locals
#     try:
#         # We now use serialize_value to ensure lists, primitives, etc.
#         # are all packaged in the same consistent object format.
#         if event["type"] in ["assignment", "return_statement"]:
#             raw_value = eval(event["value_str"], g, l)
#             event["value"] = serialize_value(raw_value)

#         elif event["type"] == "binary_operation":
#             event["left_val"] = eval(event["left_str"], g, l)
#             event["right_val"] = eval(event["right_str"], g, l)
#             event["result_val"] = eval(f"{event['left_str']} {event['op_str']} {event['right_str']}", g, l)
#         elif event["type"] == "condition_check":
#             event["result"] = bool(eval(event["condition_str"], g, l))
            
#         elif event["type"] == "print_event":
#          try:
#             arg_strs = event["arg_strs"]

#             evaluated_args = [eval(s, g, l) for s in arg_strs]
#             # Simulate Python's print() by converting each arg to a string and joining with spaces
#             final_output_string = " ".join(map(str, evaluated_args))
          
#             event["output"] = serialize_value(final_output_string)
          
#             event["arguments"] = []
#             for i, original_string in enumerate(arg_strs):
#               event["arguments"].append({
#                 "str": original_string,
#                 "value": serialize_value(evaluated_args[i]) # Use your serializer!
#         })
#             if "value" in event:
#                 del event["value"]
#          except Exception as e:
#                     # This is a safety net in case an argument can't be evaluated.
#                     event["arguments"] = []
#                     event["output"] = serialize_value(f"Error evaluating print: {e}")


#         elif event["type"] == "method_call":
#             target_obj = eval(event["target_var"], g, l)
#             event["list_snapshot_before"] = copy.copy(target_obj) if isinstance(target_obj, list) else None
#         elif event["type"] == "subscript_assign":
#             target_obj = eval(event["target_var"], g, l)
#             event["snapshot_before"] = copy.copy(target_obj) if isinstance(target_obj, (list, dict)) else None
#             event["index"] = eval(event["slice_str"], g, l)
#             raw_value = eval(event["value_str"], g, l)
#             event["value"] = serialize_value(raw_value)
#         elif event["type"] == "array_operation":
#                 target_obj = eval(event["target_var"], g, l)
#                 event["list_snapshot_before"] = copy.copy(target_obj)
                
#                 if event["method"] in ["assign_at_index", "delete_by_index"]:
#                     event["index"] = eval(event["slice_str"], g, l)
                
#                 if event["method"] == "assign_at_index":
#                     event["value"] = eval(event["value_str"], g, l)
                
#                 if "arg_strs" in event:
#                     event["args"] = [eval(arg, g, l) for arg in event["arg_strs"]]

#                 # Add extra context for specific methods
#                 if event["method"] == "pop" and isinstance(target_obj, list):
#                     if event["args"]: event["index"] = event["args"][0]
#                     else: event["index"] = len(target_obj) - 1
#                     event["removed_value"] = target_obj[event["index"]]

#                 if event["method"] == "remove" and isinstance(target_obj, list):
#                     event["removed_index"] = target_obj.index(event["args"][0])

#     except Exception:
#         event["eval_error"] = True
#     return event

# # --- Main Tracing Logic (Updated) ---
# def run_with_trace(code_str: str):
#     try:
#         tree = ast.parse(code_str)
#         analyzer = CodeAnalyzer()
#         analyzer.visit(tree)
#         line_event_map = analyzer.line_event_map
#         loop_context_map = analyzer.loop_context_map
#     except SyntaxError as e:
#         return {
#             "trace": [{"line": e.lineno, "event": {"type": "error", "error_type": "SyntaxError", "error_message": e.msg}, "locals": {}, "stack": []}],
#             "output": f"SyntaxError: {e.msg}", "call_tree": None
#         }

#     trace_steps = []
#     output_buffer = io.StringIO()
#     call_stack = []
#     call_tree_root = None
#     node_stack = []
#     processed_loops_on_line = set()
#     pending_trace_step = None
#     final_scope = {} # Define here to be accessible in finally and after

#     def tracer(frame, event, arg):
#         nonlocal call_stack, call_tree_root, node_stack, processed_loops_on_line, pending_trace_step
#         func_name = frame.f_code.co_name
#         lineno = frame.f_lineno

#         if pending_trace_step and event in ("line", "return"):
#             pending_trace_step["locals"] = {k: serialize_value(v) for k, v in frame.f_locals.items() if not k.startswith('__')}
#             trace_steps.append(pending_trace_step)
#             pending_trace_step = None

#         if event == "call" and func_name != '<module>':
#             processed_loops_on_line.clear()
#             call_stack.append(func_name)
#             args_repr = {k: repr(v) for k, v in inspect.getargvalues(frame).locals.items()}
#             parent_id = node_stack[-1].id if node_stack else None
#             new_node = CallTreeNode(func_name, args_repr, len(trace_steps), parent_id)
#             if not call_tree_root: call_tree_root = new_node
#             elif node_stack: node_stack[-1].children.append(new_node)
#             node_stack.append(new_node)

#         if event == "line":
#             if lineno in loop_context_map:
#                 loop_info = loop_context_map[lineno]
#                 if lineno == loop_info.get('start_line') and loop_info['loop_line'] not in processed_loops_on_line:
#                     try:
#                         current_value = frame.f_locals.get(loop_info['variable'])
#                         iterable_obj = eval(loop_info['iterable'], frame.f_globals, frame.f_locals)
#                         serialized_iterable = [serialize_value(item) for item in list(iterable_obj)]
#                         iteration_event = {"type": "loop_iteration", "loop_variable_name": loop_info['variable'], "current_value": current_value, "iterable_snapshot": serialized_iterable}
#                         locals_copy = {k: serialize_value(v) for k, v in frame.f_locals.items() if not k.startswith('__')}
#                         trace_steps.append({"line": loop_info['loop_line'], "event": iteration_event, "locals": locals_copy, "stack": copy.deepcopy(call_stack)})
#                         processed_loops_on_line.add(loop_info['loop_line'])
#                     except Exception: pass
#             else:
#                 processed_loops_on_line.clear()
            
#             static_event = line_event_map.get(lineno)
#             if static_event:
#                 is_return_statement = static_event.get("type") in ["return_statement", "for_loop_start"]
                
#                 if is_return_statement:
#                     pending_trace_step = None 
#                 else:
#                     enriched_event = _enrich_event(static_event, frame)
#                     pending_trace_step = {"line": lineno, "event": enriched_event, "stack": copy.deepcopy(call_stack)}

#         if event == "return" and func_name != '<module>':
#             return_event = {
#                 "type": "return_value", 
#                 "function_name": func_name,
#                 "value": serialize_value(arg),
#                 "return_to_line": frame.f_back.f_lineno if frame.f_back else None}
#             pending_trace_step = {"line": lineno, "event": return_event, "stack": copy.deepcopy(call_stack)}

#             if call_stack and call_stack[-1] == func_name: call_stack.pop()
#             if node_stack and node_stack[-1].name == func_name:
#                 node = node_stack.pop()
#                 node.return_value = serialize_value(arg)
#                 node.end_step = len(trace_steps) + 1
        
#         return tracer

#     original_stdout = sys.stdout
#     sys.stdout = output_buffer
#     global_scope = {'__name__': '__main__'}
#     sys.settrace(tracer)
#     try:
#         exec(compile(code_str, '<string>', 'exec'), global_scope)
#     except Exception as e:
#         error_line = trace_steps[-1]['line'] if trace_steps else -1
#         trace_steps.append({"line": error_line, "event": {"type": "error", "error_type": type(e).__name__, "error_message": str(e)}, "locals": trace_steps[-1].get('locals', {}), "stack": trace_steps[-1].get('stack', [])})
#     finally:
#         sys.settrace(None)
#         if pending_trace_step:
#             final_scope = {k: serialize_value(v) for k, v in global_scope.items() if not k.startswith('__')}
#             pending_trace_step["locals"] = final_scope
#             trace_steps.append(pending_trace_step)
        
#         sys.stdout = original_stdout
    
#     if trace_steps:
#         last_line = trace_steps[-1]['line']
#         final_locals = final_scope if final_scope else trace_steps[-1].get('locals', {})
#         trace_steps.append({
#             "line": last_line,
#             "event": {"type": "execution_finished"},
#             "locals": final_locals,
#             "stack": [] 
#         })

#     return {"trace": trace_steps, "output": output_buffer.getvalue(), "call_tree": call_tree_root.to_dict() if call_tree_root else None, "loop_context_map": loop_context_map}


# # --- Flowchart Generator (Unchanged) ---
# def generate_simple_flowchart(code_str: str):
#     flowchart = "graph TD\n"
#     flowchart += "    classDef loop_node fill:#8b5cf6,stroke:#a78bfa,stroke-width:2px;\n"
#     lines = code_str.strip().split('\n')
#     last_node_id = "Start(Start)"
#     flowchart += f"    {last_node_id}\n"
#     node_counter = 0
#     indent_level_stack = [(-1, "Start")]
#     last_loop_node = None
#     for i, line in enumerate(lines):
#         line_number = i + 1
#         trimmed_line = line.strip()
#         if not trimmed_line or trimmed_line.startswith('#'): continue
#         node_counter += 1
#         node_id = f"N{node_counter}_L{line_number}"
#         sanitized_line = trimmed_line.replace('"', '#quot;')
#         current_indent = len(line) - len(line.lstrip(' '))
#         while indent_level_stack and current_indent <= indent_level_stack[-1][0]:
#             indent_level_stack.pop()
#         from_node_id = indent_level_stack[-1][1]
#         if trimmed_line.startswith(('if', 'elif', 'for', 'while')):
#             flowchart += f'    {from_node_id} --> {node_id}{{{sanitized_line}}};\n'
#             indent_level_stack.append((current_indent, node_id))
#             last_loop_node = node_id
#             if trimmed_line.startswith(('for', 'while')):
#                 flowchart += f'    class {node_id} loop_node;\n'
#         else:
#             flowchart += f'    {from_node_id} --> {node_id}["{sanitized_line}"];\n'
#             if indent_level_stack and current_indent == indent_level_stack[-1][0]:
#                 indent_level_stack[-1] = (current_indent, node_id)
#             else:
#                 indent_level_stack.append((current_indent, node_id))
#         if last_loop_node and current_indent < indent_level_stack[-1][0] and not trimmed_line.startswith(('if', 'elif')):
#             flowchart += f'    {node_id} --- {last_loop_node};'
#             last_loop_node = None
#     last_actual_node = f"N{node_counter}_L{line_number}" if node_counter > 0 else "Start"
#     flowchart += f"    {last_actual_node} --> End(End);"
#     return flowchart


# --- IMPORTS ---
import sys
import io
import copy
import inspect
import ast

# --- AST ANALYSIS (STATIC) ---
class CodeAnalyzer(ast.NodeVisitor):
    def __init__(self):
        self.line_event_map = {}
        self.loop_context_map = {}

    def visit_Assign(self, node):
        lineno = node.lineno
        if isinstance(node.targets[0], ast.Subscript):
            self.line_event_map[lineno] = {
                "type": "array_operation",
                "method": "assign_at_index",
                "target_var": ast.unparse(node.targets[0].value).strip(),
                "slice_str": ast.unparse(node.targets[0].slice).strip(),
                "value_str": ast.unparse(node.value).strip(),
            }
        elif isinstance(node.value, ast.BinOp):
            op_map = {ast.Add: '+', ast.Sub: '-', ast.Mult: '*', ast.Div: '/', ast.Mod: '%', ast.Pow: '**', ast.LShift: '<<', ast.RShift: '>>', ast.BitOr: '|', ast.BitAnd: '&', ast.BitXor: '^', ast.FloorDiv: '//'}
            self.line_event_map[lineno] = {
                "type": "binary_operation",
                "target_var": ast.unparse(node.targets[0]).strip(),
                "left_str": ast.unparse(node.value.left).strip(),
                "right_str": ast.unparse(node.value.right).strip(),
                "op_str": op_map.get(type(node.value.op), '?'),
                "result_variable": ast.unparse(node.targets[0]).strip()
            }
        else:
            self.line_event_map[lineno] = {
                "type": "assignment",
                "target_var": ast.unparse(node.targets[0]).strip(),
                "value_str": ast.unparse(node.value).strip(),
            }
        self.generic_visit(node)

    def visit_AugAssign(self, node):
        lineno = node.lineno
        op_map = {ast.Add: '+', ast.Sub: '-', ast.Mult: '*', ast.Div: '/', ast.Mod: '%', ast.Pow: '**', ast.LShift: '<<', ast.RShift: '>>', ast.BitOr: '|', ast.BitAnd: '&', ast.BitXor: '^', ast.FloorDiv: '//'}
        self.line_event_map[lineno] = {
            "type": "binary_operation",
            "target_var": ast.unparse(node.target).strip(),
            "left_str": ast.unparse(node.target).strip(),
            "right_str": ast.unparse(node.value).strip(),
            "op_str": op_map.get(type(node.op), '?'),
            "result_variable": ast.unparse(node.target).strip()
        }
        self.generic_visit(node)

    def visit_Expr(self, node):
        lineno = node.lineno
        if isinstance(node.value, ast.Call):
            call = node.value
            if isinstance(call.func, ast.Name) and call.func.id == 'print':
                self.line_event_map[lineno] = {
                    "type": "print_event",
                    "arg_strs": [ast.unparse(arg).strip() for arg in call.args]
                }
            elif isinstance(call.func, ast.Attribute):
                if call.func.attr in ['append', 'pop', 'insert', 'remove']:
                     self.line_event_map[lineno] = {
                        "type": "array_operation",
                        "method": call.func.attr, 
                        "target_var": ast.unparse(call.func.value).strip(),
                        "arg_strs": [ast.unparse(arg).strip() for arg in call.args]
                    }
        self.generic_visit(node)

    def visit_Delete(self, node):
        lineno = node.lineno
        if isinstance(node.targets[0], ast.Subscript):
            self.line_event_map[lineno] = {
                "type": "array_operation",
                "method": "delete_by_index",
                "target_var": ast.unparse(node.targets[0].value).strip(),
                "slice_str": ast.unparse(node.targets[0].slice).strip(),
            }
        self.generic_visit(node)

    def visit_If(self, node):
        self.line_event_map[node.lineno] = {
            "type": "condition_check",
            "condition_str": ast.unparse(node.test).strip()
        }
        self.generic_visit(node)
        
    def visit_Return(self, node):
        if node.value:
            self.line_event_map[node.lineno] = {
                "type": "return_statement",
                "value_str": ast.unparse(node.value).strip()
            }
        self.generic_visit(node)

    def visit_While(self, node):
        self.line_event_map[node.lineno] = {
            "type": "condition_check",
            "condition_str": ast.unparse(node.test).strip()
        }
        for body_node in node.body:
            for i in range(body_node.lineno, getattr(body_node, 'end_lineno', body_node.lineno) + 1):
                self.loop_context_map[i] = { "type": "while", "loop_line": node.lineno }
        self.generic_visit(node)

    def visit_For(self, node):
        loop_line = node.lineno
        variable = getattr(node.target, 'id', 'loop_var')
        iterable = ast.unparse(node.iter).strip()
        self.line_event_map[loop_line] = { "type": "for_loop_start" }
        if node.body:
            start_line = node.body[0].lineno
            end_line = max(getattr(item, 'end_lineno', item.lineno) for item in node.body)
            for i in range(start_line, end_line + 1):
                self.loop_context_map[i] = {
                    'type': 'for', 'loop_line': loop_line, 'variable': variable,
                    'iterable': iterable, 'start_line': start_line
                }
        self.generic_visit(node)

# --- Tracing Data Structures & Helpers ---
class CallTreeNode:
    def __init__(self, name, args, step_index, parent_id=None):
        self.id = id(self)
        self.parent_id = parent_id
        self.name = name
        self.args = args
        self.start_step = step_index
        # end_step will be set when the function actually returns
        self.end_step = -1 
        self.children = []
        self.return_value = None

    def to_dict(self):
        return {
            "id": self.id, "parent_id": self.parent_id, "name": self.name,
            "args": self.args, "start_step": self.start_step, "end_step": self.end_step,
            "children": [child.to_dict() for child in self.children],
            "return_value": self.return_value,
        }

def serialize_value(v):
    if isinstance(v, (int, float, str, bool, type(None))):
        return {"type": "primitive", "value": v}
    if isinstance(v, list):
        return {"type": "list", "id": id(v), "value": [serialize_value(item) for item in v[:50]]}
    if isinstance(v, dict):
        return {"type": "dict", "id": id(v), "value": {str(k): serialize_value(val) for k, val in list(v.items())[:25]}}
    if hasattr(v, '__dict__'):
        return {"type": "object", "id": id(v), "class_name": v.__class__.__name__}
    return {"type": "other", "value": repr(v)}

def _enrich_event(static_event, frame):
    event = copy.deepcopy(static_event)
    g, l = frame.f_globals, frame.f_locals
    try:
        if event["type"] in ["assignment", "return_statement"]:
            raw_value = eval(event["value_str"], g, l)
            event["value"] = serialize_value(raw_value)

        elif event["type"] == "binary_operation":
            event["left_val"] = eval(event["left_str"], g, l)
            event["right_val"] = eval(event["right_str"], g, l)
            event["result_val"] = eval(f"{event['left_str']} {event['op_str']} {event['right_str']}", g, l)
            
            event["operands"] = {}
            left_s = event["left_str"]
            right_s = event["right_str"]
            try:
                if left_s.isidentifier() and (left_s in l or left_s in g):
                    event["operands"][left_s] = eval(left_s, g, l)
                if right_s.isidentifier() and (right_s in l or right_s in g):
                    event["operands"][right_s] = eval(right_s, g, l)
            except: pass

        elif event["type"] == "condition_check":
            event["result"] = bool(eval(event["condition_str"], g, l))
            
        elif event["type"] == "print_event":
            try:
                arg_strs = event["arg_strs"]
                evaluated_args = [eval(s, g, l) for s in arg_strs]
                final_output_string = " ".join(map(str, evaluated_args))
                event["output"] = serialize_value(final_output_string)
                event["arguments"] = []
                for i, original_string in enumerate(arg_strs):
                    event["arguments"].append({"str": original_string, "value": serialize_value(evaluated_args[i])})
                if "value" in event:
                    del event["value"]
            except Exception as e:
                event["arguments"] = []
                event["output"] = serialize_value(f"Error evaluating print: {e}")

        elif event["type"] == "array_operation":
            target_obj = eval(event["target_var"], g, l)
            event["list_snapshot_before"] = copy.copy(target_obj)
            if event["method"] in ["assign_at_index", "delete_by_index"]:
                event["index"] = eval(event["slice_str"], g, l)
            if event["method"] == "assign_at_index":
                event["value"] = eval(event["value_str"], g, l)
            if "arg_strs" in event:
                event["args"] = [eval(arg, g, l) for arg in event["arg_strs"]]
            if event["method"] == "pop" and isinstance(target_obj, list):
                if event["args"]: event["index"] = event["args"][0]
                else: event["index"] = len(target_obj) - 1
                event["removed_value"] = target_obj[event["index"]]
            if event["method"] == "remove" and isinstance(target_obj, list):
                event["removed_index"] = target_obj.index(event["args"][0])
    except Exception:
        event["eval_error"] = True
    return event

# --- Main Tracing Logic ---
def run_with_trace(code_str: str):
    try:
        tree = ast.parse(code_str)
        analyzer = CodeAnalyzer()
        analyzer.visit(tree)
        line_event_map = analyzer.line_event_map
        loop_context_map = analyzer.loop_context_map
    except SyntaxError as e:
        return {
            "trace": [{"line": e.lineno, "event": {"type": "error", "error_type": "SyntaxError", "error_message": e.msg}, "locals": {}, "stack": []}],
            "output": f"SyntaxError: {e.msg}", "call_tree": None
        }

    trace_steps = []
    output_buffer = io.StringIO()
    call_stack = []
    call_tree_root = None
    node_stack = []
    processed_loops_on_line = set()
    pending_trace_step = None
    final_scope = {} 

    def tracer(frame, event, arg):
        nonlocal call_stack, call_tree_root, node_stack, processed_loops_on_line, pending_trace_step
        func_name = frame.f_code.co_name
        lineno = frame.f_lineno

        if pending_trace_step and event in ("line", "return", "call"):
            pending_trace_step["locals"] = {k: serialize_value(v) for k, v in frame.f_locals.items() if not k.startswith('__')}
            trace_steps.append(pending_trace_step)
            pending_trace_step = None

        if event == "call" and func_name != '<module>':
            processed_loops_on_line.clear()
            call_stack.append(func_name)
            args_repr = {k: repr(v) for k, v in inspect.getargvalues(frame).locals.items()}
            parent_id = node_stack[-1].id if node_stack else None
            new_node = CallTreeNode(func_name, args_repr, len(trace_steps), parent_id)
            if not call_tree_root: call_tree_root = new_node
            elif node_stack: node_stack[-1].children.append(new_node)
            node_stack.append(new_node)

            if frame.f_back:
                caller_line = frame.f_back.f_lineno
                func_args = {k: serialize_value(v) for k, v in inspect.getargvalues(frame).locals.items()}
                
                call_event_step = {
                    "line": caller_line,
                    "event": {
                        "type": "call",
                        "function_name": func_name,
                        "arguments": func_args
                    },
                    "locals": {k: serialize_value(v) for k, v in frame.f_back.f_locals.items() if not k.startswith('__')},
                    "stack": copy.deepcopy(call_stack)
                }
                trace_steps.append(call_event_step)

        if event == "line":
            if lineno in loop_context_map:
                loop_info = loop_context_map[lineno]
                if lineno == loop_info.get('start_line') and loop_info['loop_line'] not in processed_loops_on_line:
                    try:
                        current_value = frame.f_locals.get(loop_info['variable'])
                        iterable_obj = eval(loop_info['iterable'], frame.f_globals, frame.f_locals)
                        serialized_iterable = [serialize_value(item) for item in list(iterable_obj)]
                        iteration_event = {
                            "type": "loop_iteration", 
                            "loop_variable_name": loop_info['variable'], 
                            "current_value": current_value, 
                            "iterable_snapshot": serialized_iterable,
                            "start_line": loop_info['start_line']
                        }
                        locals_copy = {k: serialize_value(v) for k, v in frame.f_locals.items() if not k.startswith('__')}
                        trace_steps.append({"line": loop_info['loop_line'], "event": iteration_event, "locals": locals_copy, "stack": copy.deepcopy(call_stack)})
                        processed_loops_on_line.add(loop_info['loop_line'])
                    except Exception: pass
            else:
                processed_loops_on_line.clear()
            
            static_event = line_event_map.get(lineno)
            if static_event:
                is_return_statement = static_event.get("type") in ["return_statement", "for_loop_start"]
                if is_return_statement:
                    pending_trace_step = None 
                else:
                    enriched_event = _enrich_event(static_event, frame)
                    pending_trace_step = {"line": lineno, "event": enriched_event, "stack": copy.deepcopy(call_stack)}

        if event == "return" and func_name != '<module>':
            return_event = {
                "type": "return_value", 
                "function_name": func_name,
                "value": serialize_value(arg),
                "return_to_line": frame.f_back.f_lineno if frame.f_back else None
            }
            
            # 1. Append the trace step FIRST
            trace_steps.append({
                "line": lineno, 
                "event": return_event, 
                "locals": {k: serialize_value(v) for k, v in frame.f_locals.items() if not k.startswith('__')}, 
                "stack": copy.deepcopy(call_stack)
            })
            
            # 2. Calculate the index of the step we just added.
            # This index represents EXACTLY when the function finished.
            execution_end_index = len(trace_steps) - 1

            # 3. Update the Tree Node
            if call_stack and call_stack[-1] == func_name: call_stack.pop()
            if node_stack and node_stack[-1].name == func_name:
                node = node_stack.pop()
                node.return_value = serialize_value(arg)
                # ⭐ CRITICAL: Set the end_step to the current trace index
                node.end_step = execution_end_index
            
            pending_trace_step = None
        
        return tracer
    
    original_stdout = sys.stdout
    sys.stdout = output_buffer
    global_scope = {'__name__': '__main__'}
    sys.settrace(tracer)
    try:
        exec(compile(code_str, '<string>', 'exec'), global_scope)
    except Exception as e:
        error_line = trace_steps[-1]['line'] if trace_steps else -1
        trace_steps.append({"line": error_line, "event": {"type": "error", "error_type": type(e).__name__, "error_message": str(e)}, "locals": trace_steps[-1].get('locals', {}) if trace_steps else {}, "stack": trace_steps[-1].get('stack', []) if trace_steps else []})
    finally:
        sys.settrace(None)
        if pending_trace_step:
            final_scope = {k: serialize_value(v) for k, v in global_scope.items() if not k.startswith('__')}
            pending_trace_step["locals"] = final_scope
            trace_steps.append(pending_trace_step)
        
        sys.stdout = original_stdout
    
    if trace_steps:
        last_line = trace_steps[-1]['line']
        final_locals = final_scope if final_scope else trace_steps[-1].get('locals', {})
        trace_steps.append({
            "line": last_line,
            "event": {"type": "execution_finished"},
            "locals": final_locals,
            "stack": [] 
        })

    return {"trace": trace_steps, "output": output_buffer.getvalue(), "call_tree": call_tree_root.to_dict() if call_tree_root else None, "loop_context_map": loop_context_map}

# --- Flowchart Generator ---
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
        if last_loop_node and current_indent < indent_level_stack[-1][0] and not trimmed_line.startswith(('if', 'elif')):
            flowchart += f'    {node_id} --- {last_loop_node};'
            last_loop_node = None
    last_actual_node = f"N{node_counter}_L{line_number}" if node_counter > 0 else "Start"
    flowchart += f"    {last_actual_node} --> End(End);"
    return flowchart