from typing import List
from pydantic import BaseModel, Field

class LCSRequest(BaseModel):
    str1: str = Field(..., example="AGGTAB")
    str2: str = Field(..., example="GXTXAYB")

class KnapsackRequest(BaseModel):
    weights: List[int] = Field(..., example=[10, 20, 30])
    values: List[int] = Field(..., example=[60, 100, 120])
    capacity: int = Field(..., example=50)

class CoinChangeRequest(BaseModel):
    coins: List[int] = Field(..., example=[1, 2, 5])
    amount: int = Field(..., example=11)