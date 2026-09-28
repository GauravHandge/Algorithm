from typing import Any, Dict, List, Optional
from pydantic import BaseModel

class AIExplainRequest(BaseModel):
    algorithm_id: str
    step_state: Dict[str, Any]
    user_context: Optional[str] = None

class AIHintRequest(BaseModel):
    algorithm_id: str
    step_state: Dict[str, Any]

class AIChatRequest(BaseModel):
    algorithm_id: str
    step_state: Optional[Dict[str, Any]] = None
    message: str
    chat_history: Optional[List[Dict[str, str]]] = []

class AICodeExplainRequest(BaseModel):
    code: str
    language: Optional[str] = "python"

class AIQuestionGenRequest(BaseModel):
    subject_id: str
    algorithm_id: Optional[str] = None
    difficulty: Optional[str] = "Medium"
    count: Optional[int] = 3

class AIResponse(BaseModel):
    success: bool
    response: str
    fallback: bool = False
