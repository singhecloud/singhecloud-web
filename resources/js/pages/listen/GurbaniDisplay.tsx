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
      let className = "";
      let cleanWord = word;

      // Full vishraam (;)
      if (word.endsWith(";")) {
        className = "text-red-800";
        cleanWord = word.slice(0, -1);
      }

      // Light vishraam (,)
      else if (word.endsWith(",") || word.endsWith(".")) {
        className = "text-blue-900";
        cleanWord = word.slice(0, -1);
      }

      return (
        <span key={index} className={className}>
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
        className="text-muted-foreground"
        style={{ fontSize: `${translationFontSize}px` }}
      >
        {translation}
      </p>
    </div>
  );
}
