from typing import Dict, Any, List
from backend.algorithms.base import BaseAlgorithmEngine
from backend.schemas.algorithm import AlgorithmExecuteResponse, ExecutionState

class BinarySearchEngine(BaseAlgorithmEngine):
    def get_id(self) -> str:
        return "binary_search"

    def execute(self, input_data: Dict[str, Any], params: Dict[str, Any] = None) -> AlgorithmExecuteResponse:
        raw_arr = input_data.get("array", [2, 4, 7, 10, 14, 18, 22])
        target = input_data.get("target", 14)

        try:
            target = int(target)
        except (ValueError, TypeError):
            target = 14

        arr = sorted([int(x) for x in raw_arr])
        n = len(arr)
        raw_states = []

        raw_states.append({
            "action": "initialize",
            "message": f"Binary Search initialized for target {target} on sorted array [{', '.join(map(str, arr))}].",
            "array": list(arr),
            "pointers": {"low": 0, "high": n - 1},
            "eliminated": []
        })

        low, high = 0, n - 1
        found_idx = -1

        while low <= high:
            mid = (low + high) // 2
            eliminated = list(range(0, low)) + list(range(high + 1, n))

            raw_states.append({
                "action": "calculate_mid",
                "message": f"Low = {low}, High = {high}. Calculated Mid = ({low} + {high}) // 2 = {mid} (element {arr[mid]}).",
                "array": list(arr),
                "pointers": {"low": low, "mid": mid, "high": high},
                "eliminated": eliminated
            })

            if arr[mid] == target:
                found_idx = mid
                raw_states.append({
                    "action": "found",
                    "message": f"Target {target} found at index {mid}!",
                    "array": list(arr),
                    "pointers": {"target": mid},
                    "eliminated": eliminated
                })
                break
            elif arr[mid] < target:
                raw_states.append({
                    "action": "move_low",
                    "message": f"Element {arr[mid]} < target {target}. Moving Low to mid + 1 ({mid + 1}).",
                    "array": list(arr),
                    "pointers": {"low": mid + 1, "high": high},
                    "eliminated": eliminated + list(range(low, mid + 1))
                })
                low = mid + 1
            else:
                raw_states.append({
                    "action": "move_high",
                    "message": f"Element {arr[mid]} > target {target}. Moving High to mid - 1 ({mid - 1}).",
                    "array": list(arr),
                    "pointers": {"low": low, "high": mid - 1},
                    "eliminated": eliminated + list(range(mid, high + 1))
                })
                high = mid - 1

        if found_idx == -1:
            raw_states.append({
                "action": "not_found",
                "message": f"Low ({low}) > High ({high}). Target {target} is not present in the array.",
                "array": list(arr),
                "pointers": {},
                "eliminated": list(range(n))
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
                variables={"eliminated": s["eliminated"], "target": target},
                result={"found_index": found_idx} if idx == total else None
            ))

        return AlgorithmExecuteResponse(
            success=True,
            algorithm="binary_search",
            totalSteps=total,
            steps=steps,
            result={"found_index": found_idx},
            complexity={"time": "O(log n)", "space": "O(1)"}
        )
