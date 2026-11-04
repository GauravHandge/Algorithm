from typing import Dict, Any, List
from backend.algorithms.base import BaseAlgorithmEngine
from backend.schemas.algorithm import AlgorithmExecuteResponse

class DijkstraEngine(BaseAlgorithmEngine):
    def get_id(self) -> str:
        return "dijkstra"

    def execute(self, input_data: Dict[str, Any], params: Dict[str, Any] = None) -> AlgorithmExecuteResponse:
        merged = {**(params or {}), **(input_data or {})}
        edges = merged.get("edges", ["A-B", "A-C", "B-D", "C-E"])
        start_node = merged.get("start_node", "A")

        # Build Graph
        graph = {}
        for edge in edges:
            if typeof_edge := isinstance(edge, str):
                parts = edge.split("-")
                u, v = parts[0], parts[1]
                w = 1
            else:
                u = edge.get("source")
                v = edge.get("target")
                w = edge.get("weight", 1)

            if u not in graph: graph[u] = []
            if v not in graph: graph[v] = []
            graph[u].append((v, w))
            graph[v].append((u, w))

        nodes = list(graph.keys())
        distances = {n: float('inf') for n in nodes}
        distances[start_node] = 0

        steps = []
        visited = []
        unvisited = list(nodes)

        total_s = 2 + len(nodes) * 2

        # Step 1: Initialize
        steps.append({
            "step": 0,
            "totalSteps": total_s,
            "action": "initialize",
            "message": f"Step 0: Starting Dijkstra algorithm from node '{start_node}'. We initialize dist[{start_node}] = 0 and all other nodes to infinity (∞) because we haven't discovered paths to them yet.",
            "current_node": start_node,
            "visited": list(visited),
            "queue": list(unvisited),
            "edges": edges,
            "nodes": nodes,
            "variables": {"distances": {k: (v if v != float('inf') else "∞") for k, v in distances.items()}}
        })

        step_counter = 1
        while unvisited:
            curr = min(unvisited, key=lambda n: distances[n])
            if distances[curr] == float('inf'):
                break

            unvisited.remove(curr)
            visited.append(curr)

            steps.append({
                "step": step_counter,
                "totalSteps": total_s,
                "action": "extract_min",
                "message": f"Step {step_counter}: Selected unvisited node '{curr}' because it currently has the smallest known distance ({distances[curr]}). We mark node '{curr}' as visited.",
                "current_node": curr,
                "visited": list(visited),
                "queue": list(unvisited),
                "edges": edges,
                "nodes": nodes,
                "variables": {"distances": {k: (v if v != float('inf') else "∞") for k, v in distances.items()}}
            })
            step_counter += 1

            for neighbor, weight in graph.get(curr, []):
                if neighbor in unvisited:
                    new_dist = distances[curr] + weight
                    if new_dist < distances[neighbor]:
                        distances[neighbor] = new_dist
                        steps.append({
                            "step": step_counter,
                            "totalSteps": total_s,
                            "action": "relax_edge",
                            "message": f"Step {step_counter}: Inspecting edge ({curr} -> {neighbor}) with weight {weight}. We found a shorter path to node '{neighbor}'! Updating dist[{neighbor}] = {distances[curr]} + {weight} = {new_dist}.",
                            "current_node": neighbor,
                            "visited": list(visited),
                            "queue": list(unvisited),
                            "edges": edges,
                            "nodes": nodes,
                            "variables": {"distances": {k: (v if v != float('inf') else "∞") for k, v in distances.items()}}
                        })
                        step_counter += 1

        steps.append({
            "step": step_counter,
            "totalSteps": step_counter + 1,
            "action": "complete",
            "message": f"Finished! All reachable nodes have been processed. Dijkstra has successfully calculated the absolute shortest path from node '{start_node}' to all other vertices.",
            "current_node": None,
            "visited": list(visited),
            "queue": [],
            "edges": edges,
            "nodes": nodes,
            "variables": {"distances": {k: (v if v != float('inf') else "∞") for k, v in distances.items()}}
        })

        for s in steps:
            s["totalSteps"] = len(steps)


        return AlgorithmExecuteResponse(
            success=True,
            algorithm=self.get_id(),
            totalSteps=len(steps),
            steps=steps,
            result={"shortest_distances": distances},
            complexity={"time": "O((V + E) log V)", "space": "O(V)"}
        )
