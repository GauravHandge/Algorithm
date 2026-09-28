from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database.database import get_db
from backend.database.models import Question, QuizAttempt, UserProgress
from backend.schemas.question import QuestionOut, QuizSubmitRequest, QuizSubmitResponse

router = APIRouter(prefix="/api", tags=["Practice & Quizzes"])

@router.get("/questions")
def get_questions(
    subject_id: Optional[str] = None,
    algorithm_id: Optional[str] = None,
    limit: Optional[int] = 10,
    db: Session = Depends(get_db)
):
    query = db.query(Question)
    if algorithm_id:
        query = query.filter(Question.algorithm_id == algorithm_id)
    elif subject_id:
        query = query.filter(Question.subject_id == subject_id)

    questions = query.limit(limit).all()
    res = []
    for q in questions:
        res.append({
            "id": q.id,
            "algorithm_id": q.algorithm_id,
            "subject_id": q.subject_id,
            "question_text": q.question_text,
            "question_type": q.question_type,
            "options": q.options,
            "difficulty": q.difficulty
        })
    return {"success": True, "questions": res}

@router.post("/quiz/submit", response_model=QuizSubmitResponse)
def submit_quiz(req: QuizSubmitRequest, db: Session = Depends(get_db)):
    answers = req.answers or {}
    if not answers:
        raise HTTPException(status_code=400, detail="No answers submitted.")

    q_ids = [int(k) for k in answers.keys()]
    questions = db.query(Question).filter(Question.id.in_(q_ids)).all()

    correct_count = 0
    total = len(questions)
    details = []

    for q in questions:
        user_ans = answers.get(q.id) or answers.get(str(q.id))
        is_correct = (user_ans == q.correct_answer)
        if is_correct:
            correct_count += 1

        details.append({
            "question_id": q.id,
            "question_text": q.question_text,
            "correct": is_correct,
            "user_answer": user_ans,
            "correct_answer": q.correct_answer,
            "explanation": q.explanation
        })

    pct = round((correct_count / total) * 100, 1) if total > 0 else 0.0

    # Save attempt
    attempt = QuizAttempt(
        subject_id=req.subject_id,
        score=correct_count,
        total_questions=total,
        percentage=pct
    )
    db.add(attempt)
    db.commit()

    return QuizSubmitResponse(
        score=correct_count,
        total=total,
        percentage=pct,
        details=details
    )
