import uuid
from typing import Optional
from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from tracer import run_with_trace
from flowchart.builder import FlowchartBuilder

app = FastAPI()

# --- Middleware for CORS (Allows frontend connection) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], # Your React frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- In-memory store for flowchart generation jobs ---
# For production, this should be replaced with Redis or a database.
jobs = {}

# --- Pydantic model for input ---
class CodeInput(BaseModel):
    code: str
    lang: Optional[str] = "python"

# --- Helper function to run the flowchart analysis in the background ---
def generate_flowchart_task(job_id: str, code: str, lang: str):
    """The long-running task that builds the flowchart."""
    try:
        builder = FlowchartBuilder(code, lang=lang)
        result = builder.build()
        jobs[job_id] = {"status": "success", "result": result}
    except Exception as e:
        print(f"Job {job_id} failed: {e}") # Log the error for debugging
        jobs[job_id] = {"status": "failed", "error": "An error occurred during parsing."}


@app.get("/")
def read_root():
    return {"message": "Hello from FastAPI!"}

# --- Endpoint 1: Code Tracing (Synchronous) ---
@app.post("/trace")
async def trace_code(input: CodeInput):
    """
    Runs the tracer and returns the result immediately.
    This is a fast operation, so it doesn't need a background task.
    """
    try:
        return run_with_trace(input.code)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# --- Endpoint 2: Submit Flowchart Job (Asynchronous) ---
@app.post("/submit")
async def submit_flowchart_job(input: CodeInput, background_tasks: BackgroundTasks):
    """
    Accepts code for flowchart generation, starts a background task,
    and immediately returns a job ID.
    """
    job_id = str(uuid.uuid4())
    jobs[job_id] = {"status": "pending"}

    # Add the flowchart builder to run in the background
    background_tasks.add_task(generate_flowchart_task, job_id, input.code, input.lang)
    
    return {"jobId": job_id}

# --- Endpoint 3: Check Flowchart Job Status ---
@app.get("/status/{job_id}")
async def get_flowchart_status(job_id: str):
    """
    Allows the frontend to poll for the flowchart result using the job ID.
    """
    job = jobs.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return job