import { useEffect, useRef, useState } from "react";
import { PanelLeft, Plus, RotateCcw, Satellite, Sparkles } from "lucide-react";
import Composer from "./components/Composer";
import Message from "./components/Message";
import Sidebar from "./components/Sidebar";
import ThinkingRow from "./components/ThinkingRow";
import { useChat } from "./hooks/useChat";

// Pre-filled prompts shown before a conversation contains messages.
const suggestedQuestions = [
  "Analyze this satellite scene.",
  "Identify the major land-cover types.",
  "Is there visible flooding?",
  "Compare these images for change.",
];

export default function App() {
  // UI-only state remains here; chat-domain state lives in useChat.
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showTools, setShowTools] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const chat = useChat();

  // Keep the latest message or loading indicator in view as the conversation changes.
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chat.messages, chat.thinking]);

  // Compose the application shell from focused presentational components.
  return (
    <div className="w-full h-screen flex overflow-hidden bg-sat-bg text-sat-text font-mono">
      <Sidebar open={sidebarOpen} sessions={chat.sessions} activeId={chat.activeId} onSelect={chat.openChat} onDelete={chat.removeChat} />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header controls for navigation, capabilities, clearing, and new chats. */}
        <header className="shrink-0 h-[56px] flex items-center justify-between px-4 bg-sat-panel-alt border-b border-sat-border-soft">
          <div className="flex items-center gap-3 min-w-0">
            <button type="button" className="w-[28px] h-[28px] flex items-center justify-center bg-sat-panel text-sat-muted shrink-0 hover:text-sat-text transition-colors" onClick={() => setSidebarOpen((isOpen) => !isOpen)} title="Toggle sidebar">
              <PanelLeft size={14} />
            </button>
            <div className="min-w-0">
              <div className="text-[13.5px] font-semibold truncate text-sat-text">{chat.activeTitle}</div>
              <div className="text-[10.5px] text-sat-faint">agentic remote-sensing assistant</div>
            </div>
          </div>
          <div className="flex items-center gap-[7px]">
            <button type="button" className="h-[30px] px-[9px] flex items-center gap-[6px] border border-sat-border bg-sat-panel text-sat-muted text-[10px] hover:text-sat-text hover:border-sat-border-strong transition-colors" onClick={() => setShowTools((visible) => !visible)}>
              <Sparkles size={13} /> Capabilities
            </button>
            <button type="button" className="h-[30px] px-[9px] flex items-center gap-[6px] border border-sat-border bg-sat-panel text-sat-muted text-[10px] hover:text-sat-text hover:border-sat-border-strong disabled:opacity-35 disabled:cursor-not-allowed transition-colors" onClick={chat.clearCurrentChat} disabled={!chat.messages.length}>
              <RotateCcw size={13} /> Clear
            </button>
            <button type="button" className="flex items-center gap-[6px] shrink-0 p-[6px_12px] bg-sat-panel border border-sat-border text-[12.5px] text-sat-text hover:border-sat-border-strong transition-colors" onClick={chat.startNewChat} title="Start a new chat">
              <Plus size={13} className="text-sat-signal" /> New chat
            </button>
          </div>
        </header>

        {/* Scrollable area for onboarding, messages, loading state, and recoverable errors. */}
        <main ref={scrollRef} className="flex-1 overflow-y-auto p-[24px_20px]">
          <div className="w-[min(1100px,100%)] mx-auto flex flex-col gap-[20px]">
            {showTools && <Capabilities />}
            {chat.messages.length === 0 && <Welcome onSelectQuestion={chat.setInput} />}
            {chat.messages.map((message, index) => <Message key={index} message={message} />)}
            {chat.thinking && <ThinkingRow />}
            {chat.error && <div className="text-sat-danger text-[13px] px-3 py-2 bg-sat-panel border border-sat-danger/30">{chat.error}</div>}
          </div>
        </main>

        {/* Composer receives state and callbacks from the chat business-logic hook. */}
        <Composer input={chat.input} setInput={chat.setInput} pendingFiles={chat.pendingFiles} onFilesSelected={chat.handleFilesSelected} onRemoveFile={chat.removeFile} onSend={chat.send} thinking={chat.thinking} />
      </div>
    </div>
  );
}

// Renders the static capability summary revealed by the header button.
function Capabilities() {
  const capabilities = [
    ["#7c9b72", "Vision analysis", "Connected through backend"],
    ["#b29a5e", "Request routing", "Prototype workflow"],
    ["#666d67", "NDVI / GeoTIFF", "Not enabled in frontend"],
  ];

  return (
    <div className="max-w-[780px] mx-auto my-[14px] p-[10px] grid grid-cols-1 sm:grid-cols-3 gap-[1px] bg-sat-border border border-sat-border">
      {capabilities.map(([color, title, detail]) => (
        <div key={title} className="bg-sat-panel p-[11px] grid grid-cols-[8px_1fr] col-gap-2 items-center">
          <span className="w-[6px] h-[6px] rounded-full row-span-2" style={{ backgroundColor: color }} />
          <b className="text-[10px] text-sat-text">{title}</b>
          <small className="col-start-2 text-sat-faint text-[9px] mt-[3px]">{detail}</small>
        </div>
      ))}
    </div>
  );
}

// Renders the empty-state introduction and quick-start prompt buttons.
function Welcome({ onSelectQuestion }: { onSelectQuestion: (question: string) => void }) {
  return (
    <div className="block max-w-[780px] mx-auto mt-[12vh] sm:mt-[14vh] p-[34px] border border-sat-border bg-gradient-to-br from-white/[0.018] to-transparent rounded-[10px]">
      <div className="w-[44px] h-[44px] grid place-items-center border border-sat-border-strong bg-sat-panel-alt text-sat-signal mb-[22px]"><Satellite size={22} /></div>
      <div>
        <span className="text-[9px] tracking-[0.16em] text-sat-faint font-mono">SATQUERY AI</span>
        <h1 className="text-[clamp(30px,4vw,46px)] font-medium tracking-[-0.04em] my-[9px] text-sat-text">Ask your imagery what it knows.</h1>
        <p className="max-w-[650px] text-sat-muted text-xs leading-[1.75]">Send a question, attach satellite imagery, and the backend will return the analysis. The frontend formats the response into readable sections, lists, tables and evidence.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-[7px] mt-[24px]">
        {suggestedQuestions.map((question) => (
          <button key={question} type="button" onClick={() => onSelectQuestion(question)} className="min-h-[48px] p-[10px_12px] text-left flex justify-between items-center bg-sat-panel border border-sat-border text-sat-muted text-[10px] hover:border-sat-border-strong hover:text-sat-text hover:bg-sat-panel-alt transition-colors">
            <span>{question}</span><Plus size={14} />
          </button>
        ))}
      </div>
    </div>
  );
}
