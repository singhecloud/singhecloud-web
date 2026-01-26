import { useLayoutEffect, useRef, useState } from "react";

interface Props {
  gurmukhi: string;
  translation: string;
  gurbaniFontSize: number;
  translationFontSize: number;
}

export default function GurbaniDisplay({
  gurmukhi,
  translation,
  gurbaniFontSize,
  translationFontSize,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldSplit, setShouldSplit] = useState<boolean | null>(null);

  // Pre-calculate BEFORE paint
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const measurer = document.createElement("span");
    measurer.style.position = "absolute";
    measurer.style.visibility = "hidden";
    measurer.style.whiteSpace = "nowrap";
    measurer.style.fontSize = `${gurbaniFontSize}px`;
    measurer.className = "font-gurbani";

    // Remove vishraam symbols for accurate width
    measurer.textContent = gurmukhi.replace(/;/g, "");

    document.body.appendChild(measurer);

    const textWidth = measurer.offsetWidth;
    const containerWidth = container.offsetWidth;

    document.body.removeChild(measurer);

    setShouldSplit(textWidth > containerWidth);
  }, [gurmukhi, gurbaniFontSize]);

  const renderGurbani = () => {
    let splitDone = false;

    return gurmukhi.split(" ").map((word, index) => {
      let color = "#ffcc00";
      let cleanWord = word;
      let isFullVishraam = false;

      if (word.endsWith(";")) {
        color = "#e56c00";
        cleanWord = word.slice(0, -1);
        isFullVishraam = true;
      } else if (word.endsWith(",") || word.endsWith(".")) {
        color = "#196fb2ff";
        cleanWord = word.slice(0, -1);
      }

      const insertBreak =
        shouldSplit && isFullVishraam && !splitDone;

      if (insertBreak) splitDone = true;

      return (
        <span key={index}>
          <span style={{ color }}>{cleanWord}</span>
          {insertBreak ? <br /> : " "}
        </span>
      );
    });
  };

  return (
    <div
      ref={containerRef}
      className="text-center space-y-4 flex-1 flex flex-col justify-center"
    >
      {/* Render ONLY after decision is made */}
      {shouldSplit !== null && (
        <p
          className="font-gurbani"
          style={{
            fontSize: `${gurbaniFontSize}px`,
            lineHeight: "1.4",
          }}
        >
          {renderGurbani()}
        </p>
      )}

      <p
        className="font-punjabi"
        style={{
          fontSize: `${translationFontSize}px`,
          color: "#c0c0c0",
          marginTop: "10px",
        }}
      >
        {translation}
      </p>
    </div>
  );
}
