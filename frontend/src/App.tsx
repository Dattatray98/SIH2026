import React, { useEffect, useRef, useState } from "react";
import { Satellite, PanelLeft, Plus, RotateCcw, Sparkles } from "lucide-react";
import {
  analyze,
  fileToBase64,
  newChatId,
  loadSessions,
  loadChat,
  persistChat,
  deleteChat,
} from "./api";
import { Session, ChatMessage, ImageData } from "./types";
import Sidebar from "./components/Sidebar";
import Message from "./components/Message";
import ThinkingRow from "./components/ThinkingRow";
import Composer from "./components/Composer";

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState<string>("");
  const [pendingFiles, setPendingFiles] = useState<ImageData[]>([]);
  const [thinking, setThinking] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showTools, setShowTools] = useState<boolean>(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Load chat sessions on component mount
  useEffect(() => {
    setSessions(loadSessions());
  }, []);

  // Auto-scroll to the bottom of the conversation window
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, thinking]);

  // Handle initialization of clean workspace environment
  const startNewChat = () => {
    setActiveId(null);
    setMessages([]);
    setPendingFiles([]);
    setInput("");
    setError(null);
  };

  // Open existing historical session logs
  const openChat = (id: string) => {
    if (id === activeId) return;
    setActiveId(id);
    setMessages(loadChat(id));
    setPendingFiles([]);
    setError(null);
  };

  // Delete chat session completely from persistence
  const removeChat = (id: string) => {
    setSessions(deleteChat(id));
    if (id === activeId) startNewChat();
  };

  // Parse, validate, and convert staging input image files
  const handleFilesSelected = async (fileList: FileList) => {
    const files = Array.from(fileList)
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, 4 - pendingFiles.length);

    try {
      const read: ImageData[] = await Promise.all(
        files.map(async (f) => ({
          name: f.name,
          mediaType: f.type || "image/png",
          b64: await fileToBase64(f),
        }))
      );
      setPendingFiles((prev) => [...prev, ...read]);
      setError(null);
    } catch {
      setError("Could not read one of the selected images.");
    }
  };

  // Clear current active screen without removing the session trace
  const clearCurrentChat = () => {
    if (!activeId) {
      setMessages([]);
      return;
    }
    setMessages([]);
    setSessions(persistChat(activeId, []));
  };

  // Pop a staged file off the temporary stack
  const removeFile = (index: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Dispatch payloads out to backend remote sensing orchestrator
  const send = async () => {
    if (thinking || (!input.trim() && pendingFiles.length === 0)) return;
    setError(null);

    const id = activeId || newChatId();
    if (!activeId) setActiveId(id);

    const userMsg: ChatMessage = {
      role: "user",
      text: input.trim(),
      images: pendingFiles,
    };
    let working: ChatMessage[] = [...messages, userMsg];

    setMessages(working);
    setInput("");
    setPendingFiles([]);
    setThinking(true);

    try {
      const data = await analyze({
        message: userMsg.text || "",
        images: userMsg.images || [],
      });

      working = [
        ...working,
        {
          role: "assistant",
          text: data.answer,
          images: [],
          sourceImages: userMsg.images,
          meta: {
            analysis_type: data.analysis_type,
            confidence: data.confidence,
            limitations: data.limitations || [],
            trace: data.trace || [],
          },
          evidence: data.evidence || data.images || [],
        },
      ];
      setMessages(working);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Could not reach the SatQuery backend. Make sure FastAPI is running on port 8000.";
      setError(msg);
    } finally {
      setThinking(false);
      setSessions(persistChat(id, working));
    }
  };

  const activeTitle = activeId
    ? sessions.find((s) => s.id === activeId)?.title || "Chat"
    : "New chat";

  return (
    <div className="w-full h-screen flex overflow-hidden bg-sat-bg text-sat-text font-mono">
      <Sidebar
        open={sidebarOpen}
        sessions={sessions}
        activeId={activeId}
        onSelect={openChat}
        onDelete={removeChat}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Navigation / Header controls */}
        <header className="shrink-0 h-[56px] flex items-center justify-between px-4 bg-sat-panel-alt border-b border-sat-border-soft">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              className="w-[28px] h-[28px] flex items-center justify-center bg-sat-panel text-sat-muted shrink-0 hover:text-sat-text transition-colors"
              onClick={() => setSidebarOpen((v) => !v)}
              title="Toggle sidebar"
            >
              <PanelLeft size={14} />
            </button>
            <div className="min-w-0">
              <div className="text-[13.5px] font-semibold truncate text-sat-text">
                {activeTitle}
              </div>
              <div className="text-[10.5px] text-sat-faint">
                agentic remote-sensing assistant
              </div>
            </div>
          </div>
          <div className="flex items-center gap-[7px]">
            <button
              type="button"
              className="h-[30px] px-[9px] flex items-center gap-[6px] border border-sat-border bg-sat-panel text-sat-muted text-[10px] hover:text-sat-text hover:border-sat-border-strong transition-colors"
              onClick={() => setShowTools((v) => !v)}
            >
              <Sparkles size={13} /> Capabilities
            </button>
            <button
              type="button"
              className="h-[30px] px-[9px] flex items-center gap-[6px] border border-sat-border bg-sat-panel text-sat-muted text-[10px] hover:text-sat-text hover:border-sat-border-strong disabled:opacity-35 disabled:cursor-not-allowed transition-colors"
              onClick={clearCurrentChat}
              disabled={!messages.length}
            >
              <RotateCcw size={13} /> Clear
            </button>
            <button
              type="button"
              className="flex items-center gap-[6px] shrink-0 p-[6px_12px] bg-sat-panel border border-sat-border text-[12.5px] text-sat-text hover:border-sat-border-strong transition-colors"
              onClick={startNewChat}
              title="Start a new chat"
            >
              <Plus size={13} className="text-sat-signal" /> New chat
            </button>
          </div>
        </header>

        {/* Message Streams / Scroll viewport */}
        <main ref={scrollRef} className="flex-1 overflow-y-auto p-[24px_20px]">
          <div className="w-[min(1100px,100%)] mx-auto flex flex-col gap-[20px]">
            {showTools && (
              <div className="max-w-[780px] mx-auto my-[14px] p-[10px] grid grid-cols-1 sm:grid-cols-3 gap-[1px] bg-sat-border border border-sat-border">
                <div className="bg-sat-panel p-[11px] grid grid-cols-[8px_1fr] col-gap-2 items-center">
                  <span className="w-[6px] h-[6px] rounded-full bg-[#7c9b72] row-span-2" />
                  <b className="text-[10px] text-sat-text">Vision analysis</b>
                  <small className="col-start-2 text-sat-faint text-[9px] mt-[3px]">
                    Connected through backend
                  </small>
                </div>
                <div className="bg-sat-panel p-[11px] grid grid-cols-[8px_1fr] col-gap-2 items-center">
                  <span className="w-[6px] h-[6px] rounded-full bg-[#b29a5e] row-span-2" />
                  <b className="text-[10px] text-sat-text">Request routing</b>
                  <small className="col-start-2 text-sat-faint text-[9px] mt-[3px]">
                    Prototype workflow
                  </small>
                </div>
                <div className="bg-sat-panel p-[11px] grid grid-cols-[8px_1fr] col-gap-2 items-center">
                  <span className="w-[6px] h-[6px] rounded-full bg-[#666d67] row-span-2" />
                  <b className="text-[10px] text-sat-text">NDVI / GeoTIFF</b>
                  <small className="col-start-2 text-sat-faint text-[9px] mt-[3px]">
                    Not enabled in frontend
                  </small>
                </div>
              </div>
            )}

            {messages.length === 0 && (
              <div className="block max-w-[780px] mx-auto mt-[12vh] sm:mt-[14vh] p-[34px] border border-sat-border bg-gradient-to-br from-white/[0.018] to-transparent rounded-[10px]">
                <div className="w-[44px] h-[44px] grid place-items-center border border-sat-border-strong bg-sat-panel-alt text-sat-signal mb-[22px]">
                  <Satellite size={22} />
                </div>
                <div>
                  <span className="text-[9px] tracking-[0.16em] text-sat-faint font-mono">
                    SATQUERY AI
                  </span>
                  <h1 className="text-[clamp(30px,4vw,46px)] font-medium tracking-[-0.04em] my-[9px] text-sat-text">
                    Ask your imagery what it knows.
                  </h1>
                  <p className="max-w-[650px] text-sat-muted text-xs leading-[1.75]">
                    Send a question, attach satellite imagery, and the backend
                    will return the analysis. The frontend formats the response
                    into readable sections, lists, tables and evidence.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-[7px] mt-[24px]">
                  {[
                    "Analyze this satellite scene.",
                    "Identify the major land-cover types.",
                    "Is there visible flooding?",
                    "Compare these images for change.",
                  ].map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setInput(q)}
                      className="min-h-[48px] p-[10px_12px] text-left flex justify-between items-center bg-sat-panel border border-sat-border text-sat-muted text-[10px] hover:border-sat-border-strong hover:text-sat-text hover:bg-sat-panel-alt transition-colors"
                    >
                      <span>{q}</span>
                      <Plus size={14} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message, index) => (
              <Message key={index} message={message} />
            ))}

            {thinking && <ThinkingRow />}
            {error && (
              <div className="text-sat-danger text-[13px] px-3 py-2 bg-sat-panel border border-sat-danger/30">
                {error}
              </div>
            )}
          </div>
        </main>

        {/* Text Area Inputs */}
        <Composer
          input={input}
          setInput={setInput}
          pendingFiles={pendingFiles}
          onFilesSelected={handleFilesSelected}
          onRemoveFile={removeFile}
          onSend={send}
          thinking={thinking}
        />
      </div>
    </div>
  );
}
