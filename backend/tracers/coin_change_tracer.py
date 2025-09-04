from typing import List
import copy
import uuid

# --- Bottom-Up Tracer ---
def trace_coin_change_bottom_up(coins: List[int], amount: int):
    dp = [float('inf')] * (amount + 1)
    dp[0] = 0
    trace = []
    
    for i in range(1, amount + 1):
        for coin in coins:
            explanation = ""
            if i >= coin:
                if dp[i - coin] != float('inf'):
                    new_val = 1 + dp[i - coin]
                    if new_val < dp[i]:
                        explanation = f"Amount {i}: Using coin {coin}. New min = 1 + dp[{i-coin}] = {new_val}"
                        dp[i] = new_val
                    else:
                        explanation = f"Amount {i}: Using coin {coin}. {1 + dp[i-coin]} is not better."
                else:
                    explanation = f"Amount {i}: Cannot use coin {coin} as dp[{i-coin}] is infinity."
            else:
                explanation = f"Amount {i}: Coin {coin} is too large."

            dp_json_safe = [val if val != float('inf') else "∞" for val in dp]
            
            trace.append({
                "explanation": explanation,
                "visualizations": [
                    {"type": "array-1d", "title": "Coin Change Array (dp)", "data": { "steps": dp_json_safe, "highlightedIndex": i }},
                    {"type": "variables", "title": "State", "data": { "Amount (i)": i, "Current Coin": coin }}
                ]
            })

    final_value = dp[amount]
    return trace, final_value

# --- Top-Down Tracer ---
def trace_coin_change_top_down(coins: List[int], amount: int):
    memo = {}
    trace = []
    initial_tree = {"id": "root", "name": f"CC({amount})", "children": []}
    tree_states = [initial_tree]

    def coin_change_recursive(rem_amount, parent_id):
        memo_key = str(rem_amount)
        node_id = f"node-{rem_amount}-{uuid.uuid4().hex[:4]}"
        
        new_node = {"id": node_id, "name": f"CC({rem_amount})", "children": []}
        latest_tree = copy.deepcopy(tree_states[-1])
        q = [latest_tree]
        while q:
            curr = q.pop(0)
            if curr["id"] == parent_id: curr["children"].append(new_node); break
            q.extend(curr.get("children", []))
        tree_states.append(latest_tree)
        trace.append({"visualizations": [{"type": "tree", "title": "Recursion Tree", "data": {"data": [latest_tree], "activeNodeId": node_id}}, {"type": "key-value", "title": "Memoization Table", "data": {"memo": dict(memo)}}], "explanation": f"Calling Coin Change for amount {rem_amount}."})

        if rem_amount < 0:
            latest_tree = copy.deepcopy(tree_states[-1])
            q = [latest_tree]
            while q:
                curr = q.pop(0)
                if curr["id"] == node_id: curr["name"] += " = ∞ (Invalid)"; break
                q.extend(curr.get("children", []))
            tree_states.append(latest_tree)
            trace.append({"visualizations": [{"type": "tree", "title": "Recursion Tree", "data": {"data": [latest_tree], "activeNodeId": node_id}}, {"type": "key-value", "title": "Memoization Table", "data": {"memo": dict(memo)}}], "explanation": f"Amount {rem_amount} is invalid."})
            return float('inf')

        if rem_amount == 0:
            latest_tree = copy.deepcopy(tree_states[-1])
            q = [latest_tree]
            while q:
                curr = q.pop(0)
                if curr["id"] == node_id: curr["name"] += " = 0 (Base Case)"; break
                q.extend(curr.get("children", []))
            tree_states.append(latest_tree)
            trace.append({"visualizations": [{"type": "tree", "title": "Recursion Tree", "data": {"data": [latest_tree], "activeNodeId": node_id}}, {"type": "key-value", "title": "Memoization Table", "data": {"memo": dict(memo)}}], "explanation": f"Amount is 0, returning 0 coins."})
            return 0
        
        if memo_key in memo:
            result = memo[memo_key]
            latest_tree = copy.deepcopy(tree_states[-1])
            q = [latest_tree]
            while q:
                curr = q.pop(0)
                if curr["id"] == node_id: curr["name"] += f" = {result if result != float('inf') else '∞'} (Memo)"; break
                q.extend(curr.get("children", []))
            tree_states.append(latest_tree)
            trace.append({"visualizations": [{"type": "tree", "title": "Recursion Tree", "data": {"data": [latest_tree], "activeNodeId": node_id}}, {"type": "key-value", "title": "Memoization Table", "data": {"memo": {k: (v if v != float('inf') else '∞') for k, v in memo.items()}}}], "explanation": f"Found CC({rem_amount}) in memo."})
            return result

        min_coins = float('inf')
        for coin in coins:
            res = coin_change_recursive(rem_amount - coin, node_id)
            if res != float('inf'):
                min_coins = min(min_coins, 1 + res)
        
        memo[memo_key] = min_coins
        latest_tree = copy.deepcopy(tree_states[-1])
        q = [latest_tree]
        while q:
            curr = q.pop(0)
            if curr["id"] == node_id: curr["name"] += f" = {min_coins if min_coins != float('inf') else '∞'}"; break
            q.extend(curr.get("children", []))
        tree_states.append(latest_tree)
        trace.append({"visualizations": [{"type": "tree", "title": "Recursion Tree", "data": {"data": [latest_tree], "activeNodeId": node_id}}, {"type": "key-value", "title": "Memoization Table", "data": {"memo": {k: (v if v != float('inf') else '∞') for k, v in memo.items()}}}], "explanation": f"Computed CC({rem_amount}). Storing in memo."})
        return min_coins

    coin_change_recursive(amount, "root")
    for frame in trace:
        for viz in frame["visualizations"]:
            if viz["type"] == "key-value":
                viz["data"]["memo"] = {k: (v if v != float('inf') else '∞') for k, v in viz["data"]["memo"].items()}
    return trace