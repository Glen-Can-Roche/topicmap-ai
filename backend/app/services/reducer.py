import math
from typing import Any

import umap
from sklearn.cluster import KMeans


reducer = umap.UMAP(n_components=2, random_state=42)


def reduce_vectors(vectors: list[list[float]]) -> list[dict[str, Any]]:
    if not vectors:
        return []

    coords = reducer.fit_transform(vectors)
    return [{"x": float(x), "y": float(y)} for x, y in coords]


def assign_clusters(vectors: list[list[float]], requested_clusters: int | None = None) -> list[int | None]:
    if not vectors:
        return []

    total = len(vectors)
    if total < 3:
        return [None] * total

    cluster_count = requested_clusters or min(8, max(2, int(math.sqrt(total))))
    cluster_count = max(2, min(cluster_count, total))

    model = KMeans(n_clusters=cluster_count, random_state=42, n_init="auto")
    labels = model.fit_predict(vectors)
    return [int(label) for label in labels]
