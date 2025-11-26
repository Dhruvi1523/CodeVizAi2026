# backend/routers/ai_router.py

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from ai_service import generate_full_code_explanation

router = APIRouter(prefix="/ai", tags=["AI Explanation"])

# Request model for the full explanation
class FullExplanationRequest(BaseModel):
    code: str

@router.post("/explain_full")
def explain_full_code(request: FullExplanationRequest):
    """
    Endpoint to get a holistic, structured explanation of the entire code
    to be displayed in the Explanation Panel.
    """
    try:
        # Call the service function
        explanation_text = generate_full_code_explanation(request.code)
        return {"full_explanation": explanation_text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))