import React from "react";
import { Trash2, Satellite } from "lucide-react";

function formatWhen(ts) {
  const d = new Date(ts);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  return sameDay
    ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function Sidebar({ open, sessions, activeId, onSelect, onDelete }) {
  return (
    <div className={`sidebar ${open ? "open" : "closed"}`}>
      <div className="sidebar-brand">
        <div className="brand-icon">
          <Satellite size={14} />
        </div>
        <div className="brand-name">SatQuery AI</div>
      </div>

      <div className="sidebar-heading">Past chats</div>

      <div className="sidebar-list">
        {sessions.length === 0 && <div className="sidebar-empty">No chats yet. Start one above.</div>}
        {sessions.map((s) => (
          <div
            key={s.id}
            className={`sidebar-row ${s.id === activeId ? "active" : ""}`}
            onClick={() => onSelect(s.id)}
          >
            <div className="sidebar-row-text">
              <div className="sidebar-row-title">{s.title || "New chat"}</div>
              <div className="sidebar-row-time tabular">{formatWhen(s.updatedAt)}</div>
            </div>
            <button
              className="sidebar-row-delete"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(s.id);
              }}
              title="Delete chat"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
