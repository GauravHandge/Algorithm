from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.database.database import get_db
from backend.database.models import Subject, Algorithm, QuizAttempt, UserProgress

router = APIRouter(prefix="/api", tags=["Dashboard & Progress"])

@router.get("/progress")
def get_user_progress(db: Session = Depends(get_db)):
    total_algos = db.query(Algorithm).count()
    completed_algos = db.query(UserProgress).filter(UserProgress.completed == 1).count()
    viewed_algos = db.query(UserProgress).count()

    pct = round((completed_algos / total_algos) * 100, 1) if total_algos > 0 else 0.0

    # Subject breakdowns
    subjects = db.query(Subject).all()
    subj_progress = {}
    for s in subjects:
        total_in_s = db.query(Algorithm).join(Algorithm.topic).filter(Algorithm.topic.has(subject_id=s.id)).count()
        viewed_in_s = db.query(UserProgress).join(Algorithm, UserProgress.algorithm_id == Algorithm.id).join(Algorithm.topic).filter(Algorithm.topic.has(subject_id=s.id)).count()
        subj_progress[s.name] = round((viewed_in_s / total_in_s) * 100, 1) if total_in_s > 0 else 0.0

    recent_attempts = db.query(QuizAttempt).order_by(QuizAttempt.created_at.desc()).limit(5).all()
    attempts_out = [
        {"id": a.id, "subject_id": a.subject_id, "score": a.score, "total": a.total_questions, "percentage": a.percentage, "date": a.created_at.strftime("%Y-%m-%d %H:%M")}
        for a in recent_attempts
    ]

    return {
        "success": True,
        "progress": {
            "total_algorithms": total_algos,
            "completed_algorithms": completed_algos,
            "viewed_algorithms": viewed_algos,
            "completion_percentage": pct,
            "subject_progress": subj_progress,
            "recent_quizzes": attempts_out
        }
    }
