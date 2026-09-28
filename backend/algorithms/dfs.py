from typing import Dict, Any, List
from backend.algorithms.base import BaseAlgorithmEngine
from backend.schemas.algorithm import AlgorithmExecuteResponse, ExecutionState

class DFSEngine(BaseAlgorithmEngine):
    def get_id(self) -> str:
        return "dfs"

    def execute(self, input_data: Dict[str, Any], params: Dict[str, Any] = None) -> AlgorithmExecuteResponse:
        raw_edges = input_data.get("edges", ["A-B", "A-C", "B-D", "C-E", "D-F"])
        start_node = input_data.get("start_node", "A")

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
                algorithm="dfs",
                totalSteps=0,
                steps=[],
                error="Invalid or empty graph provided."
            )

        if start_node not in nodes:
            start_node = list(nodes)[0]

        raw_states = []
        visited_set = set()
        visited_list = []
        stack = [start_node]
        traversal = []

        raw_states.append({
            "action": "initialize",
            "message": f"DFS initialized starting from node {start_node}. Stack contains [{start_node}].",
            "current": None,
            "visited": list(visited_list),
            "stack": list(stack),
            "traversal": list(traversal)
        })

        def dfs_recursive(curr: str):
            visited_set.add(curr)
            visited_list.append(curr)
            traversal.append(curr)

            raw_states.append({
                "action": "visit_node",
                "message": f"Visiting node {curr}. Pushed to call stack.",
                "current": curr,
                "visited": list(visited_list),
                "stack": list(visited_list), # call stack
                "traversal": list(traversal)
            })

            neighbors = sorted(adj.get(curr, []))
            for nbr in neighbors:
                if nbr not in visited_set:
                    dfs_recursive(nbr)
                    # Backtrack state
                    raw_states.append({
                        "action": "backtrack",
                        "message": f"Backtracking to node {curr} from neighbor {nbr}.",
                        "current": curr,
                        "visited": list(visited_list),
                        "stack": list(visited_list[:visited_list.index(curr)+1]),
                        "traversal": list(traversal)
                    })

        dfs_recursive(start_node)

        raw_states.append({
            "action": "complete",
            "message": f"DFS Traversal complete! Final traversal order: {' → '.join(traversal)}.",
            "current": None,
            "visited": list(visited_list),
            "stack": [],
            "traversal": list(traversal)
        })

        total = len(raw_states)
        steps = []
        for idx, s in enumerate(raw_states, start=1):
            steps.append(self.create_state(
                step=idx,
                total_steps=total,
                action=s["action"],
                message=s["message"],
                current=s["current"],
                visited=s["visited"],
                stack=s["stack"],
                edges=parsed_edges,
                variables={"traversal": s["traversal"]},
                result={"traversal": traversal} if idx == total else None
            ))

        return AlgorithmExecuteResponse(
            success=True,
            algorithm="dfs",
            totalSteps=total,
            steps=steps,
            result={"traversal": traversal},
            complexity={"time": "O(V + E)", "space": "O(V)"}
        )
