from pydantic import BaseModel, Field, HttpUrl


class AnalyzeRequest(BaseModel):
    url: HttpUrl
    max_pages: int = 30
    min_text_chars: int = 200
    with_clusters: bool = True
    cluster_count: int | None = None


class ArticlePoint(BaseModel):
    id: str
    title: str
    url: HttpUrl
    x: float
    y: float
    cluster: int | None = None


class GapBriefRequest(BaseModel):
    url: HttpUrl
    click_x: float
    click_y: float
    nearby_points: list[ArticlePoint] = Field(default_factory=list)


class GapBriefResponse(BaseModel):
    title: str
    angle: str
    target_keywords: list[str]
    outline: list[str]
    rationale: str
