from pydantic import BaseModel

class CodeInput(BaseModel):
    """Defines the expected input for code-related endpoints."""
    code: str