from typing import Dict, Any, List
from backend.algorithms.base import BaseAlgorithmEngine
from backend.schemas.algorithm import AlgorithmExecuteResponse, ExecutionState

class BubbleSortEngine(BaseAlgorithmEngine):
    def get_id(self) -> str:
        return "bubble_sort"

    def execute(self, input_data: Dict[str, Any], params: Dict[str, Any] = None) -> AlgorithmExecuteResponse:
        raw_arr = input_data.get("array", [5, 2, 8, 1, 3])
        if not isinstance(raw_arr, list) or len(raw_arr) == 0:
            raw_arr = [5, 2, 8, 1, 3]

        arr = [int(x) for x in raw_arr]
        n = len(arr)
        raw_states = []

        raw_states.append({
            "action": "initialize",
            "message": f"Bubble Sort initialized with array [{', '.join(map(str, arr))}].",
            "array": list(arr),
            "pointers": {},
            "sorted_indices": []
        })

        sorted_indices = []

        for i in range(n):
            swapped = False
            for j in range(0, n - i - 1):
                # Comparison step
                raw_states.append({
                    "action": "compare",
                    "message": f"Pass {i+1}: Comparing elements at index {j} ({arr[j]}) and index {j+1} ({arr[j+1]}).",
                    "array": list(arr),
                    "pointers": {"compare1": j, "compare2": j + 1},
                    "sorted_indices": list(sorted_indices)
                })

                if arr[j] > arr[j+1]:
                    # Swap step
                    arr[j], arr[j+1] = arr[j+1], arr[j]
                    swapped = True
                    raw_states.append({
                        "action": "swap",
                        "message": f"Swapped {arr[j+1]} and {arr[j]} because {arr[j+1]} > {arr[j]}.",
                        "array": list(arr),
                        "pointers": {"swap1": j, "swap2": j + 1},
                        "sorted_indices": list(sorted_indices)
                    })

            # Element at n - i - 1 is now sorted
            sorted_indices.append(n - i - 1)
            raw_states.append({
                "action": "pass_complete",
                "message": f"Pass {i+1} completed. Element {arr[n - i - 1]} at index {n - i - 1} is now placed in sorted position.",
                "array": list(arr),
                "pointers": {},
                "sorted_indices": list(sorted_indices)
            })

            if not swapped:
                # Early stop if already sorted
                break

        # All sorted
        all_sorted = list(range(n))
        raw_states.append({
            "action": "complete",
            "message": f"Bubble Sort complete! Final sorted array: [{', '.join(map(str, arr))}].",
            "array": list(arr),
            "pointers": {},
            "sorted_indices": all_sorted
        })

        total = len(raw_states)
        steps = []
        for idx, s in enumerate(raw_states, start=1):
            steps.append(self.create_state(
                step=idx,
                total_steps=total,
                action=s["action"],
                message=s["message"],
                array=s["array"],
                pointers=s["pointers"],
                variables={"sorted_indices": s["sorted_indices"]},
                result={"array": arr} if idx == total else None
            ))

        return AlgorithmExecuteResponse(
            success=True,
            algorithm="bubble_sort",
            totalSteps=total,
            steps=steps,
            result={"array": arr},
            complexity={"time": "O(n²)", "space": "O(1)"}
        )
