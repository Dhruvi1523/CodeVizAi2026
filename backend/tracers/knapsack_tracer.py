from typing import List
import copy
import uuid

# --- Bottom-Up Tracer ---
def trace_knapsack_bottom_up(weights: List[int], values: List[int], capacity: int):
    n = len(weights)
    dp = [[0] * (capacity + 1) for _ in range(n + 1)]
    trace = []

    for i in range(1, n + 1):
        for w in range(1, capacity + 1):
            explanation = ""
            if weights[i - 1] > w:
                dp[i][w] = dp[i - 1][w]
                explanation = f"Item {i} weight ({weights[i-1]}) > capacity ({w}). Taking value from above."
            else:
                val_included = values[i - 1] + dp[i - 1][w - weights[i - 1]]
                val_not_included = dp[i - 1][w]
                dp[i][w] = max(val_included, val_not_included)
                explanation = f"Item {i}: max(include: {val_included}, exclude: {val_not_included})"

            steps_snapshot = [{"i": r, "j": c, "value": dp[r][c]} for r in range(n + 1) for c in range(capacity + 1) if dp[r][c] != 0 or (r <= i and c <= w)]

            trace.append({
                "explanation": explanation,
                "visualizations": [
                    {
                        "type": "grid-2d", "title": "Knapsack Table",
                        "data": { "steps": steps_snapshot, "n": n, "m": capacity, "highlightedCell": {"i": i, "j": w}, "rowLabels": ["-"] + [f"Item {k+1}" for k in range(n)], "colLabels": [f"{k}" for k in range(capacity+1)] }
                    },
                    {
                        "type": "variables", "title": "State",
                        "data": { "Item (i)": i, "Capacity (w)": w, "Weight": weights[i-1], "Value": values[i-1] }
                    }
                ]
            })

    final_value = dp[n][capacity]
    return trace, final_value

# --- Top-Down Tracer ---
def trace_knapsack_top_down(weights: List[int], values: List[int], capacity: int):
    memo = {}
    trace = []
    n = len(weights)
    initial_tree = {"id": "root", "name": f"KS({n}, {capacity})", "children": []}
    tree_states = [initial_tree]

    def knapsack_recursive(i, w, parent_id):
        memo_key = f"({i},{w})"
        node_id = f"node-{i}-{w}-{uuid.uuid4().hex[:4]}"

        new_node = {"id": node_id, "name": f"KS({i},{w})", "children": []}
        latest_tree = copy.deepcopy(tree_states[-1])
        q = [latest_tree]
        while q:
            curr = q.pop(0)
            if curr["id"] == parent_id: curr["children"].append(new_node); break
            q.extend(curr.get("children", []))
        tree_states.append(latest_tree)
        trace.append({"visualizations": [{"type": "tree", "title": "Recursion Tree", "data": {"data": [latest_tree], "activeNodeId": node_id}}, {"type": "key-value", "title": "Memoization Table", "data": {"memo": dict(memo)}}], "explanation": f"Calling Knapsack for Item {i} with capacity {w}."})
        
        if memo_key in memo:
            result = memo[memo_key]
            latest_tree = copy.deepcopy(tree_states[-1])
            q = [latest_tree]
            while q:
                curr = q.pop(0)
                if curr["id"] == node_id: curr["name"] += f" = {result} (Memo)"; break
                q.extend(curr.get("children", []))
            tree_states.append(latest_tree)
            trace.append({"visualizations": [{"type": "tree", "title": "Recursion Tree", "data": {"data": [latest_tree], "activeNodeId": node_id}}, {"type": "key-value", "title": "Memoization Table", "data": {"memo": dict(memo)}}], "explanation": f"Found KS({i},{w}) in memo. Value = {result}."})
            return result

        if i == 0 or w == 0:
            latest_tree = copy.deepcopy(tree_states[-1])
            q = [latest_tree]
            while q:
                curr = q.pop(0)
                if curr["id"] == node_id: curr["name"] += " = 0 (Base Case)"; break
                q.extend(curr.get("children", []))
            tree_states.append(latest_tree)
            trace.append({"visualizations": [{"type": "tree", "title": "Recursion Tree", "data": {"data": [latest_tree], "activeNodeId": node_id}}, {"type": "key-value", "title": "Memoization Table", "data": {"memo": dict(memo)}}], "explanation": f"Base case for KS({i},{w}). Value = 0."})
            return 0

        if weights[i - 1] > w:
            result = knapsack_recursive(i - 1, w, node_id)
        else:
            result = max(values[i - 1] + knapsack_recursive(i - 1, w - weights[i - 1], node_id), knapsack_recursive(i - 1, w, node_id))
        
        memo[memo_key] = result
        latest_tree = copy.deepcopy(tree_states[-1])
        q = [latest_tree]
        while q:
            curr = q.pop(0)
            if curr["id"] == node_id: curr["name"] += f" = {result}"; break
            q.extend(curr.get("children", []))
        tree_states.append(latest_tree)
        trace.append({"visualizations": [{"type": "tree", "title": "Recursion Tree", "data": {"data": [latest_tree], "activeNodeId": node_id}}, {"type": "key-value", "title": "Memoization Table", "data": {"memo": dict(memo)}}], "explanation": f"Computed KS({i},{w}) = {result}. Storing in memo."})
        return result

    knapsack_recursive(n, capacity, "root")
    return trace