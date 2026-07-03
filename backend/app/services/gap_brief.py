import json
import re
from typing import Any

import httpx

from app.config import settings
from app.models.schemas import GapBriefRequest, GapBriefResponse


def _extract_seed_keywords(titles: list[str], max_keywords: int = 8) -> list[str]:
    stopwords = {
        "the",
        "and",
        "for",
        "with",
        "from",
        "that",
        "this",
        "your",
        "into",
        "what",
        "when",
        "where",
        "how",
        "why",
        "guide",
    }
    terms: list[str] = []
    for title in titles:
        for token in re.findall(r"[a-zA-Z]{4,}", title.lower()):
            if token not in stopwords and token not in terms:
                terms.append(token)
    return terms[:max_keywords]


def _fallback_brief(payload: GapBriefRequest) -> GapBriefResponse:
    nearby = payload.nearby_points[:5]
    anchor_titles = [point.title for point in nearby]
    seed_keywords = _extract_seed_keywords(anchor_titles)

    if not seed_keywords:
        seed_keywords = ["strategy", "workflow", "checklist", "best practices"]

    title_keyword = seed_keywords[0].replace("_", " ").title()
    secondary_keyword = (
        seed_keywords[1].replace("_", " ") if len(seed_keywords) > 1 else "implementation"
    )
    example_sources = ", ".join(anchor_titles[:2]) if anchor_titles else "current competitor coverage"

    return GapBriefResponse(
        title=f"{title_keyword}: Practical Playbook for 2026",
        angle=(
            f"Address the whitespace near map coordinates ({payload.click_x:.2f}, {payload.click_y:.2f}) "
            f"with a practical, outcome-focused article that bridges '{title_keyword}' and '{secondary_keyword}'."
        ),
        target_keywords=seed_keywords,
        outline=[
            "Problem framing and audience intent",
            "Step-by-step implementation workflow",
            "Tooling and operational checklist",
            "Common failure modes and mitigations",
            "Metrics, templates, and next actions",
        ],
        rationale=(
            "This location appears under-served relative to nearby topics. "
            f"Anchor references observed around this region include: {example_sources}."
        ),
    )


def _build_prompt(payload: GapBriefRequest) -> str:
    nearby = payload.nearby_points[:8]
    nearby_summary = [
        {
            "title": point.title,
            "url": str(point.url),
            "cluster": point.cluster,
            "x": round(point.x, 4),
            "y": round(point.y, 4),
        }
        for point in nearby
    ]

    prompt_data = {
        "site": str(payload.url),
        "gap_click": {"x": round(payload.click_x, 4), "y": round(payload.click_y, 4)},
        "nearby_articles": nearby_summary,
        "task": "Generate a concise SEO content brief for this semantic gap.",
        "output_format": {
            "title": "string",
            "angle": "string",
            "target_keywords": ["string"],
            "outline": ["string"],
            "rationale": "string",
        },
        "constraints": [
            "Return valid JSON only.",
            "target_keywords length 4..10.",
            "outline length 4..8.",
            "Avoid fluff and generic claims.",
        ],
    }

    return json.dumps(prompt_data, ensure_ascii=True)


def _extract_text_output(response_json: dict[str, Any]) -> str | None:
    output = response_json.get("output")
    if isinstance(output, list):
        for item in output:
            content = item.get("content") if isinstance(item, dict) else None
            if isinstance(content, list):
                for part in content:
                    if isinstance(part, dict) and part.get("type") == "output_text":
                        text = part.get("text")
                        if isinstance(text, str) and text.strip():
                            return text

    text = response_json.get("output_text")
    if isinstance(text, str) and text.strip():
        return text

    return None


def _call_llm_brief(payload: GapBriefRequest) -> GapBriefResponse | None:
    if not settings.openai_api_key:
        return None

    body = {
        "model": settings.openai_model,
        "input": [
            {
                "role": "system",
                "content": "You are an SEO strategist. Return only valid JSON.",
            },
            {
                "role": "user",
                "content": _build_prompt(payload),
            },
        ],
    }

    headers = {
        "Authorization": f"Bearer {settings.openai_api_key}",
        "Content-Type": "application/json",
    }

    base_url = settings.openai_base_url.rstrip("/")
    with httpx.Client(timeout=25.0) as client:
        response = client.post(f"{base_url}/responses", headers=headers, json=body)
        response.raise_for_status()
        data = response.json()

    raw_text = _extract_text_output(data)
    if not raw_text:
        return None

    start = raw_text.find("{")
    end = raw_text.rfind("}")
    if start == -1 or end == -1 or end <= start:
        return None

    candidate = raw_text[start : end + 1]
    parsed = json.loads(candidate)
    return GapBriefResponse.model_validate(parsed)


def generate_gap_brief(payload: GapBriefRequest) -> GapBriefResponse:
    try:
        llm_result = _call_llm_brief(payload)
        if llm_result:
            return llm_result
    except Exception:
        pass

    return _fallback_brief(payload)
