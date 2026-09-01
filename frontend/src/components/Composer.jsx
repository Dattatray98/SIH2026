import React, { useEffect, useRef } from "react";
import { Paperclip, ArrowUp, X } from "lucide-react";

export default function Composer({ input, setInput, pendingFiles, onFilesSelected, onRemoveFile, onSend, thinking }) {
  const ref = useRef(null);
  useEffect(() => { if (ref.current) { ref.current.style.height = "auto"; ref.current.style.height = Math.min(ref.current.scrollHeight, 180) + "px"; } }, [input]);
  function onKeyDown(e) { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend(); } }
  const atLimit = pendingFiles.length >= 4;
  return <div className="composer-area">
    <div className="composer-container">
      {pendingFiles.length > 0 && <div className="pending-files">{pendingFiles.map((file, index) => <div className="file-chip" key={`${file.name}-${index}`}>
        <img src={`data:${file.mediaType};base64,${file.b64}`} alt={file.name} className="chip-preview" />
        <span>{file.name}</span><button onClick={() => onRemoveFile(index)} title="Remove image"><X size={12} /></button>
      </div>)}</div>}
      <div className="composer">
        <label htmlFor="sq-file-input" className={`attach-button ${atLimit ? "disabled" : ""}`} title={atLimit ? "Maximum 6 images" : "Attach imagery"}><Paperclip size={16} /></label>
        <input id="sq-file-input" type="file" accept="image/*" multiple disabled={atLimit} className="sr-only" onChange={e => { if (e.target.files?.length) onFilesSelected(e.target.files); e.target.value = ""; }} />
        <textarea ref={ref} value={input} onChange={e => setInput(e.target.value)} onKeyDown={onKeyDown} placeholder="Ask about a satellite scene, land cover, flooding, or change…" rows={1} />
        <button className="send-button" onClick={onSend} disabled={thinking || (!input.trim() && pendingFiles.length === 0)} title="Send"><ArrowUp size={16} /></button>
      </div>
      <div className="footer-note"><span>Up to 4 images</span><span>Enter to send · Shift + Enter for new line</span></div>
    </div>
  </div>;
}
