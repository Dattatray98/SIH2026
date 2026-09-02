import React, { useEffect, useRef } from "react";
import { Paperclip, ArrowUp, X } from "lucide-react";

export default function Composer({
  input,
  setInput,
  pendingFiles,
  onFilesSelected,
  onRemoveFile,
  onSend,
  thinking,
}) {
  const ref = useRef(null);

  // Auto-resize textarea based on text content
  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = `${Math.min(ref.current.scrollHeight, 180)}px`;
    }
  }, [input]);

  // Handle message submission on Enter key press
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  // State calculations
  const isAtLimit = pendingFiles.length >= 4;
  const isSendDisabled = thinking || (!input.trim() && pendingFiles.length === 0);

  return (
    <div className="composer-area">
      <div className="composer-container">
        {/* Pending Files Preview Section */}
        {pendingFiles.length > 0 && (
          <div className="pending-files">
            {pendingFiles.map((file, index) => (
              <div className="file-chip" key={`${file.name}-${index}`}>
                <img
                  src={`data:${file.mediaType};base64,${file.b64}`}
                  alt={file.name}
                  className="chip-preview"
                />
                <span>{file.name}</span>
                <button
                  onClick={() => onRemoveFile(index)}
                  title="Remove image"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input Control Box */}
        <div className="composer">
          <label
            htmlFor="sq-file-input"
            className={`attach-button ${isAtLimit ? "disabled" : ""}`}
            title={isAtLimit ? "Maximum 4 images" : "Attach imagery"}
          >
            <Paperclip size={16} />
          </label>
          <input
            id="sq-file-input"
            type="file"
            accept="image/*"
            multiple
            disabled={isAtLimit}
            className="sr-only"
            onChange={(e) => {
              if (e.target.files?.length) onFilesSelected(e.target.files);
              e.target.value = "";
            }}
          />

          <textarea
            ref={ref}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about a satellite scene, land cover, flooding, or change…"
            rows={1}
          />

          <button
            className="send-button"
            onClick={onSend}
            disabled={isSendDisabled}
            title="Send"
          >
            <ArrowUp size={16} />
          </button>
        </div>

        {/* Informational Footer */}
        <div className="footer-note">
          <span>Up to 4 images</span>
          <span>Enter to send · Shift + Enter for new line</span>
        </div>
      </div>
    </div>
  );
}
