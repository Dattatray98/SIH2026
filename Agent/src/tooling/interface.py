from abc import ABC, abstractmethod
from typing import Any


class ToolInterface(ABC):

    @abstractmethod
    def validate(self, request: Any) -> bool:
        """
        Validate whether this tool can handle the request.
        """
        pass

    @abstractmethod
    def preprocess(self, request: Any) -> Any:
        """
        Prepare the input for model execution.
        """
        pass

    @abstractmethod
    def execute(self, input_data: Any) -> Any:
        """
        Execute the specialist model/tool.
        """
        pass

    @abstractmethod
    def postprocess(self, output: Any) -> Any:
        """
        Convert raw model output into a standardized result.
        """
        pass