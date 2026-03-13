import asyncio
import json
import os
import re

from dotenv import load_dotenv
from groq import APIConnectionError, APIError, APIStatusError, APITimeoutError, AsyncGroq

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_TIMEOUT_SECONDS = float(os.getenv("GROQ_TIMEOUT_SECONDS", "20"))
GROQ_MAX_RETRIES = int(os.getenv("GROQ_MAX_RETRIES", "1"))

# Groq deprecated the older llama3-*-8192 ids, so we default to the current equivalents.
HARASSMENT_MODEL = os.getenv("GROQ_HARASSMENT_MODEL", "llama-3.3-70b-versatile")
ASSISTANT_MODEL = os.getenv("GROQ_ASSISTANT_MODEL", "llama-3.3-70b-versatile")
SAFE_ROUTE_MODEL = os.getenv("GROQ_ROUTE_MODEL", "llama-3.1-8b-instant")

_client = None


class GroqAIError(RuntimeError):
    """Raised when a Groq request cannot produce a usable answer."""


def _get_client():
    global _client

    if not GROQ_API_KEY:
        raise GroqAIError("GROQ_API_KEY is not configured")

    if _client is None:
        _client = AsyncGroq(
            api_key=GROQ_API_KEY,
            timeout=GROQ_TIMEOUT_SECONDS,
            max_retries=GROQ_MAX_RETRIES,
        )

    return _client


def _extract_error_detail(exc):
    response = getattr(exc, "response", None)
    if response is not None:
        try:
            payload = response.json()
        except Exception:
            payload = None

        if isinstance(payload, dict):
            error = payload.get("error")
            if isinstance(error, dict):
                for key in ("message", "detail", "type"):
                    value = error.get(key)
                    if isinstance(value, str) and value.strip():
                        return value.strip()
            elif isinstance(error, str) and error.strip():
                return error.strip()

            for key in ("message", "detail"):
                value = payload.get(key)
                if isinstance(value, str) and value.strip():
                    return value.strip()

        text = getattr(response, "text", None)
        if isinstance(text, str) and text.strip():
            return text.strip()

    return str(exc)

def _extract_message_text(completion):

    # Case 1 — Groq SDK object
    choices = getattr(completion, "choices", None)

    # Case 2 — dict response (OpenAI/OpenRouter style)
    if choices is None and isinstance(completion, dict):
        choices = completion.get("choices")

    if not choices:
        raise GroqAIError("LLM returned no choices")

    first = choices[0]

    # SDK style
    message = getattr(first, "message", None)

    # dict style
    if message is None and isinstance(first, dict):
        message = first.get("message")

    if not message:
        raise GroqAIError("LLM returned empty message")

    # SDK style
    content = getattr(message, "content", None)

    # dict style
    if content is None and isinstance(message, dict):
        content = message.get("content")

    if isinstance(content, str) and content.strip():
        return content.strip()

    raise GroqAIError("LLM returned empty content")

def _extract_json_block(raw_text):
    cleaned = (raw_text or "").strip()
    cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
    cleaned = re.sub(r"\s*```$", "", cleaned)

    try:
        parsed = json.loads(cleaned)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", cleaned, re.DOTALL)
        if not match:
            raise GroqAIError("Groq did not return a JSON object")

        try:
            parsed = json.loads(match.group(0))
        except json.JSONDecodeError as exc:
            raise GroqAIError("Groq returned malformed JSON") from exc

    if not isinstance(parsed, dict):
        raise GroqAIError("Groq JSON response was not an object")

    return parsed


async def groq_text_completion(
    *,
    system_prompt,
    user_prompt,
    model,
    max_tokens,
    temperature=0.2,
):
    client = _get_client()

    request = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        temperature=temperature,
        max_completion_tokens=max_tokens,
    )

    try:
        completion = await asyncio.wait_for(
            request,
            timeout=GROQ_TIMEOUT_SECONDS + 5,
        )
    except asyncio.TimeoutError as exc:
        raise GroqAIError("Groq request timed out") from exc
    except APITimeoutError as exc:
        raise GroqAIError("Groq request timed out") from exc
    except APIConnectionError as exc:
        raise GroqAIError(f"Groq connection failed: {_extract_error_detail(exc)}") from exc
    except APIStatusError as exc:
        detail = _extract_error_detail(exc)
        raise GroqAIError(f"Groq API error ({exc.status_code}): {detail}") from exc
    except APIError as exc:
        raise GroqAIError(f"Groq request failed: {_extract_error_detail(exc)}") from exc

    return _extract_message_text(completion)


async def groq_json_completion(
    *,
    system_prompt,
    user_prompt,
    model,
    max_tokens,
    temperature=0.1,
):
    client = _get_client()

    request = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        temperature=temperature,
        max_completion_tokens=max_tokens,
        response_format={"type": "json_object"},
    )

    try:
        completion = await asyncio.wait_for(
            request,
            timeout=GROQ_TIMEOUT_SECONDS + 5,
        )
    except asyncio.TimeoutError as exc:
        raise GroqAIError("Groq request timed out") from exc
    except APITimeoutError as exc:
        raise GroqAIError("Groq request timed out") from exc
    except APIConnectionError as exc:
        raise GroqAIError(f"Groq connection failed: {_extract_error_detail(exc)}") from exc
    except APIStatusError as exc:
        detail = _extract_error_detail(exc)
        raise GroqAIError(f"Groq API error ({exc.status_code}): {detail}") from exc
    except APIError as exc:
        raise GroqAIError(f"Groq request failed: {_extract_error_detail(exc)}") from exc

    return _extract_json_block(_extract_message_text(completion))
