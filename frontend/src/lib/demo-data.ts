import type { ArticlePoint, GapBriefRequest, GapBriefResponse } from "@/lib/api";

function hashString(input: string) {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function getShift(input: string) {
  const hash = hashString(input);
  return {
    x: ((hash % 13) - 6) * 0.03,
    y: (((hash >> 3) % 13) - 6) * 0.03,
  };
}

const basePoints: ArticlePoint[] = [
  {
    id: "demo-1",
    title: "Competitive content strategy framework",
    url: "https://demo.topicmap.ai/strategy-framework",
    x: -0.82,
    y: 0.24,
    cluster: 0,
  },
  {
    id: "demo-2",
    title: "SEO brief template for agencies",
    url: "https://demo.topicmap.ai/seo-brief-template",
    x: -0.57,
    y: -0.08,
    cluster: 0,
  },
  {
    id: "demo-3",
    title: "Topic cluster planning workflow",
    url: "https://demo.topicmap.ai/topic-clusters",
    x: -0.18,
    y: 0.36,
    cluster: 1,
  },
  {
    id: "demo-4",
    title: "Programmatic landing page outline",
    url: "https://demo.topicmap.ai/programmatic-pages",
    x: 0.12,
    y: -0.12,
    cluster: 1,
  },
  {
    id: "demo-5",
    title: "Gap analysis ops checklist",
    url: "https://demo.topicmap.ai/gap-checklist",
    x: 0.38,
    y: 0.54,
    cluster: 2,
  },
  {
    id: "demo-6",
    title: "Internal linking playbook",
    url: "https://demo.topicmap.ai/internal-linking",
    x: 0.62,
    y: 0.1,
    cluster: 2,
  },
  {
    id: "demo-7",
    title: "Content refresh prioritization",
    url: "https://demo.topicmap.ai/content-refresh",
    x: 0.76,
    y: -0.29,
    cluster: 3,
  },
  {
    id: "demo-8",
    title: "Reporting dashboard for stakeholders",
    url: "https://demo.topicmap.ai/reporting-dashboard",
    x: 0.94,
    y: 0.18,
    cluster: 3,
  },
];

export function getDemoPoints(seed: string) {
  const shift = getShift(seed);
  return basePoints.map((point, index) => ({
    ...point,
    id: `${point.id}-${index}`,
    x: point.x + shift.x,
    y: point.y + shift.y,
  }));
}

export function getDemoBrief(payload: GapBriefRequest): GapBriefResponse {
  const points = payload.nearby_points.slice(0, 5);
  const primary = points[0]?.title ?? "content strategy";
  const secondary = points[1]?.title ?? "SEO workflow";
  const keywords = Array.from(
    new Set([
      primary,
      secondary,
      "content gap analysis",
      "seo planning",
      "internal linking",
    ])
  )
    .map((value) => value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim())
    .filter(Boolean)
    .slice(0, 6);

  return {
    title: `Practical ${primary.split(" ").slice(0, 2).join(" ")} Brief`,
    angle: `Use the whitespace at (${payload.click_x.toFixed(2)}, ${payload.click_y.toFixed(2)}) to bridge ${primary} with ${secondary}.`,
    target_keywords: keywords.length > 0 ? keywords : ["content gap analysis", "seo workflow", "content planning"],
    outline: [
      "Problem and market framing",
      "Audience intent and use cases",
      "Recommended workflow and tooling",
      "Publishing checklist and measurement",
      "Internal link opportunities",
    ],
    rationale: "This is a demo brief generated locally so the prototype works without a backend.",
  };
}
