import { useEffect, useRef, useState } from "react";
import {
  analyze,
  deleteChat,
  fileToBase64,
  loadChat,
  loadSessions,
  newChatId,
  persistChat,
} from "../api";
import { ChatMessage, ImageData, Session } from "../types";

// Limits the number of images staged with a single user request.
const MAX_PENDING_IMAGES = 4;

// Owns all chat-domain state and side effects so UI components remain presentational.
export function useChat() {
  // Persisted conversation state and transient composer/request state.
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [pendingFiles, setPendingFiles] = useState<ImageData[]>([]);
  const [thinking, setThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestVersionRef = useRef(0);

  // Hydrate the sidebar history once when the application starts.
  useEffect(() => {
    setSessions(loadSessions());
  }, []);

  // Persist a conversation while converting storage failures into visible UI errors.
  const saveChat = (id: string, chatMessages: ChatMessage[]) => {
    try {
      setSessions(persistChat(id, chatMessages));
    } catch {
      setError("Could not save this chat in browser storage.");
    }
  };

  // Reset the active workspace and invalidate any response still in flight.
  const startNewChat = () => {
    requestVersionRef.current += 1;
    setActiveId(null);
    setMessages([]);
    setPendingFiles([]);
    setInput("");
    setError(null);
  };

  // Load a saved conversation and prevent a prior request from updating this view.
  const openChat = (id: string) => {
    if (id === activeId) return;

    requestVersionRef.current += 1;
    setActiveId(id);
    setMessages(loadChat(id));
    setPendingFiles([]);
    setError(null);
  };

  // Remove the selected conversation from browser storage and the sidebar.
  const removeChat = (id: string) => {
    try {
      setSessions(deleteChat(id));
    } catch {
      setError("Could not update browser storage.");
    }
    if (id === activeId) startNewChat();
  };

  // Filter browser-selected files and convert accepted images into API-ready Base64 data.
  const handleFilesSelected = async (fileList: FileList) => {
    const files = Array.from(fileList)
      .filter((file) => file.type.startsWith("image/"))
      .slice(0, MAX_PENDING_IMAGES - pendingFiles.length);

    try {
      const read = await Promise.all(
        files.map(async (file): Promise<ImageData> => ({
          name: file.name,
          mediaType: file.type || "image/png",
          b64: await fileToBase64(file),
        }))
      );
      setPendingFiles((previousFiles) => [...previousFiles, ...read]);
      setError(null);
    } catch {
      setError("Could not read one of the selected images.");
    }
  };

  // Clear the visible conversation, including protection against stale responses.
  const clearCurrentChat = () => {
    requestVersionRef.current += 1;
    setThinking(false);
    setError(null);
    if (!activeId) {
      setMessages([]);
      return;
    }

    setMessages([]);
    saveChat(activeId, []);
  };

  // Remove one staged attachment without changing the rest of the composer state.
  const removeFile = (index: number) => {
    setPendingFiles((files) => files.filter((_, fileIndex) => fileIndex !== index));
  };

  // Append the user message, call the backend, and then append the assistant response.
  const send = async () => {
    if (thinking || (!input.trim() && pendingFiles.length === 0)) return;

    setError(null);
    const id = activeId || newChatId();
    const requestVersion = requestVersionRef.current + 1;
    requestVersionRef.current = requestVersion;
    if (!activeId) setActiveId(id);

    const userMessage: ChatMessage = {
      role: "user",
      text: input.trim(),
      images: pendingFiles,
    };
    let chatMessages = [...messages, userMessage];

    setMessages(chatMessages);
    setInput("");
    setPendingFiles([]);
    setThinking(true);
    saveChat(id, chatMessages);

    try {
      // Send only the data shape required by the backend API.
      const data = await analyze({
        message: userMessage.text || "",
        images: userMessage.images || [],
      });
      if (requestVersion !== requestVersionRef.current) return;

      // Ignore results from a request that was invalidated by navigation or clearing.
      chatMessages = [
        ...chatMessages,
        {
          role: "assistant",
          text: data.answer,
          images: [],
          sourceImages: userMessage.images,
          meta: {
            analysis_type: data.analysis_type,
            confidence: data.confidence,
            limitations: data.limitations || [],
            trace: data.trace || [],
          },
          evidence: data.evidence || data.images || [],
        },
      ];
      setMessages(chatMessages);
    } catch (caughtError: unknown) {
      if (requestVersion !== requestVersionRef.current) return;

      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not reach the SatQuery backend. Make sure FastAPI is running on port 8000."
      );
    } finally {
      if (requestVersion !== requestVersionRef.current) return;

      setThinking(false);
      saveChat(id, chatMessages);
    }
  };

  // Derive the header title from the active session rather than storing duplicate state.
  const activeTitle = activeId
    ? sessions.find((session) => session.id === activeId)?.title || "Chat"
    : "New chat";

  // Expose state and actions required by the presentation layer.
  return {
    activeId,
    activeTitle,
    clearCurrentChat,
    error,
    handleFilesSelected,
    input,
    messages,
    openChat,
    pendingFiles,
    removeChat,
    removeFile,
    send,
    sessions,
    setInput,
    startNewChat,
    thinking,
  };
}
