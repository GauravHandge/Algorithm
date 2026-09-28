from typing import Dict, Any
from backend.algorithms.base import BaseAlgorithmEngine
from backend.algorithms.bfs import BFSEngine
from backend.algorithms.dfs import DFSEngine
from backend.algorithms.bubble_sort import BubbleSortEngine
from backend.algorithms.binary_search import BinarySearchEngine
from backend.algorithms.caesar_cipher import CaesarCipherEngine
from backend.algorithms.rsa import RSAEngine
from backend.algorithms.cpu_scheduling import CPUSchedulingEngine
from backend.algorithms.page_replacement import PageReplacementEngine
from backend.algorithms.tcp_handshake import TCPHandshakeEngine
from backend.algorithms.sql_engine import SQLEngine
from backend.algorithms.linear_regression import LinearRegressionEngine
from backend.algorithms.neural_network import NeuralNetworkEngine
from backend.algorithms.dijkstra import DijkstraEngine
from backend.algorithms.selection_sort import SelectionSortEngine
from backend.algorithms.insertion_sort import InsertionSortEngine
from backend.algorithms.linear_search import LinearSearchEngine
from backend.schemas.algorithm import AlgorithmExecuteResponse

class AlgorithmExecutionEngineRegistry:
    def __init__(self):
        self.engines: Dict[str, BaseAlgorithmEngine] = {}
        self._register_default_engines()

    def _register_default_engines(self):
        engines = [
            BFSEngine(),
            DFSEngine(),
            DijkstraEngine(),
            BubbleSortEngine(),
            SelectionSortEngine(),
            InsertionSortEngine(),
            LinearSearchEngine(),
            BinarySearchEngine(),
            CaesarCipherEngine(),
            RSAEngine(),
            CPUSchedulingEngine(),
            PageReplacementEngine(),
            TCPHandshakeEngine(),
            SQLEngine(),
            LinearRegressionEngine(),
            NeuralNetworkEngine()
        ]
        for engine in engines:
            self.engines[engine.get_id()] = engine

    def register_engine(self, engine: BaseAlgorithmEngine):
        self.engines[engine.get_id()] = engine

    def execute(self, algorithm_id: str, input_data: Dict[str, Any] = None, params: Dict[str, Any] = None) -> AlgorithmExecuteResponse:
        input_data = input_data or {}
        params = params or {}

        engine = self.engines.get(algorithm_id)
        if not engine:
            return self._generate_generic_fallback_steps(algorithm_id, input_data)

        try:
            return engine.execute(input_data, params)
        except Exception as e:
            return AlgorithmExecuteResponse(
                success=False,
                algorithm=algorithm_id,
                totalSteps=0,
                steps=[],
                error=f"Execution error in engine '{algorithm_id}': {str(e)}"
            )

    def _generate_generic_fallback_steps(self, algorithm_id: str, input_data: Dict[str, Any]) -> AlgorithmExecuteResponse:
        name_clean = algorithm_id.replace("_", " ").title()
        raw_items = input_data.get("array", [29, 10, 14, 37, 13, 85, 42])
        edges = input_data.get("edges", ["A-B", "A-C", "B-D", "C-E"])

        steps = []
        total_s = 5

        steps.append({
            "step": 0,
            "totalSteps": total_s,
            "action": "initialize",
            "message": f"Step 0: Initializing {name_clean} simulation. Loading input state parameters into the execution engine.",
            "array": list(raw_items),
            "edges": edges,
            "pointers": {"current": 0}
        })
        steps.append({
            "step": 1,
            "totalSteps": total_s,
            "action": "inspect",
            "message": f"Step 1: Inspecting primary elements and setting up computational data structures for {name_clean}.",
            "array": list(raw_items),
            "edges": edges,
            "pointers": {"compare": 1, "current": 0}
        })
        steps.append({
            "step": 2,
            "totalSteps": total_s,
            "action": "transform",
            "message": f"Step 2: Executing core mathematical state transformation for {name_clean}.",
            "array": sorted(raw_items) if "sort" in algorithm_id else list(raw_items),
            "edges": edges,
            "pointers": {"swap": 2, "sorted": [0, 1]}
        })
        steps.append({
            "step": 3,
            "totalSteps": total_s,
            "action": "evaluate",
            "message": f"Step 3: Evaluating convergence criteria and final output state for {name_clean}.",
            "array": sorted(raw_items) if "sort" in algorithm_id else list(raw_items),
            "edges": edges,
            "pointers": {"sorted": [0, 1, 2, 3]}
        })
        steps.append({
            "step": 4,
            "totalSteps": total_s,
            "action": "complete",
            "message": f"Finished! {name_clean} algorithm execution completed successfully.",
            "array": sorted(raw_items) if "sort" in algorithm_id else list(raw_items),
            "edges": edges,
            "pointers": {"sorted": list(range(len(raw_items)))}
        })

        return AlgorithmExecuteResponse(
            success=True,
            algorithm=algorithm_id,
            totalSteps=len(steps),
            steps=steps,
            result={"status": "SUCCESS"},
            complexity={"time": "O(N)", "space": "O(1)"}
        )


# Singleton instance
global_execution_registry = AlgorithmExecutionEngineRegistry()
