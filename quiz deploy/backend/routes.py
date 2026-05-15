from fastapi import APIRouter

from services import generate_quiz

router = APIRouter()


@router.post("/generate-quiz")
def create_quiz(data: dict):

    text = data.get("text")

    count = int(data.get("count", 5))

    difficulty = data.get("difficulty", "medium")

    if not text:

        return {"error": "Text is required"}

    return generate_quiz(

        text=text,

        count=count,

        difficulty=difficulty

    )