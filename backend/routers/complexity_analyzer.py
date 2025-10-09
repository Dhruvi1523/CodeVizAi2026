from fastapi import APIRouter
from models.code_models import CodeInput
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch
import re

MODEL_NAME = "codellama/CodeLlama-7b-Python-hf"
print("Loading model... this may take a while.")

tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForCausalLM.from_pretrained(
    MODEL_NAME,
    device_map="auto",                # automatically use GPU if available
    torch_dtype=torch.bfloat16,       # efficient dtype
)

router = APIRouter()

@router.post("/analyze")
def analyze_code(req: CodeInput):
    user_code = req.code.strip()

    prompt = f"""
        You are a Python code analysis assistant.

        Task:
        1. Give the **time complexity** (Big-O notation).
        2. Give the **space complexity** (Big-O notation).
        3. Suggest **3 improvements** to make the code more efficient / Pythonic.
        4. Generate **warnings** if there are potential issues.

        Here is the code:

        ```python
        {user_code}
        Answer in the format:

        Time Complexity: ...
        Space Complexity: ...
        Suggestions:

        ...

        ...

        ...
        Warnings:

        ...
    """


    inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
    outputs = model.generate(
    **inputs,
    max_new_tokens=400,
    temperature=0.0,
    do_sample=False
    )
    result = tokenizer.decode(outputs[0], skip_special_tokens=True)


    analysis_text = result[len(prompt):].strip()

    

    time_complexity = re.search(r"Time Complexity:\s*(.)", analysis_text)
    space_complexity = re.search(r"Space Complexity:\s(.)", analysis_text)
    suggestions = re.findall(r"\d+.\s(.)", analysis_text)
    warnings = re.findall(r"-\s(.*)", analysis_text)

    return {
    "time_complexity": time_complexity.group(1) if time_complexity else None,
    "space_complexity": space_complexity.group(1) if space_complexity else None,
    "suggestions": suggestions or [],
    "warnings": warnings or [],
    "raw_output": analysis_text # fallback full text
    }