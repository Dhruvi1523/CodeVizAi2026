from typing import Optional
from pydantic import BaseModel

class CodeInput(BaseModel):
    code: str
    lang: Optional[str] = "python"