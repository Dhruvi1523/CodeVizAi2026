from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from tracer import run_with_trace   # Import our tracer function

app = FastAPI()

# ✅ Allow frontend connection (adjust origin if needed)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Your React frontend (Vite)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request model
class CodeInput(BaseModel):
    code: str

@app.get("/")
def read_root():
    return {"message": "Hello from FastAPI!"}

@app.post("/trace")
async def trace_code(input: CodeInput):
    return run_with_trace(input.code) 