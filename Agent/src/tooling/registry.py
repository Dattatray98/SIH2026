from typing import Dict, List, Optional

from .interface import ToolInterface


class ToolRegistry:

    def __init__(self):
        self._tools: Dict[str, ToolInterface] = {}

    def register(self, name: str, tool: ToolInterface) -> None:
        if name in self._tools:
            raise ValueError(f"Tool already registered: {name}")

        self._tools[name] = tool

    def get(self, name: str) -> ToolInterface:
        if name not in self._tools:
            raise KeyError(f"Tool not found: {name}")

        return self._tools[name]

    def has(self, name: str) -> bool:
        return name in self._tools

    def list_tools(self) -> List[str]:
        return list(self._tools.keys())

    def remove(self, name: str) -> None:
        if name not in self._tools:
            raise KeyError(f"Tool not found: {name}")

        del self._tools[name]

    def clear(self) -> None:
        self._tools.clear()     