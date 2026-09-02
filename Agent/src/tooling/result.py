from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional


@dataclass
class ToolResult:
    success: bool
    tool_name: str
    task: str

    answer: Optional[str] = None

    evidence: List[Any] = field(default_factory=list)

    confidence: Optional[float] = None

    metadata: Dict[str, Any] = field(default_factory=dict)

    execution_time: Optional[float] = None

    error: Optional[str] = None

    warnings: List[str] = field(default_factory=list)