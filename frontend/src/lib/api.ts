import { getDemoBrief, getDemoPoints } from "@/lib/demo-data";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ?? "";

export type ArticlePoint = {
  id: string;
  title: string;
  url: string;
  x: number;
  y: number;
  cluster: number | null;
};

export type GapBriefRequest = {
  url: string;
  click_x: number;
  click_y: number;
  nearby_points: ArticlePoint[];
};

export type GapBriefResponse = {
  title: string;
  angle: string;
  target_keywords: string[];
  outline: string[];
  rationale: string;
};

type AnalyzePayload = {
  url: string;
  max_pages?: number;
  min_text_chars?: number;
  with_clusters?: boolean;
  cluster_count?: number;
};

export async function healthCheck() {
  if (!API_BASE_URL) {
    return { status: "demo" };
  }

  const res = await fetch(`${API_BASE_URL}/health`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error("Failed backend health check");
  }
  return res.json();
}

export async function analyzeSite(payload: AnalyzePayload): Promise<ArticlePoint[]> {
  if (!API_BASE_URL) {
    return getDemoPoints(payload.url);
  }

  const res = await fetch(`${API_BASE_URL}/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    return getDemoPoints(payload.url);
  }

  return res.json();
}

export async function generateGapBrief(payload: GapBriefRequest): Promise<GapBriefResponse> {
  if (!API_BASE_URL) {
    return getDemoBrief(payload);
  }

  const res = await fetch(`${API_BASE_URL}/gaps/brief`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    return getDemoBrief(payload);
  }

  return res.json();
}
