"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Layout } from "plotly.js";

import type { ArticlePoint } from "@/lib/api";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

type Props = {
  points?: ArticlePoint[];
  selectedId?: string | null;
  onPointClick?: (point: ArticlePoint) => void;
  onBackgroundClick?: (coords: { x: number; y: number }) => void;
};

function computeBounds(points: ArticlePoint[]) {
  if (points.length === 0) {
    return { x: [-1, 1] as [number, number], y: [-1, 1] as [number, number] };
  }

  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const yMin = Math.min(...ys);
  const yMax = Math.max(...ys);

  const xPad = Math.max((xMax - xMin) * 0.1, 0.2);
  const yPad = Math.max((yMax - yMin) * 0.1, 0.2);

  return {
    x: [xMin - xPad, xMax + xPad] as [number, number],
    y: [yMin - yPad, yMax + yPad] as [number, number],
  };
}

export default function InteractiveMap({
  points = [],
  selectedId = null,
  onPointClick,
  onBackgroundClick,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [ranges, setRanges] = useState<{ x: [number, number]; y: [number, number] }>(() => computeBounds(points));

  useEffect(() => {
    setRanges(computeBounds(points));
  }, [points]);

  const data = useMemo(() => {
    const traces: any[] = [
      {
        x: points.map((p) => p.x),
        y: points.map((p) => p.y),
        text: points.map((p) => `${p.title}<br>${p.url}<br>Cluster: ${p.cluster ?? "n/a"}`),
        customdata: points.map((p) => p.id),
        mode: "markers",
        type: "scattergl",
        marker: {
          size: 9,
          color: points.map((p) => p.cluster ?? -1),
          colorscale: "Viridis",
          showscale: points.length > 0,
          colorbar: { title: "Cluster", thickness: 12 },
          line: { color: "rgba(15,23,42,0.2)", width: 1 },
        },
        hovertemplate: "%{text}<extra></extra>",
        showlegend: false,
      },
    ];

    if (selectedId) {
      const selected = points.find((p) => p.id === selectedId);
      if (selected) {
        traces.push({
          x: [selected.x],
          y: [selected.y],
          text: [`Selected: ${selected.title}<br>${selected.url}`],
          mode: "markers",
          type: "scatter",
          marker: {
            size: 16,
            symbol: "diamond",
            color: "rgba(239,68,68,0.95)",
            line: { color: "#0f172a", width: 2 },
          },
          hovertemplate: "%{text}<extra></extra>",
          showlegend: false,
        });
      }
    }

    return traces;
  }, [points, selectedId]);

  const layout = useMemo<Partial<Layout>>(
    () => ({
      autosize: true,
      margin: { l: 40, r: 20, t: 16, b: 40 },
      paper_bgcolor: "#ffffff",
      plot_bgcolor: "#f8fafc",
      xaxis: { title: { text: "UMAP 1" }, zeroline: false },
      yaxis: { title: { text: "UMAP 2" }, zeroline: false },
      hovermode: "closest" as const,
      dragmode: "pan" as const,
    }),
    []
  );

  const handleRelayout = useCallback((relayoutData: Record<string, unknown>) => {
    const x0 = relayoutData["xaxis.range[0]"] ?? (relayoutData["xaxis.range"] as number[] | undefined)?.[0];
    const x1 = relayoutData["xaxis.range[1]"] ?? (relayoutData["xaxis.range"] as number[] | undefined)?.[1];
    const y0 = relayoutData["yaxis.range[0]"] ?? (relayoutData["yaxis.range"] as number[] | undefined)?.[0];
    const y1 = relayoutData["yaxis.range[1]"] ?? (relayoutData["yaxis.range"] as number[] | undefined)?.[1];

    if (typeof x0 === "number" && typeof x1 === "number" && typeof y0 === "number" && typeof y1 === "number") {
      setRanges({ x: [x0, x1], y: [y0, y1] });
    }
  }, []);

  const handleClick = useCallback(
    (eventData: any) => {
      if (eventData?.points?.length > 0) {
        const id = eventData.points[0].customdata as string;
        const found = points.find((p) => p.id === id);
        if (found) {
          onPointClick?.(found);
          return;
        }
      }

      if (!onBackgroundClick || !containerRef.current || !eventData?.event) {
        return;
      }

      const rect = containerRef.current.getBoundingClientRect();
      const px = eventData.event.clientX - rect.left;
      const py = eventData.event.clientY - rect.top;

      if (rect.width <= 0 || rect.height <= 0) {
        return;
      }

      const x = ranges.x[0] + (px / rect.width) * (ranges.x[1] - ranges.x[0]);
      const y = ranges.y[1] - (py / rect.height) * (ranges.y[1] - ranges.y[0]);
      onBackgroundClick({ x, y });
    },
    [onBackgroundClick, onPointClick, points, ranges]
  );

  return (
    <div ref={containerRef} className="h-[520px] w-full rounded-xl border border-slate-200 bg-white p-2">
      <div className="flex items-center justify-between px-3 pb-1">
        <p className="text-sm font-medium text-slate-800">Semantic Map Canvas</p>
        <p className="text-xs text-slate-500">{points.length} points</p>
      </div>
      <div className="h-[470px] w-full">
        <Plot
          data={data}
          layout={{ ...layout, height: 470 }}
          useResizeHandler
          style={{ width: "100%", height: "100%" }}
          onRelayout={handleRelayout}
          onClick={handleClick}
          config={{ responsive: true, displaylogo: false }}
        />
      </div>
    </div>
  );
}
