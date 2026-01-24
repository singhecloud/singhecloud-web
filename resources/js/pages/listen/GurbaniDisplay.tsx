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
      let color = "#ffcc00"; // default white
      let cleanWord = word;

      // Full vishraam (;)
      if (word.endsWith(";")) {
        color = "#e56c00"; // red-700 equivalent
        cleanWord = word.slice(0, -1);
      }
      // Light vishraam (,) or period (.)
      else if (word.endsWith(",") || word.endsWith(".")) {
        color = "#196fb2ff"; // blue-700 equivalent
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
        style={{ fontSize: `${gurbaniFontSize}px`, lineHeight: '1.4' }}
      >
        {renderGurbani()}
      </p>

      <p
        className="font-punjabi"
        style={{ fontSize: `${translationFontSize}px`, color: '#c0c0c0', marginTop: '10px' }}
      >
        {translation}
      </p>
    </div>
  );
}
