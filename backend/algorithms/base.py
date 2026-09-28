from abc import ABC, abstractmethod
from typing import Dict, Any, List
from backend.schemas.algorithm import ExecutionState, AlgorithmExecuteResponse

class BaseAlgorithmEngine(ABC):
    @abstractmethod
    def get_id(self) -> str:
        pass

    @abstractmethod
    def execute(self, input_data: Dict[str, Any], params: Dict[str, Any] = None) -> AlgorithmExecuteResponse:
        pass

    def create_state(
        self,
        step: int,
        total_steps: int,
        action: str,
        message: str,
        current: Any = None,
        visited: List[Any] = None,
        queue: List[Any] = None,
        stack: List[Any] = None,
        array: List[Any] = None,
        matrix: List[List[Any]] = None,
        pointers: Dict[str, Any] = None,
        variables: Dict[str, Any] = None,
        edges: List[Any] = None,
        result: Any = None
    ) -> ExecutionState:
        return ExecutionState(
            step=step,
            totalSteps=total_steps,
            action=action,
            message=message,
            current=current,
            visited=visited if visited is not None else [],
            queue=queue if queue is not None else [],
            stack=stack if stack is not None else [],
            array=array if array is not None else [],
            matrix=matrix,
            pointers=pointers if pointers is not None else {},
            variables=variables if variables is not None else {},
            edges=edges if edges is not None else [],
            result=result
        )
