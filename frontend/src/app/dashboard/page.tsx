"use client";

import { useMemo, useState } from "react";
import { LoaderCircle, Search } from "lucide-react";

import ContentBrief from "@/components/ContentBrief";
import InteractiveMap from "@/components/InteractiveMap";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getDemoBrief, getDemoPoints } from "@/lib/demo-data";
import { analyzeSite, generateGapBrief, type ArticlePoint, type GapBriefResponse } from "@/lib/api";

export default function DashboardPage() {
  const [url, setUrl] = useState("https://fastapi.tiangolo.com");
  const [points, setPoints] = useState<ArticlePoint[]>(() => getDemoPoints("https://fastapi.tiangolo.com"));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gapCoords, setGapCoords] = useState<{ x: number; y: number } | null>({ x: 0.18, y: -0.22 });
  const [selectedPoint, setSelectedPoint] = useState<ArticlePoint | null>(() => getDemoPoints("https://fastapi.tiangolo.com")[0] ?? null);
  const [gapBrief, setGapBrief] = useState<GapBriefResponse | null>(() =>
    getDemoBrief({
      url: "https://fastapi.tiangolo.com",
      click_x: 0.18,
      click_y: -0.22,
      nearby_points: getDemoPoints("https://fastapi.tiangolo.com").slice(0, 5),
    })
  );
  const [gapBriefLoading, setGapBriefLoading] = useState(false);
  const [gapBriefError, setGapBriefError] = useState<string | null>(null);

  function getNearestPoints(coords: { x: number; y: number }, limit = 5): ArticlePoint[] {
    return [...points]
      .sort((a, b) => {
        const da = (a.x - coords.x) ** 2 + (a.y - coords.y) ** 2;
        const db = (b.x - coords.x) ** 2 + (b.y - coords.y) ** 2;
        return da - db;
      })
      .slice(0, limit);
  }

  async function handleGapClick(coords: { x: number; y: number }) {
    setSelectedPoint(null);
    setGapCoords(coords);
    setGapBriefError(null);

    if (points.length === 0) {
      setGapBrief(null);
      return;
    }

    setGapBriefLoading(true);
    try {
      const brief = await generateGapBrief({
        url,
        click_x: coords.x,
        click_y: coords.y,
        nearby_points: getNearestPoints(coords, 5),
      });
      setGapBrief(brief);
    } catch (err) {
      setGapBrief(null);
      const message = err instanceof Error ? err.message : "Unable to generate gap brief";
      setGapBriefError(message);
    } finally {
      setGapBriefLoading(false);
    }
  }

  async function handleAnalyze(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const nextPoints = await analyzeSite({
        url,
        max_pages: 20,
        min_text_chars: 150,
        with_clusters: true,
      });
      setPoints(nextPoints);
      setSelectedPoint(nextPoints[0] ?? null);
      setGapCoords({ x: nextPoints[0]?.x ?? 0, y: nextPoints[0]?.y ?? 0 });
      setGapBrief(
        nextPoints.length > 0
          ? getDemoBrief({
              url,
              click_x: nextPoints[0]?.x ?? 0,
              click_y: nextPoints[0]?.y ?? 0,
              nearby_points: nextPoints.slice(0, 5),
            })
          : null
      );
      setGapBriefError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#f8fafc,_#e2e8f0)] p-4 md:p-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>TopicMap Dashboard</CardTitle>
            <CardDescription>
              Enter a competitor root URL to map semantic coverage and reveal market whitespace.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAnalyze} className="flex flex-col gap-3 md:flex-row">
              <Input
                type="url"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="https://example.com"
                required
              />
              <Button type="submit" className="min-w-40" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Run Analysis
                  </>
                )}
              </Button>
            </form>
            <p className="mt-3 text-xs text-slate-500">
              Prototype mode is live by default. Connect a backend with `NEXT_PUBLIC_API_BASE_URL` if you want to swap from demo data to real site analysis.
            </p>
            {error ? <p className="mt-3 text-sm text-rose-700">{error}</p> : null}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <section className="xl:col-span-2">
            <InteractiveMap
              points={points}
              selectedId={selectedPoint?.id ?? null}
              onPointClick={(p) => {
                setGapCoords(null);
                setGapBrief(null);
                setGapBriefError(null);
                setSelectedPoint(p);
              }}
              onBackgroundClick={handleGapClick}
            />
          </section>
          <aside>
            <ContentBrief
              selected={selectedPoint}
              totalPoints={points.length}
              gapCoords={gapCoords}
              gapBrief={gapBrief}
              gapBriefLoading={gapBriefLoading}
              gapBriefError={gapBriefError}
            />
          </aside>
        </div>
      </div>
    </main>
  );
}
