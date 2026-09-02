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
  ErrorBoundary.tsx      catches render errors, shows a visible panel instead of a blank page
  main.tsx               entry point, wraps App in ErrorBoundary
  api.ts                 HTTP wrapper + localStorage chat history
  types.ts               shared TypeScript data models
  styles.css             Industrial visual system (flat, mono, one signal color)
  App.tsx                top-level state and layout
  components/
    Markdown.tsx         GitHub-Flavored Markdown renderer
    Sidebar.tsx          past-chats list
    Message.tsx          one chat bubble + images + response metadata
    ThinkingRow.tsx      radar-sweep loading indicator
    Composer.tsx         input box, file upload, send
```

## Known limitation

File upload only accepts standard browser image types. GeoTIFF/TIFF needs a
real backend path (GDAL/rasterio) — not implemented here.

## Frontend responsibility
The frontend collects the user's text and imagery, sends them to `POST /api/analyze`, and renders the returned result. Knowledge retrieval, RAG, model calls, remote-sensing algorithms, and routing remain backend responsibilities.

The result renderer supports GitHub-Flavored Markdown, including headings, emphasis, lists, tables, code, blockquotes, links and images.
