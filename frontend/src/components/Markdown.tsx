import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Allows callers to omit message text while a message is still being assembled.
interface MarkdownProps {
  text?: string;
}

// Render GitHub-Flavored Markdown with safe links and SatQuery-specific code/image styles.
export default function Markdown({ text }: MarkdownProps) {
  return (
    <div className="prose prose-invert max-w-none text-sat-text text-[13px] leading-[1.75]">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Render links securely in a new browser tab
          a: ({ node, ...props }) => (
            <a
              {...props}
              target="_blank"
              rel="noreferrer"
              className="text-sat-signal underline hover:brightness-125"
            />
          ),

          // Wrap standalone markdown images in semantic figure markup
          img: ({ node, ...props }) => (
            <figure className="my-2 max-w-[480px]">
              <img
                {...props}
                loading="lazy"
                alt={props.alt || "Evidence"}
                className="w-full border border-sat-border object-cover"
              />
              <figcaption className="mt-[4px] text-[10.5px] text-sat-faint">
                {props.alt || "Evidence image"}
              </figcaption>
            </figure>
          ),

          // Handle custom styling for inline code versus block formatting
          code: ({ className, children, ...props }) => {
            const isInline = !className && !String(children).includes("\n");
            if (isInline) {
              return (
                <code
                  className="px-1 py-[2px] bg-sat-panel border border-sat-border text-sat-signal text-[11.5px] font-mono"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <pre className="my-2 p-3 bg-sat-panel border border-sat-border text-[11.5px] font-mono overflow-x-auto text-sat-text">
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
            );
          },
        }}
      >
        {text || ""}
      </ReactMarkdown>
    </div>
  );
}
