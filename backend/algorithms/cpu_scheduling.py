from typing import Dict, Any, List
from backend.algorithms.base import BaseAlgorithmEngine
from backend.schemas.algorithm import AlgorithmExecuteResponse, ExecutionState

class CPUSchedulingEngine(BaseAlgorithmEngine):
    def get_id(self) -> str:
        return "cpu_scheduling"

    def execute(self, input_data: Dict[str, Any], params: Dict[str, Any] = None) -> AlgorithmExecuteResponse:
        algorithm_type = input_data.get("algorithm_type", "FCFS").upper()
        # Default processes: P1 (burst 5), P2 (burst 3), P3 (burst 8)
        processes = input_data.get("processes", [
            {"id": "P1", "burst": 5, "arrival": 0},
            {"id": "P2", "burst": 3, "arrival": 1},
            {"id": "P3", "burst": 8, "arrival": 2}
        ])

        raw_states = []
        gantt_chart = []
        current_time = 0

        raw_states.append({
            "action": "initialize",
            "message": f"CPU Scheduling ({algorithm_type}) initialized with {len(processes)} processes.",
            "queue": [p["id"] for p in processes],
            "variables": {"gantt": [], "time": 0}
        })

        if algorithm_type == "SJF":
            sorted_procs = sorted(processes, key=lambda x: (x["arrival"], x["burst"]))
        else: # FCFS
            sorted_procs = sorted(processes, key=lambda x: x["arrival"])

        for proc in sorted_procs:
            pid = proc["id"]
            burst = proc["burst"]

            if current_time < proc["arrival"]:
                current_time = proc["arrival"]

            start_t = current_time
            end_t = current_time + burst
            current_time = end_t

            gantt_entry = {"process": pid, "start": start_t, "end": end_t}
            gantt_chart.append(gantt_entry)

            raw_states.append({
                "action": "execute_process",
                "message": f"Time {start_t} → {end_t}: Process {pid} running on CPU (Burst = {burst}).",
                "current": pid,
                "variables": {"gantt": list(gantt_chart), "time": current_time}
            })

        raw_states.append({
            "action": "complete",
            "message": f"CPU Scheduling complete! Final Gantt Chart: {gantt_chart}",
            "current": None,
            "variables": {"gantt": gantt_chart, "time": current_time}
        })

        total = len(raw_states)
        steps = []
        for idx, s in enumerate(raw_states, start=1):
            steps.append(self.create_state(
                step=idx,
                total_steps=total,
                action=s["action"],
                message=s["message"],
                current=s.get("current"),
                queue=s.get("queue", []),
                variables=s.get("variables", {}),
                result={"gantt_chart": gantt_chart} if idx == total else None
            ))

        return AlgorithmExecuteResponse(
            success=True,
            algorithm="cpu_scheduling",
            totalSteps=total,
            steps=steps,
            result={"gantt_chart": gantt_chart},
            complexity={"time": "O(n log n)", "space": "O(n)"}
        )
