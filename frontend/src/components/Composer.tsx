import React, { useEffect, useRef } from "react";
import { Paperclip, ArrowUp, X } from "lucide-react";
import { ImageData } from "../types";

// Defines the composer state and UI callbacks provided by the chat hook.
interface ComposerProps {
  input: string;
  setInput: (val: string) => void;
  pendingFiles: ImageData[];
  onFilesSelected: (files: FileList) => void;
  onRemoveFile: (index: number) => void;
  onSend: () => void;
  thinking: boolean;
}

// Render the text input, attachment preview, and submission controls.
export default function Composer({
  input,
  setInput,
  pendingFiles,
  onFilesSelected,
  onRemoveFile,
  onSend,
  thinking,
}: ComposerProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea based on text content
  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = `${Math.min(ref.current.scrollHeight, 180)}px`;
    }
  }, [input]);

  // Handle message submission on Enter key press
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  // Derive disabled states from the current attachment count and request status.
  const isAtLimit = pendingFiles.length >= 4;
  const isSendDisabled =
    thinking || (!input.trim() && pendingFiles.length === 0);

  return (
    <div className="shrink-0 px-5 pt-2 pb-5">
      <div className="w-[min(720px,100%)] mx-auto">
        {/* Pending Files Preview Section */}
        {pendingFiles.length > 0 && (
          <div className="flex flex-wrap gap-[7px] mb-2">
            {pendingFiles.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="h-[42px] flex items-center gap-[7px] p-[4px_6px] bg-sat-panel-alt border border-sat-border text-[9px] text-sat-muted max-w-[180px]"
              >
                <img
                  src={`data:${file.mediaType};base64,${file.b64}`}
                  alt={file.name || "Preview"}
                  className="w-8 h-8 object-cover border border-sat-border-soft"
                />
                <span className="truncate flex-1">{file.name || "Image"}</span>
                <button
                  type="button"
                  onClick={() => onRemoveFile(index)}
                  title="Remove image"
                  className="p-[3px] text-sat-faint hover:text-sat-text transition-colors"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input Control Box */}
        <div className="flex items-end gap-2 p-[10px_12px] bg-sat-panel border border-sat-border">
          <label
            htmlFor="sq-file-input"
            className={`w-[30px] h-[30px] shrink-0 flex items-center justify-center bg-sat-panel-alt text-sat-muted transition-opacity ${
              isAtLimit
                ? "opacity-35 cursor-not-allowed"
                : "cursor-pointer hover:text-sat-text"
            }`}
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
            className="flex-1 min-h-[30px] max-h-[120px] py-[5px] resize-none outline-none border-0 bg-transparent text-sat-text placeholder:text-sat-faint text-sm leading-[1.4] font-mono"
          />

          <button
            type="button"
            className={`w-[30px] h-[30px] shrink-0 flex items-center justify-center bg-sat-signal text-sat-bg transition-opacity ${
              isSendDisabled
                ? "opacity-35 cursor-not-allowed"
                : "cursor-pointer hover:brightness-110"
            }`}
            onClick={onSend}
            disabled={isSendDisabled}
            title="Send"
          >
            <ArrowUp size={16} />
          </button>
        </div>

        {/* Informational Footer */}
        <div className="flex justify-between text-left mt-[6px] text-sat-faint text-[10.5px] font-mono">
          <span>Up to 4 images</span>
          <span className="hidden sm:inline">
            Enter to send · Shift + Enter for new line
          </span>
        </div>
      </div>
    </div>
  );
}
