from typing import List, Optional, Dict, Any
from pydantic import BaseModel

class QuestionOut(BaseModel):
    id: int
    algorithm_id: Optional[str] = None
    subject_id: Optional[str] = None
    question_text: str
    question_type: str
    options: Optional[List[str]] = None
    difficulty: str

class QuizSubmitRequest(BaseModel):
    subject_id: Optional[str] = None
    answers: Dict[int, str] # question_id -> selected_option

class QuizSubmitResponse(BaseModel):
    score: int
    total: int
    percentage: float
    details: List[Dict[str, Any]] # question_id, correct, user_answer, correct_answer, explanation

class UserProgressOut(BaseModel):
    completed_algorithms: int
    total_algorithms: int
    completed_percentage: float
    subject_progress: Dict[str, float]
