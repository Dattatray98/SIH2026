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
import Sidebar from "./components/Sidebar";
import Message from "./components/Message";
import ThinkingRow from "./components/ThinkingRow";
import Composer from "./components/Composer";

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [pendingFiles, setPendingFiles] = useState([]);
  const [thinking, setThinking] = useState(false);
  const [error, setError] = useState(null);
  const [showTools, setShowTools] = useState(false);

  const scrollRef = useRef(null);

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
  const openChat = (id) => {
    if (id === activeId) return;
    setActiveId(id);
    setMessages(loadChat(id));
    setPendingFiles([]);
    setError(null);
  };

  // Delete chat session completely from persistence
  const removeChat = (id) => {
    setSessions(deleteChat(id));
    if (id === activeId) startNewChat();
  };

  // Parse, validate, and convert staging input image files
  const handleFilesSelected = async (fileList) => {
    const files = Array.from(fileList)
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, 4 - pendingFiles.length);

    try {
      const read = await Promise.all(
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
  const removeFile = (index) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Dispatch payloads out to backend remote sensing orchestrator
  const send = async () => {
    if (thinking || (!input.trim() && pendingFiles.length === 0)) return;
    setError(null);

    const id = activeId || newChatId();
    if (!activeId) setActiveId(id);

    const userMsg = { role: "user", text: input.trim(), images: pendingFiles };
    let working = [...messages, userMsg];

    setMessages(working);
    setInput("");
    setPendingFiles([]);
    setThinking(true);

    try {
      const data = await analyze({
        message: userMsg.text,
        images: userMsg.images,
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
    } catch (err) {
      setError(
        err.message ||
          "Could not reach the SatQuery backend. Make sure FastAPI is running on port 8000."
      );
    } finally {
      setThinking(false);
      setSessions(persistChat(id, working));
    }
  };

  const activeTitle = activeId
    ? sessions.find((s) => s.id === activeId)?.title || "Chat"
    : "New chat";

  return (
    <div className="app">
      <Sidebar
        open={sidebarOpen}
        sessions={sessions}
        activeId={activeId}
        onSelect={openChat}
        onDelete={removeChat}
      />

      <div className="main-column">
        {/* Navigation / Header controls */}
        <header className="header">
          <div className="header-left">
            <button
              className="icon-button"
              onClick={() => setSidebarOpen((v) => !v)}
              title="Toggle sidebar"
            >
              <PanelLeft size={14} />
            </button>
            <div className="header-title">
              <div className="header-title-text">{activeTitle}</div>
              <div className="header-subtitle">
                agentic remote-sensing assistant
              </div>
            </div>
          </div>
          <div className="header-actions">
            <button
              className="tool-button"
              onClick={() => setShowTools((v) => !v)}
            >
              <Sparkles size={13} /> Capabilities
            </button>
            <button
              className="tool-button"
              onClick={clearCurrentChat}
              disabled={!messages.length}
            >
              <RotateCcw size={13} /> Clear
            </button>
            <button
              className="new-chat-button"
              onClick={startNewChat}
              title="Start a new chat"
            >
              <Plus size={13} /> New chat
            </button>
          </div>
        </header>

        {/* Message Streams / Scroll viewport */}
        <main ref={scrollRef} className="messages">
          <div className="conversation">
            {showTools && (
              <div className="capabilities">
                <div>
                  <span className="status-dot ready" />
                  <b>Vision analysis</b>
                  <small>Connected through backend</small>
                </div>
                <div>
                  <span className="status-dot prototype" />
                  <b>Request routing</b>
                  <small>Prototype workflow</small>
                </div>
                <div>
                  <span className="status-dot future" />
                  <b>NDVI / GeoTIFF</b>
                  <small>Not enabled in frontend</small>
                </div>
              </div>
            )}

            {messages.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">
                  <Satellite size={22} />
                </div>
                <div className="empty-copy">
                  <span className="eyebrow">SATQUERY AI</span>
                  <h1>Ask your imagery what it knows.</h1>
                  <p>
                    Send a question, attach satellite imagery, and the backend
                    will return the analysis. The frontend formats the response
                    into readable sections, lists, tables and evidence.
                  </p>
                </div>
                <div className="quick-prompts">
                  {[
                    "Analyze this satellite scene.",
                    "Identify the major land-cover types.",
                    "Is there visible flooding?",
                    "Compare these images for change.",
                  ].map((q) => (
                    <button key={q} onClick={() => setInput(q)}>
                      {q}
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
            {error && <div className="error">{error}</div>}
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
