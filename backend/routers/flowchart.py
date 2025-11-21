from fastapi import APIRouter, HTTPException
from pyflowchart import Flowchart
from ..models.flowchart_models import CodeInput

router = APIRouter()

@router.post("/generate")
async def generate_flowchart(payload: CodeInput):
    try:
        fc = Flowchart.from_code(payload.code)
        flowchart_syntax = fc.flowchart()
        return {"flowchart_code": flowchart_syntax}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))