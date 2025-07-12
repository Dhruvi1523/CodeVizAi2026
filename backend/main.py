from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

# Allow frontend connection (adjust the origin to match your frontend if needed)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React default Vite port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define request body model
class Message(BaseModel):
    text: str

@app.get("/")
def read_root():
    return {"message": "Hello from FastAPI!"}

@app.post("/echo")
def echo_message(msg: Message):
    return {"echo": msg.text}
