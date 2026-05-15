import spacy

nlp = spacy.load("en_core_web_sm")

def remove_duplicates(questions):
    unique = []
    for q in questions:
        duplicate = False
        for uq in unique:
            if nlp(q["question"]).similarity(nlp(uq["question"])) > 0.85:
                duplicate = True
                break
        if not duplicate:
            unique.append(q)
    return unique


def validate_questions(questions):
    valid = []
    for q in questions:
        if (
            "question" in q
            and "options" in q
            and "answer" in q
            and len(q["options"]) == 4
            and q["answer"] in q["options"]
        ):
            valid.append(q)
    return valid