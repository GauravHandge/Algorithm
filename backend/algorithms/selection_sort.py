from typing import Dict, Any
from backend.algorithms.base import BaseAlgorithmEngine
from backend.schemas.algorithm import AlgorithmExecuteResponse

class SelectionSortEngine(BaseAlgorithmEngine):
    def get_id(self) -> str:
        return "selection_sort"

    def execute(self, input_data: Dict[str, Any], params: Dict[str, Any]) -> AlgorithmExecuteResponse:
        arr = list(input_data.get("array", [29, 10, 14, 37, 13]))
        n = len(arr)
        steps = []
        sorted_indices = []

        total_s = n * n

        steps.append({
            "step": 0,
            "totalSteps": total_s,
            "action": "initialize",
            "message": f"Step 0: Initialized Selection Sort with array {arr}. We will repeatedly find the minimum element in the unsorted region and swap it into place.",
            "array": list(arr),
            "pointers": {"current": 0, "sorted": list(sorted_indices)}
        })

        step_counter = 1
        for i in range(n):
            min_idx = i
            steps.append({
                "step": step_counter,
                "totalSteps": total_s,
                "action": "select_min",
                "message": f"Step {step_counter}: Starting pass {i+1}. Assuming minimum element is at index [{i}] with value {arr[i]}.",
                "array": list(arr),
                "pointers": {"current": i, "compare": min_idx, "sorted": list(sorted_indices)}
            })
            step_counter += 1

            for j in range(i + 1, n):
                steps.append({
                    "step": step_counter,
                    "totalSteps": total_s,
                    "action": "compare",
                    "message": f"Step {step_counter}: Comparing current min element arr[{min_idx}]={arr[min_idx]} with arr[{j}]={arr[j]}.",
                    "array": list(arr),
                    "pointers": {"current": i, "compare": j, "swap": min_idx, "sorted": list(sorted_indices)}
                })
                step_counter += 1

                if arr[j] < arr[min_idx]:
                    min_idx = j
                    steps.append({
                        "step": step_counter,
                        "totalSteps": total_s,
                        "action": "update_min",
                        "message": f"Step {step_counter}: Found a smaller element! New minimum is arr[{min_idx}] = {arr[min_idx]}.",
                        "array": list(arr),
                        "pointers": {"current": i, "compare": min_idx, "sorted": list(sorted_indices)}
                    })
                    step_counter += 1

            if min_idx != i:
                steps.append({
                    "step": step_counter,
                    "totalSteps": total_s,
                    "action": "swap",
                    "message": f"Step {step_counter}: Swapping element arr[{i}]={arr[i]} with minimum element arr[{min_idx}]={arr[min_idx]}.",
                    "array": list(arr),
                    "pointers": {"swap": i, "compare": min_idx, "sorted": list(sorted_indices)}
                })
                step_counter += 1
                arr[i], arr[min_idx] = arr[min_idx], arr[i]

            sorted_indices.append(i)

        steps.append({
            "step": step_counter,
            "totalSteps": step_counter + 1,
            "action": "complete",
            "message": f"Finished! Array is now completely sorted: {arr}.",
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
