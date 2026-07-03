# TopicMap.ai

AI-first semantic content gap visualizer for SEO and content marketing agencies.

## Architecture

- Frontend: Next.js (App Router), TailwindCSS, shadcn/ui, Lucide React
- Visualization: Plotly.js scatter map
- Backend: FastAPI + Uvicorn
- ML Pipeline: Sentence-Transformers, UMAP, Scikit-learn
- Scraping: Firecrawl API and sitemap parsing
- Data: Supabase (PostgreSQL + pgvector)

## Build Phases

1. Backend Data Pipeline
2. Frontend Dashboard Shell
3. Interactive Visualization
4. Gap Engine

## GitHub Pages Prototype

The frontend is configured as a static prototype that can be published on GitHub Pages.

- Demo mode is the default, so the site works without the backend.
- If you want live analysis locally, set `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000` before running the frontend.
- For GitHub Pages project sites, the workflow auto-detects the repo name and sets the Next.js `basePath` at build time.

### Local frontend commands

```powershell
cd frontend
npm install
npm run typecheck
npm run build
```

### GitHub Pages deployment

The workflow lives in [/.github/workflows/deploy-pages.yml](.github/workflows/deploy-pages.yml) and publishes the exported frontend from `frontend/out`.

## Gap Engine (Phase 4)

The backend exposes `POST /gaps/brief` to generate content briefs for map whitespace clicks.

- If `OPENAI_API_KEY` is set, the API calls the Responses endpoint and validates JSON into the brief schema.
- If no key is set (or the LLM call fails), the API returns a deterministic fallback brief.

Backend environment variables for Phase 4:

- `OPENAI_API_KEY` (optional)
- `OPENAI_MODEL` (optional, default `gpt-4o-mini`)
- `OPENAI_BASE_URL` (optional, default `https://api.openai.com/v1`)
