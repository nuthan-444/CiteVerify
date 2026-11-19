"""OpenAI-compatible Groq client wrapper with fallback models."""

from openai import OpenAI
import logging
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

from app.config import settings

logger = logging.getLogger(__name__)

# Fallback models in priority order
MODELS_TO_TRY = [
    settings.GROQ_MODEL,
    "openai/gpt-oss-120b",
    "openai/gpt-oss-20b",
    "qwen/qwen3.8-27b",
]
# Remove duplicates while preserving order
AVAILABLE_MODELS = list(dict.fromkeys([m for m in MODELS_TO_TRY if m]))


class GroqClient:
    """Wrapper around Groq LLM via OpenAI-compatible API."""

    def __init__(self):
        self.api_key = settings.GROQ_API_KEY
        self.base_url = settings.GROQ_BASE_URL
        self._client = None
        self.current_model = settings.GROQ_MODEL or "openai/gpt-oss-120b"

    @property
    def client(self) -> OpenAI:
        if self._client is None:
            self._client = OpenAI(
                api_key=settings.GROQ_API_KEY,
                base_url=settings.GROQ_BASE_URL,
            )
        return self._client

    def chat(
        self,
        messages: list[dict],
        temperature: float = 0.1,
        max_tokens: int = 4096,
        response_format: dict | None = None,
    ) -> str:
        """Send a chat completion request to Groq trying available models."""
        last_error = None
        models = [self.current_model] + [m for m in AVAILABLE_MODELS if m != self.current_model]

        for model in models:
            try:
                kwargs = {
                    "model": model,
                    "messages": messages,
                    "temperature": temperature,
                    "max_tokens": max_tokens,
                }
                if response_format:
                    kwargs["response_format"] = response_format

                response = self.client.chat.completions.create(**kwargs)
                self.current_model = model
                return response.choices[0].message.content or "{}"
            except Exception as e:
                logger.warning(f"Groq completion failed with model {model}: {e}")
                last_error = e

        if last_error:
            raise last_error
        return "{}"

    def chat_json(
        self,
        messages: list[dict],
        temperature: float = 0.1,
        max_tokens: int = 4096,
    ) -> str:
        """Send a chat completion expecting JSON output."""
        return self.chat(
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
            response_format={"type": "json_object"},
        )


groq_client = GroqClient()
