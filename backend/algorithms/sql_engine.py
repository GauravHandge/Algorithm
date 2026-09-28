from typing import Dict, Any, List
from backend.algorithms.base import BaseAlgorithmEngine
from backend.schemas.algorithm import AlgorithmExecuteResponse, ExecutionState

class SQLEngine(BaseAlgorithmEngine):
    def get_id(self) -> str:
        return "sql_engine"

    def execute(self, input_data: Dict[str, Any], params: Dict[str, Any] = None) -> AlgorithmExecuteResponse:
        # Sample table users: id, name, age, dept
        table_users = [
            {"id": 1, "name": "Alice", "age": 25, "dept": "Engineering"},
            {"id": 2, "name": "Bob", "age": 30, "dept": "Marketing"},
            {"id": 3, "name": "Charlie", "age": 22, "dept": "Engineering"},
            {"id": 4, "name": "Diana", "age": 35, "dept": "Finance"}
        ]

        query = input_data.get("query", "SELECT name, age FROM users WHERE age >= 25")
        raw_states = []

        # Step 0: Parse Query
        raw_states.append({
            "action": "parse_query",
            "message": f"Parsing SQL Query: '{query}'. Target Table: 'users'.",
            "matrix": [list(row.values()) for row in table_users],
            "variables": {"stage": "PARSING", "query": query}
        })

        # Step 1: Scan FROM users
        raw_states.append({
            "action": "scan_table",
            "message": "Phase 1 (FROM users): Scanning table 'users' containing 4 rows into working memory.",
            "matrix": [list(row.values()) for row in table_users],
            "variables": {"stage": "FROM", "rows_scanned": len(table_users)}
        })

        # Step 2: Filter WHERE age >= 25
        filtered_rows = []
        for idx, row in enumerate(table_users):
            match = row["age"] >= 25
            if match:
                filtered_rows.append(row)
            raw_states.append({
                "action": "filter_where",
                "message": f"Phase 2 (WHERE age >= 25): Evaluating Row {row['id']} ({row['name']}, age={row['age']}) → {'PASS' if match else 'FAIL'}.",
                "matrix": [list(r.values()) for r in filtered_rows],
                "pointers": {"current_row": idx},
                "variables": {"stage": "WHERE", "matching_rows": len(filtered_rows)}
            })

        # Step 3: Project SELECT name, age
        projected = [{"name": r["name"], "age": r["age"]} for r in filtered_rows]
        raw_states.append({
            "action": "project_columns",
            "message": f"Phase 3 (SELECT name, age): Projecting columns 'name' and 'age' from {len(filtered_rows)} filtered rows.",
            "matrix": [[r["name"], r["age"]] for r in projected],
            "variables": {"stage": "SELECT", "result_count": len(projected)}
        })

        # Step 4: Final Output
        raw_states.append({
            "action": "complete",
            "message": f"SQL Query Execution Complete! Returned {len(projected)} result rows.",
            "matrix": [[r["name"], r["age"]] for r in projected],
            "result": projected
        })

        total = len(raw_states)
        steps = []
        for idx, s in enumerate(raw_states, start=1):
            steps.append(self.create_state(
                step=idx,
                total_steps=total,
                action=s["action"],
                message=s["message"],
                matrix=s.get("matrix"),
                pointers=s.get("pointers", {}),
                variables=s.get("variables", {}),
                result=s.get("result") if idx == total else None
            ))

        return AlgorithmExecuteResponse(
            success=True,
            algorithm="sql_engine",
            totalSteps=total,
            steps=steps,
            result={"result_rows": projected},
            complexity={"time": "O(N)", "space": "O(N)"}
        )
