from fastapi import APIRouter, HTTPException
from models.code_models import CodeInput
from tracer import run_with_trace
from tracer import generate_simple_flowchart

router = APIRouter()

@router.post("/trace")
async def trace_code(payload: CodeInput):
    """
    Receives Python code, executes it with a tracer, and returns the trace.
    """
    try:
        result = run_with_trace(payload.code)
        # If the trace captured an error during execution, return a 400 status
        if any('error' in step for step in result.get('trace', [])):
            error_step = next((step for step in result['trace'] if 'error' in step), None)
            raise HTTPException(status_code=400, detail=error_step.get('error', 'Execution error'))
        
        return result
    except Exception as e:
        # For unexpected errors in the tracer service itself
        raise HTTPException(status_code=500, detail=f"An internal error occurred: {str(e)}")

@router.post("/flowchart")
async def create_flowchart(payload: CodeInput):
    """
    Receives Python code and returns a Mermaid.js flowchart string.
    """
    try:
        mermaid_code = generate_simple_flowchart(payload.code)
        return {"mermaid": mermaid_code}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate flowchart: {str(e)}")