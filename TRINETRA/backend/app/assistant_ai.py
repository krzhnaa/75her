import re

from app.groq_ai import ASSISTANT_MODEL, GroqAIError, groq_text_completion


def _fallback_support_reply(user_message: str):
    message = (user_message or "").strip()
    lower = message.lower()

    urgent = bool(re.search(r"\b(help|emergency|attack|unsafe|stalk|follow|threat|suicide|self harm)\b", lower))
    legal = bool(re.search(r"\b(law|legal|police|fir|complaint|report)\b", lower))

    if urgent:
        return (
            "**Immediate Safety**\n"
            "- Move to a public or locked safe place now.\n"
            "- Call a trusted person and share your live location.\n"
            "- Contact local emergency services if you are in immediate danger.\n"
            "- Keep screenshots, names, timestamps, and links if it is safe to do so."
        )

    if legal:
        return (
            "**Legal Support**\n"
            "I can help you organize the facts before you report.\n"
            "- Write a short timeline of what happened.\n"
            "- Save screenshots, URLs, phone numbers, and dates.\n"
            "- If you want, send me the situation in steps and I will help structure a complaint.\n"
            "This is informational support, not a substitute for a licensed legal professional."
        )

    return (
        "**Support**\n"
        "You do not need to handle this alone.\n"
        "- Tell me what happened in one or two steps.\n"
        "- I can help you think through evidence, next actions, or a calm response plan.\n"
        "- If there is immediate danger, contact trusted people and emergency services first."
    )


async def emotional_support_reply(user_message: str):
    system_prompt = """
You are AURA Advanced, a women-safety and wellbeing AI assistant.

Behavior:
- Be empathetic, calm, and practical.
- Prioritize immediate safety when the user may be in danger.
- Explain women-focused legal awareness in simple language.
- Keep responses concise, actionable, and structured.
- Use plain conversational text only.
- Use short headings and bullet points when helpful.
- Do not fabricate legal claims or unsafe advice.
"""

    user_prompt = f"""
Respond to the following user message as AURA Advanced.

User message:
\"\"\"{user_message}\"\"\"
"""

    try:
        response = await groq_text_completion(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            model=ASSISTANT_MODEL,
            max_tokens=320,
            temperature=0.3,
        )
    except GroqAIError:
        return _fallback_support_reply(user_message)

    cleaned = response.replace("```", "").strip()
    return cleaned or _fallback_support_reply(user_message)
