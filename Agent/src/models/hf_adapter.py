import os
from typing import Any, Dict, Optional

from huggingface_hub import InferenceClient

from .interface import ModelInterface


class HFModelAdapter(ModelInterface):

    def __init__(
        self,
        model_name: str,
        provider: str = "auto",
        token: Optional[str] = None
    ):
        self.model_name = model_name
        self.provider = provider
        self.token = token or os.getenv("HF_TOKEN")

        if not self.token:
            raise ValueError(
                "Hugging Face token not found. "
                "Set the HF_TOKEN environment variable."
            )

        self.client: Optional[InferenceClient] = None

    def load(self) -> None:

        if self.client is not None:
            return

        self.client = InferenceClient(
            provider=self.provider,
            api_key=self.token
        )

    def predict(
        self,
        input_data: Any,
        parameters: Optional[Dict[str, Any]] = None
    ) -> Any:

        if self.client is None:
            self.load()

        parameters = parameters or {}

        response = self.client.chat_completion(
            model=self.model_name,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": parameters.get(
                                "prompt",
                                "Analyze this remote-sensing image."
                            )
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": input_data
                            }
                        }
                    ]
                }
            ],
            max_tokens=parameters.get("max_tokens", 512),
            temperature=parameters.get("temperature", 0.2)
        )

        return response

    def unload(self) -> None:
        self.client = None