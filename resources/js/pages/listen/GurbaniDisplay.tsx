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
  const renderGurbani = () => {
    return gurmukhi.split(" ").map((word, index) => {
      let color = "rgb(255, 255, 255)"; // default white
      let cleanWord = word;

      // Full vishraam (;)
      if (word.endsWith(";")) {
        color = "rgb(220, 38, 38)"; // red-700 equivalent
        cleanWord = word.slice(0, -1);
      }
      // Light vishraam (,) or period (.)
      else if (word.endsWith(",") || word.endsWith(".")) {
        color = "rgb(29, 78, 216)"; // blue-700 equivalent
        cleanWord = word.slice(0, -1);
      }

      return (
        <span key={index} style={{ color }}>
          {cleanWord}{" "}
        </span>
      );
    });
  };

  return (
    <div className="text-center space-y-4 flex-1 flex flex-col justify-center">
      <p
        className="font-gurbani leading-loose"
        style={{ fontSize: `${gurbaniFontSize}px` }}
      >
        {renderGurbani()}
      </p>

      <p
        className="text-gray-300"
        style={{ fontSize: `${translationFontSize}px` }}
      >
        {translation}
      </p>
    </div>
  );
}
