class Handlers:
    def __init__(self, builder):
        self.builder = builder
        self.registry = {
            "if_statement": self.handle_if_chain,
            "expression_statement": self.handle_expression,
            "function_definition": self.handle_function,
            "for_statement": self.handle_loop,
            "while_statement": self.handle_loop,
            "break_statement": self.handle_break,
            "continue_statement": self.handle_continue,
            "try_statement": self.handle_try,
        }
        self.loop_stack = []

    def get(self, node_type):
        return self.registry.get(node_type, self.handle_unknown)
    
    def _get_text(self, node):
        if not node: return ""
        return self.builder.code[node.start_byte:node.end_byte].strip()

    def handle_expression(self, node, parent_node_id):
        label = self._get_text(node)
        node_id = self.builder.add_node(label, "process", "#3b82f6")
        self.builder.add_edge(parent_node_id, node_id)
        return node_id

    def handle_function(self, node, parent_node_id):
        name_node = node.child_by_field_name('name')
        params_node = node.child_by_field_name('parameters')
        body_node = node.child_by_field_name('body')
        
        func_label = f"def {self._get_text(name_node)}{self._get_text(params_node)}"
        func_start_id = self.builder.add_node(func_label, "subprocess", "#9333ea")
        self.builder.add_edge(parent_node_id, func_start_id)
        
        return self.handle_block(body_node, func_start_id)

    def handle_if_chain(self, node, parent_node_id):
        """
        Recursively handles an if-elif-else chain to produce a clean, sequential flowchart.
        """
        condition = node.child_by_field_name('condition')
        consequence = node.child_by_field_name('consequence')
        alternative = node.child_by_field_name('alternative')

        decision_id = self.builder.add_node(f"{self._get_text(condition)}?", "decision", "#f97316")
        self.builder.add_edge(parent_node_id, decision_id)

        true_end_id = self.handle_block(consequence, decision_id, "True")

        false_end_id = None
        if alternative:
            if alternative.type == 'if_statement':
                false_end_id = self.handle_if_chain(alternative, decision_id)
                self.builder.add_edge(decision_id, false_end_id, "False")
            else:
                false_end_id = self.handle_block(alternative, decision_id, "False")
        else:
            false_end_id = decision_id

        if true_end_id != false_end_id:
            merge_id = self.builder.add_node("", "merge", "#6b7280")
            if true_end_id not in ('break', 'continue'):
                self.builder.add_edge(true_end_id, merge_id)
            if false_end_id not in ('break', 'continue'):
                self.builder.add_edge(false_end_id, merge_id)
            return merge_id
        
        return true_end_id

    def handle_loop(self, node, parent_node_id):
        if node.type == 'while_statement':
            condition_node = node.child_by_field_name('condition')
            label = f"while {self._get_text(condition_node)}?"
        else: # for_statement
            left_node = node.child_by_field_name('left')
            right_node = node.child_by_field_name('right')
            label = f"for {self._get_text(left_node)} in {self._get_text(right_node)}"
        
        loop_decision_id = self.builder.add_node(label, "decision", "#f59e0b")
        self.builder.add_edge(parent_node_id, loop_decision_id)
        
        exit_node_id = self.builder.add_node("", "merge", "#6b7280")
        
        self.loop_stack.append({'entry': loop_decision_id, 'exit': exit_node_id})
        
        body_node = node.child_by_field_name('body')
        body_end_id = self.handle_block(body_node, loop_decision_id, "True")
        
        if body_end_id not in ('break', 'continue'):
            self.builder.add_edge(body_end_id, loop_decision_id)
        
        self.builder.add_edge(loop_decision_id, exit_node_id, "False")
        
        self.loop_stack.pop()
        
        return exit_node_id

    def handle_break(self, node, parent_node_id):
        break_node_id = self.builder.add_node("break", "process", "#ef4444")
        self.builder.add_edge(parent_node_id, break_node_id)
        if self.loop_stack:
            self.builder.add_edge(break_node_id, self.loop_stack[-1]['exit'])
        return 'break'

    def handle_continue(self, node, parent_node_id):
        continue_node_id = self.builder.add_node("continue", "process", "#ef4444")
        self.builder.add_edge(parent_node_id, continue_node_id)
        if self.loop_stack:
            self.builder.add_edge(continue_node_id, self.loop_stack[-1]['entry'])
        return 'continue'

    def handle_try(self, node, parent_node_id):
        try_start_id = self.builder.add_node("Try", "process", "#14b8a6")
        self.builder.add_edge(parent_node_id, try_start_id)

        body_node = node.child_by_field_name('body')
        except_clauses = [child for child in node.children if child.type == 'except_clause']
        finally_clause = next((child for child in node.children if child.type == 'finally_clause'), None)

        try_end_id = self.handle_block(body_node, try_start_id)

        exit_points = [try_end_id]

        for except_node in except_clauses:
            exception_type_node = except_node.child(1)
            except_label = f"except {self._get_text(exception_type_node)}"
            
            except_body_node = except_node.child_by_field_name('body')
            except_end_id = self.handle_block(except_body_node, try_start_id, except_label)
            exit_points.append(except_end_id)

        if finally_clause:
            finally_start_id = self.builder.add_node("Finally", "process", "#64748b")
            for end_point in exit_points:
                if end_point and end_point not in ('break', 'continue'):
                    self.builder.add_edge(end_point, finally_start_id)
            
            finally_body_node = finally_clause.child_by_field_name('body')
            finally_end_id = self.handle_block(finally_body_node, finally_start_id)
            return finally_end_id
        else:
            merge_id = self.builder.add_node("", "merge", "#6b7280")
            for end_point in exit_points:
                 if end_point and end_point not in ('break', 'continue'):
                    self.builder.add_edge(end_point, merge_id)
            return merge_id

    def handle_block(self, block_node, parent_node_id, edge_label=None):
        last_node_in_sequence = parent_node_id
        is_first_node_in_block = True
        
        statements = []
        if block_node:
            container = next((c for c in block_node.children if c.type == 'block'), block_node)
            statements = container.children

        for stmt_node in statements:
            if stmt_node.type in ('comment', 'pass_statement', ':', 'else'):
                continue

            handler = self.get(stmt_node.type)
            new_node_id = handler(stmt_node, last_node_in_sequence)
            
            if new_node_id in ('break', 'continue'):
                return new_node_id

            if is_first_node_in_block and edge_label:
                for edge in reversed(self.builder.edges):
                    if edge['source'] == parent_node_id and edge['target'] == new_node_id:
                        edge['label'] = edge_label
                        break
            
            is_first_node_in_block = False
            last_node_in_sequence = new_node_id
        
        if is_first_node_in_block and edge_label:
            placeholder_id = self.builder.add_node(" ", "merge")
            self.builder.add_edge(parent_node_id, placeholder_id, edge_label)
            return placeholder_id

        return last_node_in_sequence

    def handle_unknown(self, node, parent_node_id):
        label = f"Unknown: {self._get_text(node)}"
        node_id = self.builder.add_node(label, "process", "#f43f5e")
        self.builder.add_edge(parent_node_id, node_id)
        return node_id