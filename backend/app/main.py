from fastapi import FastAPI, HTTPException

from app.models.schemas import (
    AnalyzeRequest,
    ArticlePoint,
    GapBriefRequest,
    GapBriefResponse,
)
from app.services.embedder import embed_texts
from app.services.gap_brief import generate_gap_brief
from app.services.reducer import assign_clusters, reduce_vectors
from app.services.scraper import scrape_site

app = FastAPI(title="TopicMap.ai API", version="0.1.0")


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/analyze", response_model=list[ArticlePoint])
def analyze_site(payload: AnalyzeRequest) -> list[ArticlePoint]:
    pages = scrape_site(
        home_url=str(payload.url),
        max_pages=payload.max_pages,
        min_text_chars=payload.min_text_chars,
    )
    if not pages:
        raise HTTPException(
            status_code=422,
            detail="No indexable pages were scraped from the provided URL.",
        )

    vectors = embed_texts([page.text for page in pages])
    if not vectors:
        raise HTTPException(
            status_code=422,
            detail="Unable to generate embeddings from scraped content.",
        )

    coordinates = reduce_vectors(vectors)
    clusters = (
        assign_clusters(vectors, requested_clusters=payload.cluster_count)
        if payload.with_clusters
        else [None] * len(pages)
    )

    points: list[ArticlePoint] = []
    for idx, page in enumerate(pages):
        point = coordinates[idx]
        points.append(
            ArticlePoint(
                id=f"doc-{idx + 1}",
                title=page.title,
                url=page.url,
                x=point["x"],
                y=point["y"],
                cluster=clusters[idx],
            )
        )

    return points


@app.post("/gaps/brief", response_model=GapBriefResponse)
def gap_brief(payload: GapBriefRequest) -> GapBriefResponse:
    return generate_gap_brief(payload)
