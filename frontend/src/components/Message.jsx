import React from "react";
import Markdown from "./Markdown";
import { Bot, UserRound } from "lucide-react";

function ImageStrip({ images, label }) {
  if (!images?.length) return null;
  return <div className="evidence-section"><div className="evidence-label">{label}</div><div className="image-grid">{images.map((img,i)=><figure key={i}><img src={`data:${img.mediaType};base64,${img.b64}`} alt={img.name || `Image ${i+1}`} loading="lazy"/><figcaption>{img.caption || img.name || `Image ${i+1}`}</figcaption></figure>)}</div></div>;
}

export default function Message({ message }) {
  return <article className={`message-row ${message.role}`}>
    <div className="message-avatar">{message.role === "assistant" ? <Bot size={15}/> : <UserRound size={14}/>}</div>
    <div className="message-body">
      <div className="message-author">{message.role === "assistant" ? "SATQUERY AI" : "YOU"}{message.meta?.analysis_type && <span className="tag">{message.meta.analysis_type}</span>}{message.meta?.confidence && <span className="confidence">{message.meta.confidence} confidence</span>}</div>
      {message.images?.length > 0 && <ImageStrip images={message.images} label="Uploaded imagery" />}
      {message.text && <div className="bubble"><Markdown text={message.text}/></div>}
      {message.evidence?.length > 0 && <ImageStrip images={message.evidence} label="Evidence & references" />}
      {message.meta?.trace?.length > 0 && <details className="trace"><summary>Analysis trace</summary><ol>{message.meta.trace.map((x,i)=><li key={i}>{x}</li>)}</ol></details>}
      {message.meta?.limitations?.length > 0 && <div className="limitations"><b>Limitations</b><ul>{message.meta.limitations.map((x,i)=><li key={i}>{x}</li>)}</ul></div>}
    </div>
  </article>;
}
