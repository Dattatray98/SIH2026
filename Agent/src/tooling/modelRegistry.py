from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional
from models.interface import ModelInterface


@dataclass
class ModelInfo:

    name: str
    task: str
    modalities: List[str] = field(default_factory=list)

    model: ModelInterface | None = None

    version: Optional[str] = None

    metadata: Dict[str, Any] = field(
        default_factory=dict
    )

class ModelRegistry:

    def __init__(self):
        self._models: Dict[str, ModelInfo] = {}

    def register(self, model_info: ModelInfo) -> None:
        if model_info.name in self._models:
            raise ValueError(
                f"Model already registered: {model_info.name}"
            )

        self._models[model_info.name] = model_info

    def get(self, name: str) -> ModelInfo:
        if name not in self._models:
            raise KeyError(f"Model not found: {name}")

        return self._models[name]

    def has(self, name: str) -> bool:
        return name in self._models

    def list_models(self) -> List[str]:
        return list(self._models.keys())

    def find_by_task(self, task: str) -> List[ModelInfo]:
        return [
            model
            for model in self._models.values()
            if model.task == task
        ]

    def find_by_modality(self, modality: str) -> List[ModelInfo]:
        return [
            model
            for model in self._models.values()
            if modality in model.modalities
        ]

    def remove(self, name: str) -> None:
        if name not in self._models:
            raise KeyError(f"Model not found: {name}")

        del self._models[name]

    def clear(self) -> None:
        self._models.clear()