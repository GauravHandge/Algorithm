from typing import Dict, Any, List
from backend.algorithms.base import BaseAlgorithmEngine
from backend.schemas.algorithm import AlgorithmExecuteResponse, ExecutionState

class CaesarCipherEngine(BaseAlgorithmEngine):
    def get_id(self) -> str:
        return "caesar_cipher"

    def execute(self, input_data: Dict[str, Any], params: Dict[str, Any] = None) -> AlgorithmExecuteResponse:
        text = str(input_data.get("text", "HELLOCIPHER")).upper()
        shift = int(input_data.get("shift", 3)) % 26

        raw_states = []
        result_chars = []

        raw_states.append({
            "action": "initialize",
            "message": f"Caesar Cipher initialized with text '{text}' and shift k = {shift}.",
            "array": list(text),
            "pointers": {},
            "result_str": ""
        })

        for idx, char in enumerate(text):
            if char.isalpha():
                orig_code = ord(char) - ord('A')
                new_code = (orig_code + shift) % 26
                new_char = chr(ord('A') + new_code)
                result_chars.append(new_char)

                raw_states.append({
                    "action": "encrypt_char",
                    "message": f"Step {idx+1}: Character '{char}' (val {orig_code}) + shift {shift} = {orig_code + shift} mod 26 = {new_code} → '{new_char}'.",
                    "array": list(text),
                    "pointers": {"current_index": idx},
                    "result_str": "".join(result_chars),
                    "variables": {"char": char, "shift": shift, "encrypted_char": new_char}
                })
            else:
                result_chars.append(char)
                raw_states.append({
                    "action": "pass_char",
                    "message": f"Step {idx+1}: '{char}' is non-alphabetic, preserved unchanged.",
                    "array": list(text),
                    "pointers": {"current_index": idx},
                    "result_str": "".join(result_chars)
                })

        encrypted_text = "".join(result_chars)
        raw_states.append({
            "action": "complete",
            "message": f"Caesar Cipher Encryption Complete! Final Ciphertext: '{encrypted_text}'.",
            "array": list(text),
            "pointers": {},
            "result_str": encrypted_text
        })

        total = len(raw_states)
        steps = []
        for s_idx, s in enumerate(raw_states, start=1):
            steps.append(self.create_state(
                step=s_idx,
                total_steps=total,
                action=s["action"],
                message=s["message"],
                array=s["array"],
                pointers=s["pointers"],
                variables={"result_text": s.get("result_str", "")},
                result={"ciphertext": encrypted_text} if s_idx == total else None
            ))

        return AlgorithmExecuteResponse(
            success=True,
            algorithm="caesar_cipher",
            totalSteps=total,
            steps=steps,
            result={"ciphertext": encrypted_text},
            complexity={"time": "O(n)", "space": "O(n)"}
        )
