from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from tracer import run_with_trace  # Import our tracer function

app = FastAPI()

# ✅ Allow frontend connection
# Your React port might be 3000, 5173 (Vite), etc. Adjust if needed.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic model for incoming request body
class CodeInput(BaseModel):
    language: str
    code: str

@app.get("/")
def read_root():
    return {"message": "CodeVizAI Backend is running!"}

@app.post("/trace")
async def trace_code(input: CodeInput):
    """
    Receives code from the frontend, runs it through the tracer,
    and returns the complete trace and output data.
    """
    # The run_with_trace function returns a dict like:
    # {"trace": [...], "output": "...", "error": "..."}
    # We return this dictionary directly as the JSON response.
    trace_data = run_with_trace(input.language, input.code)
    return trace_data
