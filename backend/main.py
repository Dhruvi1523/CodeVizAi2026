from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from routers import flowchart, dp_visualizer 

# --- FastAPI App Initialization ---
app = FastAPI()

# --- Middleware for CORS ---
# This allows your React frontend (running on a different port) to communicate with this backend.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"], # Add your frontend's URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(flowchart.router, tags=["Flowchart Generator"])
app.include_router(dp_visualizer.router, prefix="/api", tags=["DP Visualizer"])

@app.get("/")
def read_root():
    return {"message": "Welcome to the DP and Flowchart Visualizer API"}
