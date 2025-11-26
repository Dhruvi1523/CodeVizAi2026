from typing import Dict, Any
from fastapi import APIRouter

# Import models
from models.dp_models import LCSRequest, KnapsackRequest, CoinChangeRequest
# Import ALL tracers
from tracers.lcs_tracer import trace_lcs_bottom_up, trace_lcs_top_down
from tracers.knapsack_tracer import trace_knapsack_bottom_up, trace_knapsack_top_down
from tracers.coin_change_tracer import trace_coin_change_bottom_up, trace_coin_change_top_down

router = APIRouter()

@router.post("/visualize/{algo_id}")
async def get_visualization(algo_id: str, request: Dict[str, Any]):
    output_string = ""
    
    if algo_id == "lcs":
        parsed_request = LCSRequest(**request)
        # Call both bottom-up and top-down tracers
        bottom_up_trace, final_value = trace_lcs_bottom_up(parsed_request.str1, parsed_request.str2)
        top_down_trace = trace_lcs_top_down(parsed_request.str1, parsed_request.str2)
        
        output_string = f"The length of the Longest Common Subsequence is {final_value}."
        
        return {"bottom-up": bottom_up_trace, "top-down": top_down_trace, "output": output_string}

    elif algo_id == "knapsack":
        parsed_request = KnapsackRequest(**request)
        # Call both bottom-up and top-down tracers
        bottom_up_trace, final_value = trace_knapsack_bottom_up(parsed_request.weights, parsed_request.values, parsed_request.capacity)
        top_down_trace = trace_knapsack_top_down(parsed_request.weights, parsed_request.values, parsed_request.capacity)

        output_string = f"The maximum value that can be carried is {final_value}."
        
        return {"bottom-up": bottom_up_trace, "top-down": top_down_trace, "output": output_string}

    elif algo_id == "coin-change":
        parsed_request = CoinChangeRequest(**request)
        # Call both bottom-up and top-down tracers
        bottom_up_trace, final_value = trace_coin_change_bottom_up(parsed_request.coins, parsed_request.amount)
        top_down_trace = trace_coin_change_top_down(parsed_request.coins, parsed_request.amount)
        
        if final_value == float('inf'):
            output_string = f"It's not possible to make the amount {parsed_request.amount} with the given coins."
        else:
            output_string = f"The minimum coins required to make amount {parsed_request.amount} is {final_value}."
            
        return {"bottom-up": bottom_up_trace, "top-down": top_down_trace, "output": output_string}
        
    return {"error": "Algorithm not found"}, 404