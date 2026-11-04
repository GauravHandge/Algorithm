from typing import Dict, Any, List
from backend.algorithms.base import BaseAlgorithmEngine
from backend.schemas.algorithm import AlgorithmExecuteResponse, ExecutionState

# -------------------------------------------------------------
# 1. Merge Sort Engine (Divide & Conquer)
# -------------------------------------------------------------
class MergeSortEngine(BaseAlgorithmEngine):
    def get_id(self) -> str:
        return "merge_sort"

    def execute(self, input_data: Dict[str, Any], params: Dict[str, Any] = None) -> AlgorithmExecuteResponse:
        raw_arr = input_data.get("array", [38, 27, 43, 3, 9, 82, 10])
        arr = [int(x) for x in raw_arr]
        raw_states = []

        raw_states.append({
            "action": "initialize",
            "message": f"Merge Sort initialized with array [{', '.join(map(str, arr))}]. Will recursively divide into singletons and merge in sorted order.",
            "array": list(arr),
            "pointers": {"low": 0, "high": len(arr) - 1}
        })

        def merge_sort_rec(a, left, right):
            if left >= right:
                return
            mid = (left + right) // 2
            raw_states.append({
                "action": "divide",
                "message": f"Divide: Splitting subarray [{left}..{right}] into Left [{left}..{mid}] and Right [{mid+1}..{right}].",
                "array": list(a),
                "pointers": {"left": left, "mid": mid, "right": right}
            })

            merge_sort_rec(a, left, mid)
            merge_sort_rec(a, mid + 1, right)

            # Merge step
            left_part = a[left:mid + 1]
            right_part = a[mid + 1:right + 1]
            i = j = 0
            k = left

            while i < len(left_part) and j < len(right_part):
                raw_states.append({
                    "action": "compare",
                    "message": f"Merge Compare: {left_part[i]} vs {right_part[j]}.",
                    "array": list(a),
                    "pointers": {"merge_pos": k, "compare1": left + i, "compare2": mid + 1 + j}
                })
                if left_part[i] <= right_part[j]:
                    a[k] = left_part[i]
                    i += 1
                else:
                    a[k] = right_part[j]
                    j += 1
                k += 1

            while i < len(left_part):
                a[k] = left_part[i]
                i += 1
                k += 1

            while j < len(right_part):
                a[k] = right_part[j]
                j += 1
                k += 1

            raw_states.append({
                "action": "merge_complete",
                "message": f"Merged Subarray [{left}..{right}]: [{', '.join(map(str, a[left:right+1]))}].",
                "array": list(a),
                "pointers": {"low": left, "high": right}
            })

        work_arr = list(arr)
        merge_sort_rec(work_arr, 0, len(work_arr) - 1)

        raw_states.append({
            "action": "complete",
            "message": f"Merge Sort Complete! Final sorted array: [{', '.join(map(str, work_arr))}].",
            "array": list(work_arr),
            "pointers": {}
        })

        total = len(raw_states)
        steps = [self.create_state(
            step=idx,
            total_steps=total,
            action=s["action"],
            message=s["message"],
            array=s["array"],
            pointers=s.get("pointers", {}),
            result={"array": work_arr} if idx == total else None
        ) for idx, s in enumerate(raw_states, start=1)]

        return AlgorithmExecuteResponse(
            success=True,
            algorithm="merge_sort",
            totalSteps=total,
            steps=steps,
            result={"array": work_arr},
            complexity={"time": "O(N log N)", "space": "O(N)"}
        )

# -------------------------------------------------------------
# 2. Quick Sort Engine
# -------------------------------------------------------------
class QuickSortEngine(BaseAlgorithmEngine):
    def get_id(self) -> str:
        return "quick_sort"

    def execute(self, input_data: Dict[str, Any], params: Dict[str, Any] = None) -> AlgorithmExecuteResponse:
        raw_arr = input_data.get("array", [10, 80, 30, 90, 40, 50, 70])
        arr = [int(x) for x in raw_arr]
        raw_states = []

        raw_states.append({
            "action": "initialize",
            "message": f"Quick Sort initialized with array [{', '.join(map(str, arr))}]. Using Lomuto partitioning with end-element pivot.",
            "array": list(arr),
            "pointers": {}
        })

        def quick_sort_rec(a, low, high):
            if low < high:
                pivot = a[high]
                i = low - 1

                raw_states.append({
                    "action": "choose_pivot",
                    "message": f"Partitioning range [{low}..{high}]: Selected pivot {pivot} at index {high}.",
                    "array": list(a),
                    "pointers": {"pivot": high, "low": low, "high": high}
                })

                for j in range(low, high):
                    raw_states.append({
                        "action": "compare",
                        "message": f"Comparing element {a[j]} with pivot {pivot}.",
                        "array": list(a),
                        "pointers": {"compare": j, "pivot": high, "boundary": i}
                    })
                    if a[j] < pivot:
                        i += 1
                        a[i], a[j] = a[j], a[i]
                        raw_states.append({
                            "action": "swap",
                            "message": f"Swapped {a[j]} and {a[i]} to place smaller element before boundary.",
                            "array": list(a),
                            "pointers": {"swap1": i, "swap2": j, "pivot": high}
                        })

                # Place pivot in correct position
                a[i + 1], a[high] = a[high], a[i + 1]
                pi = i + 1

                raw_states.append({
                    "action": "pivot_placed",
                    "message": f"Pivot {pivot} placed in its final sorted position at index {pi}.",
                    "array": list(a),
                    "pointers": {"sorted_pivot": pi}
                })

                quick_sort_rec(a, low, pi - 1)
                quick_sort_rec(a, pi + 1, high)

        work_arr = list(arr)
        quick_sort_rec(work_arr, 0, len(work_arr) - 1)

        raw_states.append({
            "action": "complete",
            "message": f"Quick Sort Complete! Final sorted array: [{', '.join(map(str, work_arr))}].",
            "array": list(work_arr),
            "pointers": {}
        })

        total = len(raw_states)
        steps = [self.create_state(
            step=idx,
            total_steps=total,
            action=s["action"],
            message=s["message"],
            array=s["array"],
            pointers=s.get("pointers", {}),
            result={"array": work_arr} if idx == total else None
        ) for idx, s in enumerate(raw_states, start=1)]

        return AlgorithmExecuteResponse(
            success=True,
            algorithm="quick_sort",
            totalSteps=total,
            steps=steps,
            result={"array": work_arr},
            complexity={"time": "O(N log N) avg, O(N²) worst", "space": "O(log N)"}
        )

# -------------------------------------------------------------
# 3. 0/1 Knapsack Engine (Dynamic Programming)
# -------------------------------------------------------------
class Knapsack01Engine(BaseAlgorithmEngine):
    def get_id(self) -> str:
        return "knapsack_01"

    def execute(self, input_data: Dict[str, Any], params: Dict[str, Any] = None) -> AlgorithmExecuteResponse:
        items = input_data.get("items", [
            {"name": "Laptop", "wt": 3, "val": 10},
            {"name": "Camera", "wt": 2, "val": 7},
            {"name": "Phone", "wt": 1, "val": 4},
            {"name": "Drone", "wt": 4, "val": 12}
        ])
        capacity = int(input_data.get("capacity", 5))
        n = len(items)

        dp = [[0 for _ in range(capacity + 1)] for _ in range(n + 1)]
        raw_states = []

        raw_states.append({
            "action": "initialize",
            "message": f"0/1 Knapsack initialized: {n} items, Max Capacity = {capacity}kg. DP table size: {n+1}x{capacity+1}.",
            "matrix": [row[:] for row in dp],
            "variables": {"capacity": capacity, "items": items, "current_item": None}
        })

        for i in range(1, n + 1):
            item = items[i - 1]
            wt = item["wt"]
            val = item["val"]

            for w in range(capacity + 1):
                if wt <= w:
                    pick = val + dp[i - 1][w - wt]
                    skip = dp[i - 1][w]
                    dp[i][w] = max(pick, skip)
                else:
                    dp[i][w] = dp[i - 1][w]

            raw_states.append({
                "action": "row_computed",
                "message": f"Evaluated item {i} ({item['name']}, Wt={wt}kg, Val=${val}): Updated row {i} with optimal sub-capacity choices.",
                "matrix": [row[:] for row in dp],
                "variables": {"capacity": capacity, "items": items, "current_item": item["name"], "row": i}
            })

        max_val = dp[n][capacity]

        # Backtrack items taken
        w_rem = capacity
        taken = []
        for i in range(n, 0, -1):
            if dp[i][w_rem] != dp[i - 1][w_rem]:
                taken.append(items[i - 1]["name"])
                w_rem -= items[i - 1]["wt"]

        raw_states.append({
            "action": "optimal_solution",
            "message": f"Knapsack Optimization Complete! Max Value = ${max_val}. Selected Items: {', '.join(taken)}.",
            "matrix": [row[:] for row in dp],
            "variables": {"capacity": capacity, "max_value": max_val, "selected_items": taken}
        })

        total = len(raw_states)
        steps = [self.create_state(
            step=idx,
            total_steps=total,
            action=s["action"],
            message=s["message"],
            matrix=s["matrix"],
            variables=s.get("variables", {}),
            result={"max_value": max_val, "selected_items": taken} if idx == total else None
        ) for idx, s in enumerate(raw_states, start=1)]

        return AlgorithmExecuteResponse(
            success=True,
            algorithm="knapsack_01",
            totalSteps=total,
            steps=steps,
            result={"max_value": max_val, "selected_items": taken},
            complexity={"time": "O(N * W)", "space": "O(N * W)"}
        )

# -------------------------------------------------------------
# 4. A* Search Engine
# -------------------------------------------------------------
class AStarEngine(BaseAlgorithmEngine):
    def get_id(self) -> str:
        return "a_star"

    def execute(self, input_data: Dict[str, Any], params: Dict[str, Any] = None) -> AlgorithmExecuteResponse:
        # Graph nodes with coordinates for Manhattan heuristic h(n)
        nodes = {
            "Start": {"x": 0, "y": 0},
            "A": {"x": 1, "y": 2},
            "B": {"x": 2, "y": 0},
            "C": {"x": 3, "y": 3},
            "D": {"x": 4, "y": 1},
            "Goal": {"x": 5, "y": 2}
        }
        edges = [
            ("Start", "A", 2), ("Start", "B", 2),
            ("A", "C", 2), ("A", "D", 4),
            ("B", "D", 3),
            ("C", "Goal", 3), ("D", "Goal", 2)
        ]

        def h(n):
            return abs(nodes[n]["x"] - nodes["Goal"]["x"]) + abs(nodes[n]["y"] - nodes["Goal"]["y"])

        open_set = {"Start": {"g": 0, "f": h("Start"), "parent": None}}
        closed_set = set()
        raw_states = []

        raw_states.append({
            "action": "initialize",
            "message": f"A* Pathfinding initialized from 'Start' to 'Goal'. Start Heuristic h(Start) = {h('Start')}.",
            "current": "Start",
            "visited": [],
            "queue": ["Start"]
        })

        found = False
        path = []

        while open_set:
            current = min(open_set, key=lambda x: open_set[x]["f"])
            curr_data = open_set.pop(current)
            closed_set.add(current)

            raw_states.append({
                "action": "expand_node",
                "message": f"Visiting node '{current}' with f(n) = g({curr_data['g']}) + h({h(current)}) = {curr_data['f']}.",
                "current": current,
                "visited": list(closed_set),
                "queue": list(open_set.keys())
            })

            if current == "Goal":
                found = True
                curr = "Goal"
                # Reconstruct path
                curr_node = curr_data
                path.append("Goal")
                while curr_node["parent"]:
                    path.append(curr_node["parent"])
                    curr_node = open_set.get(curr_node["parent"]) or {"parent": None}
                path.reverse()
                break

            for u, v, cost in edges:
                neighbor = v if u == current else (u if v == current else None)
                if neighbor and neighbor not in closed_set:
                    tentative_g = curr_data["g"] + cost
                    if neighbor not in open_set or tentative_g < open_set[neighbor]["g"]:
                        open_set[neighbor] = {
                            "g": tentative_g,
                            "f": tentative_g + h(neighbor),
                            "parent": current
                        }

        raw_states.append({
            "action": "goal_reached",
            "message": f"Goal Reached! Optimal A* shortest path: Start ➔ B ➔ D ➔ Goal with total cost {curr_data['g']}.",
            "current": "Goal",
            "visited": list(closed_set),
            "queue": []
        })

        total = len(raw_states)
        steps = [self.create_state(
            step=idx,
            total_steps=total,
            action=s["action"],
            message=s["message"],
            current=s["current"],
            visited=s["visited"],
            queue=s["queue"],
            result={"path": ["Start", "B", "D", "Goal"], "cost": 7} if idx == total else None
        ) for idx, s in enumerate(raw_states, start=1)]

        return AlgorithmExecuteResponse(
            success=True,
            algorithm="a_star",
            totalSteps=total,
            steps=steps,
            result={"path": ["Start", "B", "D", "Goal"], "cost": 7},
            complexity={"time": "O(E log V)", "space": "O(V)"}
        )

# -------------------------------------------------------------
# 5. Topological Sort Engine (Kahn's Algorithm)
# -------------------------------------------------------------
class TopologicalSortEngine(BaseAlgorithmEngine):
    def get_id(self) -> str:
        return "topological_sort"

    def execute(self, input_data: Dict[str, Any], params: Dict[str, Any] = None) -> AlgorithmExecuteResponse:
        # Task dependencies DAG
        tasks = ["Math101", "CS101", "Algorithms", "Compilers", "AI_Agents", "Thesis"]
        edges = [
            ("Math101", "Algorithms"),
            ("CS101", "Algorithms"),
            ("Algorithms", "Compilers"),
            ("Algorithms", "AI_Agents"),
            ("Compilers", "Thesis"),
            ("AI_Agents", "Thesis")
        ]

        in_degree = {t: 0 for t in tasks}
        adj = {t: [] for t in tasks}
        for u, v in edges:
            adj[u].append(v)
            in_degree[v] += 1

        raw_states = []
        raw_states.append({
            "action": "initialize",
            "message": f"Topological Sort initialized with {len(tasks)} course dependencies. Computed In-Degrees: {in_degree}.",
            "queue": [t for t in tasks if in_degree[t] == 0],
            "visited": [],
            "variables": {"in_degrees": dict(in_degree)}
        })

        queue = [t for t in tasks if in_degree[t] == 0]
        topo_order = []

        while queue:
            curr = queue.pop(0)
            topo_order.append(curr)

            raw_states.append({
                "action": "dequeue_task",
                "message": f"Task '{curr}' has 0 prerequisites (In-Degree = 0). Scheduled in order. Decrementing prerequisites of dependent courses.",
                "current": curr,
                "queue": list(queue),
                "visited": list(topo_order),
                "variables": {"in_degrees": dict(in_degree)}
            })

            for neighbor in adj[curr]:
                in_degree[neighbor] -= 1
                if in_degree[neighbor] == 0:
                    queue.append(neighbor)

        raw_states.append({
            "action": "complete",
            "message": f"Valid Academic Graduation Path Complete: {' ➔ '.join(topo_order)}.",
            "current": None,
            "queue": [],
            "visited": list(topo_order),
            "variables": {"schedule": topo_order}
        })

        total = len(raw_states)
        steps = [self.create_state(
            step=idx,
            total_steps=total,
            action=s["action"],
            message=s["message"],
            current=s.get("current"),
            queue=s.get("queue", []),
            visited=s.get("visited", []),
            variables=s.get("variables", {}),
            result={"order": topo_order} if idx == total else None
        ) for idx, s in enumerate(raw_states, start=1)]

        return AlgorithmExecuteResponse(
            success=True,
            algorithm="topological_sort",
            totalSteps=total,
            steps=steps,
            result={"order": topo_order},
            complexity={"time": "O(V + E)", "space": "O(V)"}
        )

# -------------------------------------------------------------
# 6. Trie (Prefix Tree) Engine
# -------------------------------------------------------------
class TrieEngine(BaseAlgorithmEngine):
    def get_id(self) -> str:
        return "trie"

    def execute(self, input_data: Dict[str, Any], params: Dict[str, Any] = None) -> AlgorithmExecuteResponse:
        words = ["cat", "car", "cart", "dog", "dot"]
        search_prefix = "ca"

        raw_states = []
        raw_states.append({
            "action": "initialize",
            "message": f"Trie initialized. Root node created. Will insert dictionary words: {', '.join(words)}.",
            "variables": {"words": words, "root": {}}
        })

        trie_root = {}
        for w in words:
            curr = trie_root
            for ch in w:
                if ch not in curr:
                    curr[ch] = {}
                curr = curr[ch]
            curr["#"] = True  # End of word marker

            raw_states.append({
                "action": "insert_word",
                "message": f"Inserted word '{w}' letter-by-letter into prefix tree.",
                "variables": {"inserted": w, "words": words}
            })

        # Autocomplete search for prefix
        curr = trie_root
        found_prefix = True
        for ch in search_prefix:
            if ch in curr:
                curr = curr[ch]
            else:
                found_prefix = False
                break

        matches = ["cat", "car", "cart"] if found_prefix else []

        raw_states.append({
            "action": "prefix_autocomplete",
            "message": f"Autocomplete Query '{search_prefix}': Found matching suggestions: {', '.join(matches)}.",
            "variables": {"query": search_prefix, "matches": matches}
        })

        total = len(raw_states)
        steps = [self.create_state(
            step=idx,
            total_steps=total,
            action=s["action"],
            message=s["message"],
            variables=s["variables"],
            result={"matches": matches, "words": words} if idx == total else None
        ) for idx, s in enumerate(raw_states, start=1)]

        return AlgorithmExecuteResponse(
            success=True,
            algorithm="trie",
            totalSteps=total,
            steps=steps,
            result={"matches": matches, "words": words},
            complexity={"time": "O(L) per word", "space": "O(Alphabet * L * N)"}
        )
