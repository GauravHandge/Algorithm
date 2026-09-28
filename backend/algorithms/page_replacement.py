from typing import Dict, Any, List
from backend.algorithms.base import BaseAlgorithmEngine
from backend.schemas.algorithm import AlgorithmExecuteResponse, ExecutionState

class PageReplacementEngine(BaseAlgorithmEngine):
    def get_id(self) -> str:
        return "page_replacement"

    def execute(self, input_data: Dict[str, Any], params: Dict[str, Any] = None) -> AlgorithmExecuteResponse:
        algorithm_type = input_data.get("algorithm_type", "LRU").upper()
        pages = input_data.get("pages", [7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2])
        num_frames = int(input_data.get("capacity", 3))

        raw_states = []
        frames = []
        page_faults = 0
        hits = 0
        usage_history = {} # page -> last_used_time

        raw_states.append({
            "action": "initialize",
            "message": f"Page Replacement ({algorithm_type}) initialized with {num_frames} frames. Reference string: {pages}.",
            "array": list(frames),
            "variables": {"faults": 0, "hits": 0, "current_page": None}
        })

        for t, page in enumerate(pages):
            is_hit = page in frames

            if is_hit:
                hits += 1
                usage_history[page] = t
                raw_states.append({
                    "action": "page_hit",
                    "message": f"Step {t+1}: Page {page} is already in memory (FRAME HIT). Memory: {frames}.",
                    "array": list(frames),
                    "variables": {"faults": page_faults, "hits": hits, "current_page": page, "status": "HIT"}
                })
            else:
                page_faults += 1
                if len(frames) < num_frames:
                    frames.append(page)
                    replaced = None
                else:
                    if algorithm_type == "FIFO":
                        replaced = frames.pop(0)
                    else: # LRU
                        lru_page = min(frames, key=lambda p: usage_history.get(p, -1))
                        frames.remove(lru_page)
                        replaced = lru_page
                    frames.append(page)

                usage_history[page] = t
                msg = f"Step {t+1}: Page {page} NOT in memory (PAGE FAULT)."
                if replaced is not None:
                    msg += f" Evicted page {replaced} to make room for {page}."

                raw_states.append({
                    "action": "page_fault",
                    "message": msg,
                    "array": list(frames),
                    "variables": {"faults": page_faults, "hits": hits, "current_page": page, "status": "FAULT", "replaced": replaced}
                })

        raw_states.append({
            "action": "complete",
            "message": f"Page Replacement Complete! Total Page Faults: {page_faults}, Total Hits: {hits}, Hit Ratio: {hits/len(pages):.2%}.",
            "array": list(frames),
            "variables": {"faults": page_faults, "hits": hits, "hit_ratio": hits/len(pages)}
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
                variables=s["variables"],
                result={"faults": page_faults, "hits": hits, "final_frames": frames} if idx == total else None
            ))

        return AlgorithmExecuteResponse(
            success=True,
            algorithm="page_replacement",
            totalSteps=total,
            steps=steps,
            result={"faults": page_faults, "hits": hits, "final_frames": frames},
            complexity={"time": "O(N)", "space": "O(K)"}
        )
