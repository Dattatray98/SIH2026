export interface ImageData {
  name?: string;
  mediaType: string;
  b64: string;
  caption?: string;
}

export interface AnalysisMeta {
  analysis_type?: string;
  confidence?: string;
  limitations?: string[];
  trace?: string[];
}

export interface ChatMessage {
  role: "user" | "assistant";
  text?: string;
  images?: ImageData[];
  sourceImages?: ImageData[];
  evidence?: ImageData[];
  meta?: AnalysisMeta;
}

export interface Session {
  id: string;
  title: string;
  updatedAt: number;
}

export interface AnalyzeParams {
  message: string;
  images: ImageData[];
}

export interface BackendImagePayload {
  name?: string;
  media_type: string;
  data: string;
}

export interface BackendAnalyzeResponse {
  answer: string;
  analysis_type?: string;
  confidence?: string;
  limitations?: string[];
  trace?: string[];
  evidence?: ImageData[];
  images?: ImageData[];
}
