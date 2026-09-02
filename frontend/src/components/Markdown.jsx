import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function Markdown({ text }) {
  return (
    <div className="markdown-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Render links securely in a new browser tab
          a: ({ node, ...props }) => (
            <a {...props} target="_blank" rel="noreferrer" />
          ),

          // Wrap standalone markdown images in semantic figure markup
          img: ({ node, ...props }) => (
            <figure className="md-image">
              <img {...props} loading="lazy" alt={props.alt || "Evidence"} />
              <figcaption>{props.alt || "Evidence image"}</figcaption>
            </figure>
          ),

          // Handle custom styling for inline code versus block formatting
          code: ({ inline, className, children, ...props }) =>
            inline ? (
              <code className="inline-code" {...props}>
                {children}
              </code>
            ) : (
              <pre className="code-block">
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
            ),
        }}
      >
        {text || ""}
      </ReactMarkdown>
    </div>
  );
}
