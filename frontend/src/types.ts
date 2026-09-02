// Represents an image in browser-friendly form for previews, storage, and API requests.
export interface ImageData {
  name?: string;
  mediaType: string;
  b64: string;
  caption?: string;
}

// Describes optional metadata attached to an assistant analysis result.
export interface AnalysisMeta {
  analysis_type?: string;
  confidence?: string;
  limitations?: string[];
  trace?: string[];
}

// Defines the persisted shape of a user or assistant message.
export interface ChatMessage {
  role: "user" | "assistant";
  text?: string;
  images?: ImageData[];
  sourceImages?: ImageData[];
  evidence?: ImageData[];
  meta?: AnalysisMeta;
}

// Summarises a saved conversation for the sidebar.
export interface Session {
  id: string;
  title: string;
  updatedAt: number;
}

// Defines the data supplied to the analysis API request.
export interface AnalyzeParams {
  message: string;
  images: ImageData[];
}

// Documents the image format expected by the backend transport contract.
export interface BackendImagePayload {
  name?: string;
  media_type: string;
  data: string;
}

// Defines the response fields the frontend can render from the analysis backend.
export interface BackendAnalyzeResponse {
  answer: string;
  analysis_type?: string;
  confidence?: string;
  limitations?: string[];
  trace?: string[];
  evidence?: ImageData[];
  images?: ImageData[];
}
