from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class ExecutionState(BaseModel):
    step: int
    totalSteps: int
    action: str # e.g. "initialize", "compare", "swap", "visit_node", "encrypt_block", "update_weights"
    message: str
    current: Optional[Any] = None
    visited: Optional[List[Any]] = []
    queue: Optional[List[Any]] = []
    stack: Optional[List[Any]] = []
    array: Optional[List[Any]] = []
    matrix: Optional[List[List[Any]]] = None
    pointers: Optional[Dict[str, Any]] = {} # e.g. {"low": 0, "mid": 3, "high": 6}
    variables: Optional[Dict[str, Any]] = {}
    edges: Optional[List[Any]] = []
    result: Optional[Any] = None

class AlgorithmExecuteRequest(BaseModel):
    input_data: Optional[Dict[str, Any]] = None
    params: Optional[Dict[str, Any]] = None

class AlgorithmExecuteResponse(BaseModel):
    success: bool
    algorithm: str
    totalSteps: int
    steps: List[ExecutionState]
    result: Optional[Any] = None
    complexity: Optional[Dict[str, str]] = None
    error: Optional[str] = None

class AlgorithmSummary(BaseModel):
    id: str
    topic_id: str
    name: str
    short_description: Optional[str] = None
    category: str
    difficulty: str
    time_complexity: Optional[str] = None
    space_complexity: Optional[str] = None
    visualizer_type: str

class AlgorithmDetail(AlgorithmSummary):
    full_description: Optional[str] = None
    pseudocode: Optional[str] = None
    default_input: Optional[Dict[str, Any]] = None
