import os
from dotenv import load_dotenv

load_dotenv()

# Only Gemini (since you're using it)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

MODEL_NAME = os.getenv("MODEL_NAME", "gemini-2.5-flash")
MAX_QUESTIONS = int(os.getenv("MAX_QUESTIONS", 5))

if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY is not set in .env")