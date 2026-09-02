from typing import Any, Dict

from .interface import ModelInterface


class ModelAdapter(ModelInterface):

    def __init__(self, model):
        self.model = model
        self.loaded = False

    def load(self) -> None:

        if self.loaded:
            return

        # Model-specific loading can be implemented here.

        self.loaded = True

    def predict(
        self,
        input_data: Any,
        parameters: Dict[str, Any] | None = None
    ) -> Any:

        if not self.loaded:
            self.load()

        parameters = parameters or {}

        return self.model(
            input_data,
            **parameters
        )

    def unload(self) -> None:

        if not self.loaded:
            return

        self.model = None
        self.loaded = False