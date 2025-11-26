import os
from pathlib import Path
from dotenv import load_dotenv
from groq import Groq
import ast

# Load Environment Variables
BASE_DIR = Path(__file__).resolve().parent.parent
ENV_PATH = BASE_DIR / ".env"
load_dotenv(dotenv_path=ENV_PATH)

GROQ_API_KEY = os.environ.get("GROQ_API_KEY")

def generate_full_code_explanation(code: str, runtime_error: str = None) -> str:
    """
    Generates a structured student-friendly explanation or a clear descriptive error message.
    """

    # First: Detect syntax errors before calling LLM
    try:
        ast.parse(code)
    except SyntaxError as e:
        return (
            f"❌ **Syntax Error in Code**\n\n"
            f"**Message:** `{e.msg}`\n"
            f"**Line:** {e.lineno}, **Column:** {e.offset}\n\n"
            f"👉 Fix the syntax and try again. Example causes:\n"
            f"- Missing parentheses or colon\n"
            f"- Incorrect indentation\n"
            f"- Typos in keywords\n"
        )

    # If runtime error occurred earlier in pipeline (e.g recursion / type errors)
    if runtime_error:
        return (
            f"❌ **Runtime Execution Error**\n\n"
            f"**What happened:** `{runtime_error}`\n\n"
            f"🔍 This means the code compiled correctly but failed while running.\n"
            f"Possible causes:\n"
            f"- Infinite recursion or missing base case (e.g. `factorial` without stopping)\n"
            f"- Calling a function before defining it\n"
            f"- Type mismatch (e.g. adding string and integer)\n"
            f"- Undefined variable or function name\n\n"
            f"💡 Fix error and try again."
        )

    if not GROQ_API_KEY:
        return "❌ **Server Configuration Error:** Missing GROQ_API_KEY"

    try:
        client = Groq(api_key=GROQ_API_KEY)

        # --- NEW IMPROVED PROMPT ---
        system_prompt = """
        You are an expert Python Tutor. Explain the code in a friendly, structured way so beginners can understand it.

        Output Requirements:
        1. Use clear Markdown formatting.
        2. Be concise, visual, and beginner-friendly.
        3. DO NOT generate execution-flow tables, step-by-step runtime traces, or grouped iteration descriptions.

        Response Structure:

        💡 **1. Big Picture**
        - One-sentence summary of what the code accomplishes.
        - Provide a simple analogy or real-world comparison.

        🔑 **2. Key Concepts Used**
        - List 2–4 important concepts relevant to learning (e.g., recursion, loops, variables, return values)

        🧠 **3. How It Works (Logic Explanation)**
        - Explain the logic in a natural short explanation format.
        - Avoid line-by-line or step-by-step execution.
        - Focus on understanding rather than execution order.

        ⏱️ **4. Time & Space Complexity**
        - Provide estimated time complexity (e.g., O(n))
        - Provide space complexity (e.g., O(1) or O(n))
        - Short explanation why

        📤 **5. Final Output**
        - Show the final printed output if applicable.
        """

        completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Explain this Python code:\n\n```python\n{code}\n```"}
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.1,
            max_tokens=1500
        )

        return completion.choices[0].message.content

    except Exception as e:
        return (
            f"❌ **AI Service Error**\n\n"
            f"An issue occurred while generating explanation.\n"
            f"**Details:** `{str(e)}`\n\n"
            f"Try again soon or contact support if it persists."
        )


