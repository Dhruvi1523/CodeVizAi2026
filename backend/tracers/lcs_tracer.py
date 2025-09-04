from typing import List
import copy
import uuid

# --- Bottom-Up Tracer ---
def trace_lcs_bottom_up(str1: str, str2: str):
    n, m = len(str1), len(str2)
    
    # DP table will be (n+1) x (m+1) to include the 0th row/column
    dp = [[0] * (m + 1) for _ in range(n + 1)]
    trace = []

    # Prepare labels for the DP table visualization
    # 0th row label is empty, then characters of str1
    row_labels = [""] + list(str1) 
    # 0th col label is empty, then characters of str2
    col_labels = [""] + list(str2)

    # Initialize the 0th row and column in the trace (conceptually, they are already 0 in `dp`)
    # This ensures the first frame shows a 0-filled first row/column
    initial_steps = [{"i": r, "j": c, "value": 0} for r in range(n + 1) for c in range(m + 1) if r == 0 or c == 0]
    trace.append({
        "explanation": "Initialize DP table: 0th row and 0th column are all zeros.",
        "visualizations": [
            {"type": "grid-2d", "title": "DP Table (LCS)", "data": { 
                "steps": initial_steps, 
                "n": n, "m": m, 
                "rowLabels": row_labels, 
                "colLabels": col_labels,
                "highlightedCell": None 
            }},
            {"type": "variables", "title": "State", "data": { "str1": str1, "str2": str2 }}
        ]
    })


    for i in range(1, n + 1):
        for j in range(1, m + 1):
            explanation = ""
            current_s1_char = str1[i - 1] # Character from str1 corresponding to current row
            current_s2_char = str2[j - 1] # Character from str2 corresponding to current column

            if current_s1_char == current_s2_char:
                dp[i][j] = 1 + dp[i - 1][j - 1]
                explanation = f"Match found! '{current_s1_char}' == '{current_s2_char}'. Value = 1 + dp[{i-1}][{j-1}] = {dp[i-1][j-1] + 1}"
            else:
                val1 = dp[i - 1][j]
                val2 = dp[i][j - 1]
                dp[i][j] = max(val1, val2)
                explanation = f"No match. '{current_s1_char}' != '{current_s2_char}'. Value = max(dp[{i-1}][{j}]: {val1}, dp[{i}][{j-1}]: {val2}) = {dp[i][j]}"

            # Create a full snapshot of the DP table for the visualization
            steps_snapshot = [{"i": r, "j": c, "value": dp[r][c]} 
                              for r in range(n + 1) 
                              for c in range(m + 1) 
                              if dp[r][c] != 0 or r == 0 or c == 0] # Include all 0s in 0th row/col
            
            trace.append({
                "explanation": explanation,
                "visualizations": [
                    {"type": "grid-2d", "title": "DP Table (LCS)", "data": { 
                        "steps": steps_snapshot, 
                        "n": n, "m": m, 
                        "highlightedCell": {"i": i, "j": j},
                        "rowLabels": row_labels,
                        "colLabels": col_labels
                    }},
                    {"type": "variables", "title": "Current State", "data": { 
                        "i": i, 
                        "j": j, 
                        "str1_char": current_s1_char, 
                        "str2_char": current_s2_char,
                        "DP[i-1][j-1]": dp[i-1][j-1], # For match case
                        "DP[i-1][j]": dp[i-1][j],     # For no-match case
                        "DP[i][j-1]": dp[i][j-1]      # For no-match case
                    }}
                ]
            })
    
    final_value = dp[n][m]
    return trace, final_value

# (Your existing trace_lcs_top_down function remains unchanged below this)
# --- Top-Down Tracer ---
def trace_lcs_top_down(str1: str, str2: str):
    memo = {}
    trace = []
    initial_tree = {"id": "root", "name": f"LCS({len(str1)},{len(str2)})", "children": []}
    tree_states = [initial_tree]

    def lcs_recursive(i, j, parent_id):
        memo_key = f"({i},{j})"
        node_id = f"node-{i}-{j}-{uuid.uuid4().hex[:4]}"

        new_node = {"id": node_id, "name": f"LCS({i},{j})", "children": []}
        latest_tree = copy.deepcopy(tree_states[-1])
        q = [latest_tree]
        while q:
            curr = q.pop(0)
            if curr["id"] == parent_id:
                curr["children"].append(new_node); break
            q.extend(curr.get("children", []))
        
        tree_states.append(latest_tree)
        trace.append({"visualizations": [{"type": "tree", "title": "Recursion Tree", "data": {"data": [latest_tree], "activeNodeId": node_id}}, {"type": "key-value", "title": "Memoization Table", "data": {"memo": dict(memo)}}], "explanation": f"Calling LCS({i}, {j})..."})
        
        if memo_key in memo:
            result = memo[memo_key]
            latest_tree = copy.deepcopy(tree_states[-1])
            q = [latest_tree]
            while q:
                curr = q.pop(0)
                if curr["id"] == node_id: curr["name"] += f" = {result} (Memo)"; break
                q.extend(curr.get("children", []))
            tree_states.append(latest_tree)
            trace.append({"visualizations": [{"type": "tree", "title": "Recursion Tree", "data": {"data": [latest_tree], "activeNodeId": node_id}}, {"type": "key-value", "title": "Memoization Table", "data": {"memo": dict(memo)}}], "explanation": f"Found LCS({i}, {j}) in memo. Value = {result}."})
            return result

        if i == 0 or j == 0:
            latest_tree = copy.deepcopy(tree_states[-1])
            q = [latest_tree]
            while q:
                curr = q.pop(0)
                if curr["id"] == node_id: curr["name"] += " = 0 (Base Case)"; break
                q.extend(curr.get("children", []))
            tree_states.append(latest_tree)
            trace.append({"visualizations": [{"type": "tree", "title": "Recursion Tree", "data": {"data": [latest_tree], "activeNodeId": node_id}}, {"type": "key-value", "title": "Memoization Table", "data": {"memo": dict(memo)}}], "explanation": f"Base case hit for LCS({i}, {j}). Value = 0."})
            return 0
        
        if str1[i - 1] == str2[j - 1]:
            result = 1 + lcs_recursive(i - 1, j - 1, node_id)
        else:
            result = max(lcs_recursive(i, j - 1, node_id), lcs_recursive(i - 1, j, node_id))
        
        memo[memo_key] = result
        latest_tree = copy.deepcopy(tree_states[-1])
        q = [latest_tree]
        while q:
            curr = q.pop(0)
            if curr["id"] == node_id: curr["name"] += f" = {result}"; break
            q.extend(curr.get("children", []))
        tree_states.append(latest_tree)
        trace.append({"visualizations": [{"type": "tree", "title": "Recursion Tree", "data": {"data": [latest_tree], "activeNodeId": node_id}}, {"type": "key-value", "title": "Memoization Table", "data": {"memo": dict(memo)}}], "explanation": f"Computed LCS({i}, {j}) = {result}. Storing in memo."})
        return result

    lcs_recursive(len(str1), len(str2), "root")
    return trace