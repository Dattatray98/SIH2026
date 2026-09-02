import React, { useEffect, useState } from "react";

export default function ThinkingRow() {
  const [elapsed, setElapsed] = useState<number>(0);

  // Tracks precise elapsed execution time in seconds
  useEffect(() => {
    const start = Date.now();
    const id = setInterval(() => {
      setElapsed((Date.now() - start) / 1000);
    }, 100);

    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col gap-[6px] w-[min(280px,100%)] ml-auto self-end font-mono">
      <div className="flex items-center justify-end gap-2 text-right text-[12px] text-sat-muted">
        <div>
          <b className="block text-sat-text font-medium text-[11.5px]">
            Analyzing request…
          </b>
          <small className="text-sat-faint text-[10px]">
            Preparing response ·{" "}
            <span className="text-sat-signal tabular">
              {elapsed.toFixed(1)}s
            </span>
          </small>
        </div>
      </div>
      <div className="relative h-[2px] w-full bg-sat-border-soft overflow-hidden">
        <div className="absolute top-0 left-[-30%] w-[30%] h-full bg-sat-signal animate-sweep" />
      </div>
    </div>
  );
}
