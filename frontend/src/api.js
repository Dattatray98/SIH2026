import axios from "axios";


const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/ollama/ai";
const SESSIONS_KEY = "satquery.sessions";
const CHAT_KEY = (id) => `satquery.chat.${id}`;


export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
}

export async function analyze({ message, images }) {
  console.log(message)
  try {
    const { data } = await axios.post(API_URL, {
      prompt: message,
      images: images.map((img) => ({ name: img.name, media_type: img.mediaType, data: img.b64 })),
    });
    return data;
  } catch (err) {
    throw new Error(err.response?.data?.detail || err.message);
  }
}



export function newChatId() {
  return `s_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

export function loadSessions() {
  try {
    return JSON.parse(localStorage.getItem(SESSIONS_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveSessions(list) {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(list));
}

export function loadChat(id) {
  try {
    return JSON.parse(localStorage.getItem(CHAT_KEY(id)) || "[]");
  } catch {
    return [];
  }
}

function titleFor(messages) {
  const firstUser = messages.find((m) => m.role === "user");
  if (!firstUser) return "New chat";
  if (firstUser.text) return firstUser.text.slice(0, 42) + (firstUser.text.length > 42 ? "…" : "");
  if (firstUser.images?.length) return `Imagery analysis (${firstUser.images.length})`;
  return "New chat";
}

export function persistChat(id, messages) {
  localStorage.setItem(CHAT_KEY(id), JSON.stringify(messages));
  const without = loadSessions().filter((s) => s.id !== id);
  const updated = [{ id, title: titleFor(messages), updatedAt: Date.now() }, ...without];
  saveSessions(updated);
  return updated;
}

export function deleteChat(id) {
  localStorage.removeItem(CHAT_KEY(id));
  const updated = loadSessions().filter((s) => s.id !== id);
  saveSessions(updated);
  return updated;
}
