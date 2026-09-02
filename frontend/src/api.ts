import axios from "axios";
import {
  AnalyzeParams,
  BackendAnalyzeResponse,
  ChatMessage,
  Session,
} from "./types";

// Prefer a deployment-specific endpoint while retaining the local development default.
const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();
const API_URL = configuredApiUrl || "http://localhost:8000/ollama/ai";

const SESSIONS_KEY = "satquery.sessions";
const CHAT_KEY = (id: string) => `satquery.chat.${id}`;

// Convert a browser File into the raw Base64 payload expected by the backend.
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        const separatorIndex = reader.result.indexOf(",");
        const base64 = reader.result.slice(separatorIndex + 1);
        if (separatorIndex >= 0 && base64) {
          resolve(base64);
        } else {
          reject(new Error("Could not parse file data"));
        }
      } else {
        reject(new Error("Could not parse file data"));
      }
    };
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
}

// Send a text-and-image analysis request and normalise transport failures for the UI.
export async function analyze({
  message,
  images,
}: AnalyzeParams): Promise<BackendAnalyzeResponse> {
  try {
    const { data } = await axios.post<BackendAnalyzeResponse>(API_URL, {
      prompt: message,
      images: images.map((img) => ({
        name: img.name,
        media_type: img.mediaType,
        data: img.b64,
      })),
    });
    if (!data || typeof data.answer !== "string") {
      throw new Error("The SatQuery backend returned an invalid response.");
    }
    return data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      throw new Error(err.response?.data?.detail || err.message);
    }
    if (err instanceof Error) {
      throw err;
    }
    throw new Error("An unexpected error occurred during analysis.");
  }
}

// Generate a lightweight, collision-resistant identifier for local-only chat storage.
export function newChatId(): string {
  return `s_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

// Read the session index defensively so invalid local storage never crashes the app.
export function loadSessions(): Session[] {
  try {
    return JSON.parse(localStorage.getItem(SESSIONS_KEY) || "[]");
  } catch {
    return [];
  }
}

// Store the compact session index separately from each conversation's messages.
function saveSessions(list: Session[]): void {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(list));
}

// Load a single conversation while handling missing or malformed saved data.
export function loadChat(id: string): ChatMessage[] {
  try {
    return JSON.parse(localStorage.getItem(CHAT_KEY(id)) || "[]");
  } catch {
    return [];
  }
}

// Derive a concise sidebar label from the first user interaction in a conversation.
function titleFor(messages: ChatMessage[]): string {
  const firstUser = messages.find((m) => m.role === "user");
  if (!firstUser) return "New chat";
  if (firstUser.text)
    return (
      firstUser.text.slice(0, 42) + (firstUser.text.length > 42 ? "…" : "")
    );
  if (firstUser.images?.length)
    return `Imagery analysis (${firstUser.images.length})`;
  return "New chat";
}

// Save a conversation and refresh its recency-sorted entry in the sidebar index.
export function persistChat(id: string, messages: ChatMessage[]): Session[] {
  localStorage.setItem(CHAT_KEY(id), JSON.stringify(messages));
  const without = loadSessions().filter((s) => s.id !== id);
  const updated: Session[] = [
    { id, title: titleFor(messages), updatedAt: Date.now() },
    ...without,
  ];
  saveSessions(updated);
  return updated;
}

// Delete both the message payload and its corresponding sidebar entry.
export function deleteChat(id: string): Session[] {
  localStorage.removeItem(CHAT_KEY(id));
  const updated = loadSessions().filter((s) => s.id !== id);
  saveSessions(updated);
  return updated;
}
