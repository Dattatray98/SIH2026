# SatQuery AI Frontend

React + Vite frontend for the SatQuery AI remote-sensing assistant.

## Setup

```bash
cd frontend
npm install
npm run dev
```

The app expects FastAPI at `http://localhost:8000`. If needed, create `.env`:

```env
VITE_API_URL=http://localhost:8000
```

## Structure

```
src/
  ErrorBoundary.jsx     catches render errors, shows a visible panel instead of a blank page
  main.jsx              entry point, wraps App in ErrorBoundary
  api.js                fetch wrapper + localStorage chat history
  styles.css             Industrial visual system (flat, mono, one signal color)
  App.jsx                top-level state, layout
  components/
    Markdown.jsx          hand-rolled headers/bold/bullets renderer, no external dep
    Sidebar.jsx            past-chats list
    Message.jsx            one chat bubble + images + confidence/analysis_type meta
    ThinkingRow.jsx         radar-sweep indicator with live elapsed timer
    Composer.jsx            input box, file upload, send
```

## Known limitation

File upload only accepts standard browser image types. GeoTIFF/TIFF needs a
real backend path (GDAL/rasterio) — not implemented here.

## Frontend responsibility
The frontend collects the user's text and imagery, sends them to `POST /api/analyze`, and renders the returned result. Knowledge retrieval, RAG, model calls, remote-sensing algorithms, and routing remain backend responsibilities.

The result renderer supports GitHub-Flavored Markdown, including headings, emphasis, lists, tables, code, blockquotes, links and images.
