import os
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from backend.schemas.ai import AIResponse

class AIProvider(ABC):
    @abstractmethod
    def explain_step(self, algorithm_id: str, step_state: Dict[str, Any], context: Optional[str] = None) -> AIResponse:
        pass

    @abstractmethod
    def get_hint(self, algorithm_id: str, step_state: Dict[str, Any]) -> AIResponse:
        pass

    @abstractmethod
    def chat(self, algorithm_id: str, message: str, step_state: Optional[Dict[str, Any]] = None) -> AIResponse:
        pass

    @abstractmethod
    def explain_code(self, code: str, language: str = "python") -> AIResponse:
        pass

class GroqProvider(AIProvider):
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY")
        self.model = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
        self._client = None
        if self.api_key:
            try:
                from groq import Groq
                self._client = Groq(api_key=self.api_key)
            except Exception as e:
                print(f"[AI Service] Note: Groq client init failed: {e}")
                self._client = None

    def _call_groq(self, prompt: str, system_prompt: str = "You are an expert Computer Science Professor and AI Tutor.") -> Optional[str]:
        if not self._client:
            return None
        try:
            chat_completion = self._client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                model=self.model,
                temperature=0.3,
                max_tokens=400
            )
            return chat_completion.choices[0].message.content.strip()
        except Exception as e:
            print(f"[AI Service] Groq API call error: {e}")
            return None

    def explain_step(self, algorithm_id: str, step_state: Dict[str, Any], context: Optional[str] = None) -> AIResponse:
        prompt = f"""Algorithm: {algorithm_id}
Current Step: {step_state.get('step')} / {step_state.get('totalSteps')}
Action: {step_state.get('action')}
State Message: {step_state.get('message')}
State Variables: {step_state.get('variables')}
Array/Nodes State: {step_state.get('array') or step_state.get('visited')}

Explain clearly and concisely in 2-3 sentences what is happening at this step and why."""

        res = self._call_groq(prompt)
        if res:
            return AIResponse(success=True, response=res, fallback=False)

        # Built-in intelligent offline fallback explanation
        action = step_state.get("action", "")
        msg = step_state.get("message", "Processing current step.")
        fallback_msg = f"💡 **Step Explanation**: {msg}\n\nAt this stage of `{algorithm_id}`, the execution engine updates state pointers and invariant conditions to ensure correct algorithmic progression."
        return AIResponse(success=True, response=fallback_msg, fallback=True)

    def get_hint(self, algorithm_id: str, step_state: Dict[str, Any]) -> AIResponse:
        prompt = f"""Give a helpful learning hint without giving away the full answer for algorithm '{algorithm_id}' at action '{step_state.get('action')}'. Step message: {step_state.get('message')}."""
        res = self._call_groq(prompt)
        if res:
            return AIResponse(success=True, response=res, fallback=False)

        fallback_hint = f"🎯 **Hint for {algorithm_id.title()}**: Pay close attention to how state variables change after each step operation!"
        return AIResponse(success=True, response=fallback_hint, fallback=True)

    def chat(self, algorithm_id: str, message: str, step_state: Optional[Dict[str, Any]] = None) -> AIResponse:
        prompt = f"""User Question about {algorithm_id}: "{message}"
Current Step State: {step_state}"""
        res = self._call_groq(prompt)
        if res:
            return AIResponse(success=True, response=res, fallback=False)

        fallback_reply = f"🤖 **AI Tutor**: For `{algorithm_id}`, key principles involve maintaining correct invariant states at each step. (Note: Set `GROQ_API_KEY` in `.env` for real-time generative chat!)."
        return AIResponse(success=True, response=fallback_reply, fallback=True)

    def explain_code(self, code: str, language: str = "python") -> AIResponse:
        prompt = f"""Explain this {language} algorithm code step-by-step:\n\n```{language}\n{code}\n```"""
        res = self._call_groq(prompt)
        if res:
            return AIResponse(success=True, response=res, fallback=False)

        fallback_explain = f"📝 **Code Explanation**: The provided code implements data structure transformations using loops and conditional logic."
        return AIResponse(success=True, response=fallback_explain, fallback=True)

# Global AI Service Instance
ai_provider = GroqProvider()
