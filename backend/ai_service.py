import os
from pathlib import Path
from dotenv import load_dotenv
from groq import Groq

# Load Environment Variables
BASE_DIR = Path(__file__).resolve().parent.parent
ENV_PATH = BASE_DIR / ".env"
load_dotenv(dotenv_path=ENV_PATH)

GROQ_API_KEY = os.environ.get("GROQ_API_KEY")

def generate_full_code_explanation(code: str) -> str:
    """
    Generates a structured, student-friendly code explanation.
    Optimized for 'Narrative Execution' with consistent BOLD formatting.
    """
    
    if not GROQ_API_KEY:
        return "Error: GROQ_API_KEY not found."

    try:
        client = Groq(api_key=GROQ_API_KEY)

        # --- 🚀 FINAL POLISHED PROMPT ---
        system_prompt = """
        You are an expert Python Tutor. Explain the code logic clearly and visually.

        Output Rules:
        1. Use strict Markdown.
        2. Be concise but friendly.

        Response Structure:

         💡 1. The Big Picture
        * Summary: A single sentence explaining the goal.
        * Analogy: A real-world comparison (e.g., "This loop is like checking items on a shopping list").

        🔑 2. Key Concepts
        * List 2-3 concepts used (e.g., List Comprehension, While Loops).

         🏃‍♂️ 3. Execution Flow (Visualized)
        * Create a table that tells the story of the execution.
        * CRITICAL RULE 1: Do NOT list every single loop iteration. Group them (e.g., "Loop runs 5 times").
        * CRITICAL RULE 2: The content of the first column (Step) must always be Bold.
        
        | Step | 🎬 Action | 💾 Variable Updates |
        | :--- | :--- | :--- |
        | 1. Start | Initialize variables | sum = 0, data = [10, 20] |
        | 2. Loop | Iterate through list | Adds 10, then 20 to sum. |
        | 3. End Loop | Final calculation | sum becomes 30. |
        | 4. Output | Print result | Prints 30. |

        *(Keep it clean. Focus on logical steps, not line numbers.)*

        🧠 4. Logic Breakdown
        * Explain the logic simply.
        * Mention Time Complexity (e.g., O(n)).

         📤 5. Final Output
        * Show the exact console output.
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
        return f"Error communicating with AI service: {str(e)}"