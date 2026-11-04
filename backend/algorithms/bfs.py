from typing import Dict, Any, List
from collections import deque
from backend.algorithms.base import BaseAlgorithmEngine
from backend.schemas.algorithm import AlgorithmExecuteResponse, ExecutionState

class BFSEngine(BaseAlgorithmEngine):
    def get_id(self) -> str:
        return "bfs"

    def execute(self, input_data: Dict[str, Any], params: Dict[str, Any] = None) -> AlgorithmExecuteResponse:
        merged = {**(params or {}), **(input_data or {})}
        raw_edges = merged.get("edges", ["A-B", "A-C", "B-D", "C-E", "D-F"])
        start_node = merged.get("start_node", "A")

        # Parse graph adj list and edges
        adj: Dict[str, List[str]] = {}
        parsed_edges = []
        nodes = set()

        for edge_str in raw_edges:
            if "-" in edge_str:
                u, v = edge_str.split("-")
                u, v = u.strip(), v.strip()
                if u and v:
                    nodes.add(u)
                    nodes.add(v)
                    adj.setdefault(u, []).append(v)
                    adj.setdefault(v, []).append(u)
                    parsed_edges.append({"from": u, "to": v})

        if not nodes:
            return AlgorithmExecuteResponse(
                success=False,
                algorithm="bfs",
                totalSteps=0,
                steps=[],
                error="Invalid or empty graph provided."
            )

        if start_node not in nodes:
            start_node = list(nodes)[0]

        steps: List[ExecutionState] = []
        queue = deque([start_node])
        visited = []
        traversal = []

        # Temp step list generation
        raw_states = []

        # Step 0: Initialization
        raw_states.append({
            "action": "initialize",
            "message": f"BFS initialized from starting node {start_node}. Queue contains [{start_node}].",
            "current": None,
            "visited": list(visited),
            "queue": list(queue),
            "traversal": list(traversal)
        })

        visited_set = {start_node}
        visited.append(start_node)

        while queue:
            curr = queue.popleft()
            traversal.append(curr)

            raw_states.append({
                "action": "visit_node",
                "message": f"Popped node {curr} from queue. Visiting node {curr}.",
                "current": curr,
                "visited": list(visited),
                "queue": list(queue),
                "traversal": list(traversal)
            })

            neighbors = sorted(adj.get(curr, []))
            for nbr in neighbors:
                if nbr not in visited_set:
                    visited_set.add(nbr)
                    visited.append(nbr)
                    queue.append(nbr)

                    raw_states.append({
                        "action": "add_queue",
                        "message": f"Discovered unvisited neighbor {nbr} of node {curr}. Added {nbr} to queue.",
                        "current": curr,
                        "visited": list(visited),
                        "queue": list(queue),
                        "traversal": list(traversal)
                    })

        # Final step
        raw_states.append({
            "action": "complete",
            "message": f"BFS Traversal complete! Final traversal order: {' → '.join(traversal)}.",
            "current": None,
            "visited": list(visited),
            "queue": [],
            "traversal": list(traversal)
        })

        total = len(raw_states)
        for idx, s in enumerate(raw_states, start=1):
            steps.append(self.create_state(
                step=idx,
                total_steps=total,
                action=s["action"],
                message=s["message"],
                current=s["current"],
                visited=s["visited"],
                queue=s["queue"],
                edges=parsed_edges,
                variables={"traversal": s["traversal"]},
                result={"traversal": traversal} if idx == total else None
            ))

        return AlgorithmExecuteResponse(
            success=True,
            algorithm="bfs",
            totalSteps=total,
            steps=steps,
            result={"traversal": traversal},
            complexity={"time": "O(V + E)", "space": "O(V)"}
        )
