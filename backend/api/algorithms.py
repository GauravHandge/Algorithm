from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Header, status
from sqlalchemy.orm import Session

from backend.database.database import get_db
from backend.database.models import Subject, Topic, Algorithm, UserProgress
from backend.payment.models import SubjectPlan
from backend.payment.access import get_current_user_optional, check_user_subject_access
from backend.schemas.algorithm import (
    AlgorithmSummary,
    AlgorithmDetail,
    AlgorithmExecuteRequest,
    AlgorithmExecuteResponse
)
from backend.engine.execution_engine import global_execution_registry

router = APIRouter(prefix="/api", tags=["Algorithms & Catalog"])

def map_algo_to_subject(algo: Algorithm) -> str:
    """Maps an algorithm to its core monetization subject (ai, dsa, ml, cybersecurity)."""
    rag_ids = [
        "simple_rag", "advanced_rag", "self_rag", "crag",
        "agentic_rag", "graph_rag", "multimodal_rag", "vectorless_rag", "a_star"
    ]
    if algo.id in rag_ids or "RAG" in algo.name or algo.category in ["AI Architecture", "AI Agentic Graph"]:
        return "ai"
    
    if algo.topic and algo.topic.subject_id == "dsa":
        return "dsa"
    
    if algo.topic and algo.topic.subject_id == "aiml":
        return "ml"
    
    if algo.topic and algo.topic.subject_id == "cybersecurity":
        return "cybersecurity"
    
    return algo.topic.subject_id if algo.topic else "dsa"

@router.get("/subjects")
def get_subjects(db: Session = Depends(get_db)):
    subjects = db.query(Subject).order_by(Subject.order).all()
    res = []
    for s in subjects:
        topics_count = db.query(Topic).filter(Topic.subject_id == s.id).count()
        algo_count = db.query(Algorithm).join(Topic).filter(Topic.subject_id == s.id).count()
        res.append({
            "id": s.id,
            "name": s.name,
            "description": s.description,
            "icon": s.icon,
            "topicsCount": topics_count,
            "algorithmsCount": algo_count
        })
    return {"success": True, "subjects": res}

@router.get("/topics")
def get_topics(subject_id: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Topic)
    if subject_id:
        query = query.filter(Topic.subject_id == subject_id)
    topics = query.order_by(Topic.order).all()
    return {"success": True, "topics": [
        {"id": t.id, "subject_id": t.subject_id, "name": t.name, "description": t.description}
        for t in topics
    ]}

@router.get("/algorithms")
def get_algorithms(
    subject_id: Optional[str] = None,
    topic_id: Optional[str] = None,
    difficulty: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Algorithm).join(Topic)

    if subject_id:
        query = query.filter(Topic.subject_id == subject_id)
    if topic_id:
        query = query.filter(Algorithm.topic_id == topic_id)
    if difficulty:
        query = query.filter(Algorithm.difficulty == difficulty)
    if search:
        search_fmt = f"%{search}%"
        query = query.filter(
            (Algorithm.name.ilike(search_fmt)) |
            (Algorithm.category.ilike(search_fmt)) |
            (Algorithm.short_description.ilike(search_fmt))
        )

    algos = query.all()
    res = []
    for a in algos:
        res.append({
            "id": a.id,
            "topic_id": a.topic_id,
            "subject_id": map_algo_to_subject(a),
            "name": a.name,
            "short_description": a.short_description,
            "category": a.category,
            "difficulty": a.difficulty,
            "time_complexity": a.time_complexity,
            "space_complexity": a.space_complexity,
            "visualizer_type": a.visualizer_type,
            "is_free_preview": bool(getattr(a, "is_free_preview", False))
        })
    return {"success": True, "algorithms": res}

@router.get("/algorithms/{algorithm_id}")
def get_algorithm_detail(
    algorithm_id: str,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    algo = db.query(Algorithm).filter(Algorithm.id == algorithm_id).first()
    if not algo:
        raise HTTPException(status_code=404, detail="Algorithm not found")

    target_subject = map_algo_to_subject(algo)
    is_free = bool(getattr(algo, "is_free_preview", False))
    user = get_current_user_optional(authorization, db)
    has_access = check_user_subject_access(db, user, target_subject)

    # Enforce backend-level authorization guard
    if not is_free and not has_access:
        plan = db.query(SubjectPlan).filter(SubjectPlan.id == target_subject).first()
        plan_name = plan.name if plan else target_subject.upper()
        price = plan.price if plan else 20.0
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error": "PREMIUM_LOCKED",
                "message": f"'{algo.name}' is a premium lesson. Unlock full access to {plan_name} to view visualizations, pseudocode, and execution steps.",
                "subject_id": target_subject,
                "subject_name": plan_name,
                "price": price,
                "is_free_preview": False
            }
        )

    # Record user view progress
    try:
        prog = db.query(UserProgress).filter(UserProgress.algorithm_id == algorithm_id).first()
        if not prog:
            prog = UserProgress(algorithm_id=algorithm_id, completed=0)
            db.add(prog)
            db.commit()
    except Exception as e:
        print(f"[Progress] Warning: {e}")

    return {
        "success": True,
        "is_free_preview": is_free,
        "has_access": has_access or is_free,
        "algorithm": {
            "id": algo.id,
            "topic_id": algo.topic_id,
            "subject_id": target_subject,
            "name": algo.name,
            "short_description": algo.short_description,
            "full_description": algo.full_description,
            "category": algo.category,
            "difficulty": algo.difficulty,
            "time_complexity": algo.time_complexity,
            "space_complexity": algo.space_complexity,
            "pseudocode": algo.pseudocode,
            "visualizer_type": algo.visualizer_type,
            "default_input": algo.default_input,
            "is_free_preview": is_free
        }
    }

@router.post("/algorithms/{algorithm_id}/execute", response_model=AlgorithmExecuteResponse)
def execute_algorithm(
    algorithm_id: str,
    request: AlgorithmExecuteRequest,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    algo = db.query(Algorithm).filter(Algorithm.id == algorithm_id).first()
    if algo:
        target_subject = map_algo_to_subject(algo)
        is_free = bool(getattr(algo, "is_free_preview", False))
        user = get_current_user_optional(authorization, db)
        has_access = check_user_subject_access(db, user, target_subject)

        if not is_free and not has_access:
            plan = db.query(SubjectPlan).filter(SubjectPlan.id == target_subject).first()
            plan_name = plan.name if plan else target_subject.upper()
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Execution locked. Please unlock {plan_name} to run this interactive simulation."
            )

    input_data = request.input_data or {}
    params = request.params or {}

    response = global_execution_registry.execute(algorithm_id, input_data, params)
    return response
