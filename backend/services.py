import json
from google import genai

from config import GEMINI_API_KEY, MODEL_NAME


# Gemini Client
client = genai.Client(api_key=GEMINI_API_KEY)


# Simple duplicate remover (without spacy)
def remove_duplicates(questions):

    unique_questions = []
    seen = set()

    for q in questions:

        question_text = q["question"].strip().lower()

        if question_text not in seen:

            seen.add(question_text)

            unique_questions.append(q)

    return unique_questions


# Question validator
def validate_questions(questions):

    valid_questions = []

    for q in questions:

        if (

            "question" in q and
            "options" in q and
            "answer" in q and
            len(q["options"]) == 4 and
            q["answer"] in q["options"]

        ):

            valid_questions.append(q)

    return valid_questions


def generate_quiz(
    text: str,
    count: int = 5,
    difficulty: str = "medium"
):

    if not text:

        return {"error": "Text is required"}

    prompt = f"""

    Generate {count} multiple choice questions on "{text}".

    Difficulty Level: {difficulty}

    Rules:
    - Each question must have exactly 4 options
    - Only 1 correct answer
    - Questions should match the difficulty level
    - Keep questions clear and meaningful
    - Avoid duplicate questions

    Return ONLY valid JSON in this format:

    {{
      "questions": [
        {{
          "question": "Question here",
          "options": [
            "Option A",
            "Option B",
            "Option C",
            "Option D"
          ],
          "answer": "Correct Option",
          "explanation": "Short explanation"
        }}
      ]
    }}

    """

    try:

        response = client.models.generate_content(

            model=MODEL_NAME,

            contents=prompt

        )

        text_output = str(response.text).strip()

        # Remove markdown formatting
        text_output = text_output.replace(
            "```json",
            ""
        ).replace(
            "```",
            ""
        )

        # Extract JSON safely
        start = text_output.find("{")

        end = text_output.rfind("}") + 1

        text_output = text_output[start:end]

        data = json.loads(text_output)

        questions = data.get("questions", [])

        if not questions:

            raise ValueError("No questions generated")

        cleaned_questions = []

        for q in questions:

            if (

                "question" in q and
                "options" in q and
                "answer" in q and
                len(q["options"]) == 4

            ):

                cleaned_questions.append({

                    "question": q["question"],

                    "options": q["options"],

                    "answer": q["answer"],

                    "explanation": q.get(
                        "explanation",
                        "No explanation available."
                    )

                })

        # Remove duplicates
        cleaned_questions = remove_duplicates(
            cleaned_questions
        )

        # Validate questions
        cleaned_questions = validate_questions(
            cleaned_questions
        )

        if not cleaned_questions:

            return fallback_quiz(
                text,
                count
            )

        return {
            "questions": cleaned_questions
        }

    except Exception as e:

        print("FULL ERROR:", str(e))

        return fallback_quiz(
            text,
            count
        )


# FALLBACK QUIZ
def fallback_quiz(text, count):

    questions = []

    for i in range(count):

        questions.append({

            "question": f"What is {text}?",

            "options": [
                "Concept",
                "Process",
                "Theory",
                "System"
            ],

            "answer": "Concept",

            "explanation": f"{text} is generally treated as a concept."

        })

    return {
        "questions": questions
    }