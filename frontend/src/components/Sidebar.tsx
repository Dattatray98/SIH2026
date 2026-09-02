import React from "react";
import { Trash2, Satellite } from "lucide-react";
import { Session } from "../types";

// Defines the saved-session data and callbacks supplied by the application shell.
interface SidebarProps {
  open: boolean;
  sessions: Session[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

// Format recent sessions as a time and older sessions as a compact date.
function formatWhen(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  return sameDay
    ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleDateString([], { month: "short", day: "numeric" });
}

// Render the collapsible saved-conversation navigation panel.
export default function Sidebar({
  open,
  sessions,
  activeId,
  onSelect,
  onDelete,
}: SidebarProps) {
  return (
    <aside
      className={`shrink-0 flex flex-col overflow-hidden bg-sat-sidebar transition-all duration-[180ms] ease-in-out ${
        open ? "w-[252px] border-r border-sat-border-soft" : "w-0"
      }`}
    >
      {/* Product identity shown at the top of the sidebar. */}
      <div className="flex items-center gap-2 px-3 pt-4 pb-3 min-w-[252px]">
        <div className="w-7 h-7 flex items-center justify-center bg-sat-signal-dim border border-sat-border text-sat-signal shrink-0">
          <Satellite size={14} />
        </div>
        <div className="text-[13.5px] font-semibold text-sat-text">
          SatQuery AI
        </div>
      </div>

      <div className="px-3 pt-2 pb-1 text-[10.5px] tracking-[0.3px] text-sat-faint min-w-[252px] font-mono">
        Past chats
      </div>

      {/* Scrollable session list, with selection and deletion actions. */}
      <div className="flex-1 overflow-y-auto px-2 min-w-[252px]">
        {sessions.length === 0 && (
          <div className="text-xs text-sat-faint px-[10px] py-2 leading-relaxed">
            No chats yet. Start one above.
          </div>
        )}
        {sessions.map((s) => {
          const isActive = s.id === activeId;
          return (
            <div
              key={s.id}
              onClick={() => onSelect(s.id)}
              className={`group flex items-center justify-between gap-1 px-[10px] py-2 cursor-pointer mb-[2px] transition-colors ${
                isActive ? "bg-sat-panel" : "hover:bg-sat-panel-alt"
              }`}
            >
              <div className="min-w-0 flex-1">
                <div
                  className={`text-[12.5px] truncate ${
                    isActive ? "text-sat-text font-medium" : "text-sat-muted"
                  }`}
                >
                  {s.title || "New chat"}
                </div>
                <div className="text-[10.5px] text-sat-faint tabular">
                  {formatWhen(s.updatedAt)}
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(s.id);
                }}
                title="Delete chat"
                className="shrink-0 w-[22px] h-[22px] flex items-center justify-center text-sat-faint opacity-0 group-hover:opacity-100 hover:text-sat-danger transition-opacity"
              >
                <Trash2 size={12} />
              </button>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
