import type { ArticlePoint, GapBriefResponse } from "@/lib/api";

type ContentBriefProps = {
  selected?: ArticlePoint | null;
  totalPoints?: number;
  gapCoords?: { x: number; y: number } | null;
  gapBrief?: GapBriefResponse | null;
  gapBriefLoading?: boolean;
  gapBriefError?: string | null;
};

export default function ContentBrief({
  selected,
  totalPoints = 0,
  gapCoords = null,
  gapBrief = null,
  gapBriefLoading = false,
  gapBriefError = null,
}: ContentBriefProps) {
  return (
    <div className="h-full rounded-xl border border-slate-200 bg-white p-4">
      <h2 className="text-lg font-semibold text-slate-900">Insight Sidebar</h2>
      <p className="mt-1 text-sm text-slate-600">{totalPoints} analyzed pages in current map run.</p>

      <div className="mt-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3">
        <h3 className="text-sm font-medium text-slate-800">Selected Anchor Topic</h3>
        {selected ? (
          <>
            <p className="mt-2 text-sm text-slate-900">{selected.title}</p>
            <p className="mt-1 text-xs text-slate-600">Cluster: {selected.cluster ?? "n/a"}</p>
            <a
              className="mt-2 inline-block text-xs font-medium text-slate-700 underline"
              href={selected.url}
              target="_blank"
              rel="noreferrer"
            >
              Open source article
            </a>
          </>
        ) : (
          <>
            <p className="mt-2 text-sm text-slate-500">No article selected.</p>
            {gapCoords ? (
              <div className="mt-3 rounded-md bg-white p-2 text-sm">
                <p className="text-xs text-slate-600">Gap clicked at:</p>
                <p className="font-medium">x: {gapCoords.x.toFixed(3)}, y: {gapCoords.y.toFixed(3)}</p>

                {gapBriefLoading ? <p className="mt-2 text-xs text-slate-600">Generating brief...</p> : null}
                {gapBriefError ? <p className="mt-2 text-xs text-rose-700">{gapBriefError}</p> : null}
                {gapBrief ? (
                  <div className="mt-3 space-y-2 rounded-md border border-slate-200 bg-slate-50 p-2">
                    <p className="text-sm font-semibold text-slate-900">{gapBrief.title}</p>
                    <p className="text-xs text-slate-700">{gapBrief.angle}</p>
                    <p className="text-xs text-slate-700">Keywords: {gapBrief.target_keywords.join(", ")}</p>
                    <p className="text-xs font-medium text-slate-700">Outline:</p>
                    <ul className="list-disc space-y-1 pl-4 text-xs text-slate-700">
                      {gapBrief.outline.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                    <p className="text-xs text-slate-600">{gapBrief.rationale}</p>
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-500">Click an empty map area to generate a gap brief (Phase 4).</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
