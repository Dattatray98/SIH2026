from abc import ABC, abstractmethod
from typing import Any, Dict


class ModelInterface(ABC):

    @abstractmethod
    def load(self) -> None:
        """
        Load the model into memory.
        """
        pass

    @abstractmethod
    def predict(
        self,
        input_data: Any,
        parameters: Dict[str, Any] | None = None
    ) -> Any:
        """
        Execute model inference.
        """
        pass

    @abstractmethod
    def unload(self) -> None:
        """
        Release model resources.
        """
        pass