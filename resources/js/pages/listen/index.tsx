import "../../../css/gurbani.css";
import { useEffect, useRef, useState } from "react";
import { Head } from "@inertiajs/react";

interface Pankti {
  gurmukhi: string;
  translation: string;
  start_time: number;
  audio_source_part: number;
}

export default function ListenGurbani() {
  const [ang, setAng] = useState(1);
  const [panktis, setPanktis] = useState<Pankti[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [currentPart, setCurrentPart] = useState<number | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [inputAng, setInputAng] = useState(ang);
  const [loadingNextAng, setLoadingNextAng] = useState(false);

  // Font size settings
  const [gurbaniFontSize, setGurbaniFontSize] = useState(32);
  const [translationFontSize, setTranslationFontSize] = useState(14);
  const [showSettings, setShowSettings] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);

  /* -------------------------
     Load Ang (append or reset)
     ------------------------- */
  useEffect(() => {
    let cancelled = false;

    fetch(`/api/gurbani/angs/${ang}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        const newPanktis: Pankti[] = data.panktis;
        if (!newPanktis.length) return;

        const part = newPanktis[0].audio_source_part;

        // First load OR new audio part
        if (currentPart === null || part !== currentPart) {
          setCurrentPart(part);
          setAudioUrl(
            `/audio/sehaj_path_bhai_sarwan_singh_part${part}.webm`
          );
          setPanktis(newPanktis);
          setCurrentIndex(0);
          setProgress(0);
          setPlaying(false);
        } else {
          // Same audio part → append Ang
          setPanktis((prev) => [...prev, ...newPanktis]);
        }

        setLoadingNextAng(false);
      });

    return () => {
      cancelled = true;
    };
  }, [ang]);

  /* -------------------------
     Audio sync + auto Ang load
     ------------------------- */
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || panktis.length === 0) return;

    const onTimeUpdate = () => {
      const time = audio.currentTime;
      setProgress((time / audio.duration) * 100);

      const next = panktis[currentIndex + 1];
      if (next && time >= next.start_time) {
        setCurrentIndex((i) => i + 1);
      }

      // Preload next Ang if nearing end of loaded panktis
      if (
        !loadingNextAng &&
        currentIndex >= panktis.length - 3
      ) {
        setLoadingNextAng(true);
        setAng((a) => a + 1);
      }
    };

    const onEnded = () => {
      // Audio part finished → load next part via next Ang
      setAng((a) => a + 1);
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
    };
  }, [panktis, currentIndex, loadingNextAng]);

  /* -------------------------
     Controls
     ------------------------- */
  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play();
      setPlaying(true);
    }
  };

  const goToAng = () => {
    let val = parseInt(inputAng.toString());
    if (val < 1) val = 1;
    if (val > 1430) val = 1430;

    setPanktis([]);
    setCurrentIndex(0);
    setCurrentPart(null);
    setAng(val);
  };

  const pankti = panktis[currentIndex];

  return (
    <>
      <Head title={`Listen Gurbani – Ang ${ang}`} />

      <div className="min-h-screen flex flex-col justify-center px-6 pb-32 relative">
        {/* Settings */}
        <div className="absolute top-6 right-6">
          <button
            onClick={() => setShowSettings((s) => !s)}
            className="text-black text-2xl p-2 rounded hover:text-gray-500"
          >
            &#9776;
          </button>

          {showSettings && (
            <div className="absolute right-0 mt-2 w-64 bg-gray-900 text-white p-4 rounded shadow-lg z-50 space-y-4">
              <div>
                <label>Gurbani Font: {gurbaniFontSize}px</label>
                <input
                  type="range"
                  min={16}
                  max={72}
                  value={gurbaniFontSize}
                  onChange={(e) =>
                    setGurbaniFontSize(Number(e.target.value))
                  }
                  className="w-full"
                />
              </div>
              <div>
                <label>Translation Font: {translationFontSize}px</label>
                <input
                  type="range"
                  min={12}
                  max={32}
                  value={translationFontSize}
                  onChange={(e) =>
                    setTranslationFontSize(Number(e.target.value))
                  }
                  className="w-full"
                />
              </div>
            </div>
          )}
        </div>

        {/* Gurbani Display */}
        {pankti && (
          <div className="text-center space-y-4 flex-1 flex flex-col justify-center">
            <p
              className="font-gurbani leading-loose"
              style={{ fontSize: `${gurbaniFontSize}px` }}
            >
              {pankti.gurmukhi}
            </p>
            <p
              className="text-muted-foreground"
              style={{ fontSize: `${translationFontSize}px` }}
            >
              {pankti.translation}
            </p>
          </div>
        )}

        {/* Audio */}
        {audioUrl && <audio ref={audioRef} src={audioUrl} />}

        {/* Player Bar */}
        <div className="fixed bottom-0 left-0 w-full bg-gray-900 bg-opacity-95 px-6 py-4">
          <div className="w-full h-2 bg-gray-700 rounded-full mb-2">
            <div
              className="h-2 bg-primary"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
              <span className="font-gurbani text-xl">AMg</span>
              <input
                type="number"
                min={1}
                max={1430}
                value={inputAng}
                onChange={(e) => setInputAng(Number(e.target.value))}
                className="w-20 px-2 py-1 rounded text-black bg-white text-xl"
              />
              <button
                onClick={goToAng}
                className="bg-primary px-3 py-1 rounded"
              >
                Go
              </button>
            </div>

            <div className="absolute left-1/2 -translate-x-1/2">
              <button
                onClick={togglePlay}
                className="bg-white px-6 py-2 rounded-full"
              >
                {playing ? "Pause" : "Play"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
