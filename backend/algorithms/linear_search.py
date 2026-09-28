from typing import Dict, Any
from backend.algorithms.base import BaseAlgorithmEngine
from backend.schemas.algorithm import AlgorithmExecuteResponse

class LinearSearchEngine(BaseAlgorithmEngine):
    def get_id(self) -> str:
        return "linear_search"

    def execute(self, input_data: Dict[str, Any], params: Dict[str, Any]) -> AlgorithmExecuteResponse:
        arr = list(input_data.get("array", [10, 50, 30, 70, 80, 20, 90]))
        target = input_data.get("target", 70)
        n = len(arr)
        steps = []

        total_s = n + 2

        steps.append({
            "step": 0,
            "totalSteps": total_s,
            "action": "initialize",
            "message": f"Step 0: Searching for target value '{target}' in array {arr} sequentially from left to right.",
            "array": list(arr),
            "pointers": {"current": 0}
        })

        found_idx = -1
        step_counter = 1
        for i in range(n):
            steps.append({
                "step": step_counter,
                "totalSteps": total_s,
                "action": "compare",
                "message": f"Step {step_counter}: Checking element arr[{i}] = {arr[i]}. Is {arr[i]} == {target}?",
                "array": list(arr),
                "pointers": {"compare": i}
            })
            step_counter += 1

            if arr[i] == target:
                found_idx = i
                steps.append({
                    "step": step_counter,
                    "totalSteps": total_s,
                    "action": "found",
                    "message": f"Step {step_counter}: Target element '{target}' FOUND at index [{i}]!",
                    "array": list(arr),
                    "pointers": {"current": i, "sorted": [i]}
                })
                break

        if found_idx == -1:
            steps.append({
                "step": step_counter,
                "totalSteps": total_s,
                "action": "not_found",
                "message": f"Finished: Searched entire array. Target '{target}' was NOT found in the array.",
                "array": list(arr),
                "pointers": {}
            })
        else:
            steps.append({
                "step": step_counter + 1,
                "totalSteps": step_counter + 2,
                "action": "complete",
                "message": f"Linear Search successful. Target '{target}' found at index [{found_idx}].",
                "array": list(arr),
                "pointers": {"sorted": [found_idx]}
            })

        for s in steps:
            s["totalSteps"] = len(steps)

        return AlgorithmExecuteResponse(
            success=True,
            algorithm=self.get_id(),
            totalSteps=len(steps),
            steps=steps,
            result={"found_index": found_idx},
            complexity={"time": "O(N)", "space": "O(1)"}
        )
