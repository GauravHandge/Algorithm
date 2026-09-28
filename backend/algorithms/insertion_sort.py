from typing import Dict, Any
from backend.algorithms.base import BaseAlgorithmEngine
from backend.schemas.algorithm import AlgorithmExecuteResponse

class InsertionSortEngine(BaseAlgorithmEngine):
    def get_id(self) -> str:
        return "insertion_sort"

    def execute(self, input_data: Dict[str, Any], params: Dict[str, Any]) -> AlgorithmExecuteResponse:
        arr = list(input_data.get("array", [12, 11, 13, 5, 6]))
        n = len(arr)
        steps = []
        sorted_indices = [0]

        total_s = n * n

        steps.append({
            "step": 0,
            "totalSteps": total_s,
            "action": "initialize",
            "message": f"Step 0: Initialized Insertion Sort with array {arr}. Element at index [0] ({arr[0]}) is initially considered sorted.",
            "array": list(arr),
            "pointers": {"current": 0, "sorted": list(sorted_indices)}
        })

        step_counter = 1
        for i in range(1, n):
            key = arr[i]
            j = i - 1
            steps.append({
                "step": step_counter,
                "totalSteps": total_s,
                "action": "select_key",
                "message": f"Step {step_counter}: Selected key arr[{i}] = {key}. We will shift sorted elements greater than {key} to the right.",
                "array": list(arr),
                "pointers": {"current": i, "compare": j, "sorted": list(sorted_indices)}
            })
            step_counter += 1

            while j >= 0 and arr[j] > key:
                steps.append({
                    "step": step_counter,
                    "totalSteps": total_s,
                    "action": "shift",
                    "message": f"Step {step_counter}: arr[{j}] = {arr[j]} > key ({key}). Shifting {arr[j]} to position [{j+1}].",
                    "array": list(arr),
                    "pointers": {"swap": j+1, "compare": j, "sorted": list(sorted_indices)}
                })
                step_counter += 1
                arr[j + 1] = arr[j]
                j -= 1

            arr[j + 1] = key
            sorted_indices.append(i)
            steps.append({
                "step": step_counter,
                "totalSteps": total_s,
                "action": "insert_key",
                "message": f"Step {step_counter}: Placed key ({key}) into its correct sorted position at index [{j+1}].",
                "array": list(arr),
                "pointers": {"current": j+1, "sorted": list(sorted_indices)}
            })
            step_counter += 1

        steps.append({
            "step": step_counter,
            "totalSteps": step_counter + 1,
            "action": "complete",
            "message": f"Finished! Insertion Sort completed. Sorted array: {arr}.",
            "array": list(arr),
            "pointers": {"sorted": list(range(n))}
        })

        for s in steps:
            s["totalSteps"] = len(steps)

        return AlgorithmExecuteResponse(
            success=True,
            algorithm=self.get_id(),
            totalSteps=len(steps),
            steps=steps,
            result={"sorted_array": arr},
            complexity={"time": "O(N^2)", "space": "O(1)"}
        )
