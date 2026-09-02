import React from "react";
import Markdown from "./Markdown";
import { Bot } from "lucide-react";
import { ChatMessage, ImageData } from "../types";

// Describes a labelled collection of image thumbnails attached to a message.
interface ImageStripProps {
  images: ImageData[];
  label: string;
}

// Render uploaded imagery or backend evidence as a compact thumbnail strip.
function ImageStrip({ images, label }: ImageStripProps) {
  if (!images?.length) return null;

  return (
    <div className="max-w-[80%] my-[6px]">
      <div className="text-[10.5px] text-sat-faint mb-[5px] font-mono">
        {label}
      </div>
      <div className="flex flex-wrap gap-2">
        {images.map((img, i) => (
          <figure key={i} className="m-0">
            <img
              src={`data:${img.mediaType};base64,${img.b64}`}
              alt={img.name || `Image ${i + 1}`}
              loading="lazy"
              className="w-24 h-24 object-cover border border-sat-border"
            />
            <figcaption className="sr-only">
              {img.caption || img.name || `Image ${i + 1}`}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}

// Defines the message record rendered by one conversation row.
interface MessageProps {
  message: ChatMessage;
}

// Render user and assistant messages with their applicable metadata and attachments.
export default function Message({ message }: MessageProps) {
  const isAssistant = message.role === "assistant";

  return (
    <article
      className={`w-full max-w-[95vh] mx-auto mb-7 ${
        isAssistant
          ? "grid grid-cols-[30px_minmax(0,1fr)] gap-3 items-start"
          : "flex flex-row justify-end"
      }`}
    >
      {/* Avatar Container */}
      {isAssistant && (
        <div className="w-[30px] h-[30px] border border-sat-border-strong bg-sat-panel-alt grid place-items-center text-sat-signal shrink-0">
          <Bot size={15} />
        </div>
      )}

      {/* Message Contents */}
      <div
        className={`min-w-0 ${
          isAssistant ? "" : "flex flex-col items-end max-w-full"
        }`}
      >
        {/* Author Header metadata */}
        <div className="h-[30px] flex items-center gap-[7px] text-sat-faint text-[10px] font-mono tracking-[0.08em] uppercase">
          <span>{isAssistant ? "SATQUERY AI" : "YOU"}</span>
          {message.meta?.analysis_type && (
            <span className="px-[6px] py-[3px] border border-sat-border text-[#9b9b88] normal-case tracking-normal">
              {message.meta.analysis_type}
            </span>
          )}
          {message.meta?.confidence && (
            <span className="px-[6px] py-[3px] border border-sat-border text-[#aaa17c] normal-case tracking-normal">
              {message.meta.confidence} confidence
            </span>
          )}
        </div>

        {/* Uploaded Content */}
        {message.images && message.images.length > 0 && (
          <ImageStrip images={message.images} label="Uploaded imagery" />
        )}

        {/* Text Message Bubble */}
        {message.text && (
          <div
            className={`p-[10px_14px] text-[13.5px] leading-[1.6] bg-sat-panel border border-sat-border-soft ${
              isAssistant
                ? "max-w-[80%] text-sat-text"
                : "max-w-[650px] border-l-2 border-l-sat-signal text-sat-text"
            }`}
          >
            <Markdown text={message.text} />
          </div>
        )}

        {/* Response Evidence Strip */}
        {message.evidence && message.evidence.length > 0 && (
          <ImageStrip images={message.evidence} label="Evidence & references" />
        )}

        {/* Collapsible Execution/Analysis Logs */}
        {message.meta?.trace && message.meta.trace.length > 0 && (
          <details className="mt-3 border-t border-sat-border pt-[9px] text-sat-faint text-[10px] max-w-[80%] font-mono">
            <summary className="cursor-pointer text-sat-muted text-[9px] hover:text-sat-text">
              Analysis trace
            </summary>
            <ol className="mt-[7px] pl-5 list-decimal space-y-1">
              {message.meta.trace.map((x, i) => (
                <li key={i}>{x}</li>
              ))}
            </ol>
          </details>
        )}

        {/* System Constraints Notice */}
        {message.meta?.limitations && message.meta.limitations.length > 0 && (
          <div className="mt-3 p-3 bg-sat-panel-alt border border-sat-border max-w-[80%] text-[11.5px] text-sat-muted">
            <b className="text-[10px] text-sat-faint uppercase font-mono block mb-1">
              Limitations
            </b>
            <ul className="pl-4 list-disc space-y-1">
              {message.meta.limitations.map((x, i) => (
                <li key={i}>{x}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </article>
  );
}
