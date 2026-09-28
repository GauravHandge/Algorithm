from fastapi import APIRouter, HTTPException
from backend.schemas.ai import (
    AIExplainRequest,
    AIHintRequest,
    AIChatRequest,
    AICodeExplainRequest,
    AIQuestionGenRequest,
    AIResponse
)
from backend.services.ai_service import ai_provider

router = APIRouter(prefix="/api/ai", tags=["AI Tutor"])

@router.post("/explain", response_model=AIResponse)
def explain_step(req: AIExplainRequest):
    return ai_provider.explain_step(req.algorithm_id, req.step_state, req.user_context)

@router.post("/hint", response_model=AIResponse)
def get_hint(req: AIHintRequest):
    return ai_provider.get_hint(req.algorithm_id, req.step_state)

@router.post("/chat", response_model=AIResponse)
def ai_chat(req: AIChatRequest):
    return ai_provider.chat(req.algorithm_id, req.message, req.step_state)

@router.post("/code-explain", response_model=AIResponse)
def explain_code(req: AICodeExplainRequest):
    return ai_provider.explain_code(req.code, req.language)
