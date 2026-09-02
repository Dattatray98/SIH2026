from pathlib import Path
from typing import Any, Dict

from tooling.interface import ToolInterface
from tooling.result import ToolResult

from preprocessing.pipeline import PreprocessingPipeline


class SingleImageryTool(ToolInterface):

    def __init__(self, model_registry):
        self.model_registry = model_registry
        self.preprocessor = PreprocessingPipeline()

    def validate(self, request: Dict[str, Any]) -> bool:
        image = request.get("image")
        task = request.get("task")

        if not image:
            return False

        if not Path(image).exists():
            return False

        supported_tasks = {
            "vqa",
            "captioning",
            "grounding"
        }

        if task not in supported_tasks:
            return False

        return True

    def preprocess(self, request: Dict[str, Any]) -> Any:
        image = request["image"]

        return self.preprocessor.process(image)

    def execute(self, input_data: Any, request: Dict[str, Any]) -> Any:
        task = request["task"]

        model = self.model_registry.find_by_task(task)

        if not model:
            raise RuntimeError(
                f"No model registered for task: {task}"
            )

        selected_model = model[0]

        return selected_model.model.generate(
            input_data,
            request
        )

    def postprocess(
        self,
        output: Any,
        request: Dict[str, Any]
    ) -> ToolResult:

        return ToolResult(
            success=True,
            tool_name="SingleImageryTool",
            task=request["task"],
            answer=str(output)
        )

    def run(self, request: Dict[str, Any]) -> ToolResult:

        try:

            if not self.validate(request):
                return ToolResult(
                    success=False,
                    tool_name="SingleImageryTool",
                    task=request.get("task", "unknown"),
                    error="Invalid single-image request."
                )

            processed = self.preprocess(request)

            output = self.execute(
                processed,
                request
            )

            return self.postprocess(
                output,
                request
            )

        except Exception as e:

            return ToolResult(
                success=False,
                tool_name="SingleImageryTool",
                task=request.get("task", "unknown"),
                error=str(e)
            )