import "../../../css/gurbani.css";
import { useEffect, useRef, useState } from "react";
import { Head } from "@inertiajs/react";
import GurbaniDisplay from "./GurbaniDisplay";

interface Pankti {
  gurmukhi: string;
  translation: string;
  start_time: number;
  end_time: number;
  audio_source_part: number;
  source_page: number;
}

const BottomBar = ({ progress, inputAng, setInputAng, goToAng, prevAng, nextAng, togglePlay, playing, add10Angs, subtract10Angs }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastMoveTime, setLastMoveTime] = useState(Date.now());

  const handleMouseMove = () => {
    setIsVisible(true);
    setLastMoveTime(Date.now());
  };

  const checkInactivity = () => {
    if (Date.now() - lastMoveTime > 4000) { // 4 seconds of inactivity
      setIsVisible(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    const interval = setInterval(checkInactivity, 1000); // Check every second

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      clearInterval(interval);
    };
  }, [lastMoveTime]);

  return (
    <div
      className={`fixed bottom-0 left-0 w-full bg-gray-900 bg-opacity-95 px-6 py-4 transition-all duration-300 ${isVisible ? "opacity-100" : "opacity-0 pointer-events-none"}`}
    >
      <div className="w-full h-2 bg-gray-700 rounded-full mb-2">
        <div className="h-2 bg-white" style={{ width: `${progress}%` }} />
      </div>

      <div className="relative flex items-center justify-between w-full">
        {/* Left Section: Ang input, Go, Prev/Next */}
        <div className="flex items-center gap-4 text-white">
          <span className="font-gurbani text-xl">AMg</span>
          <input
            type="text"
            value={inputAng}
            onChange={e => setInputAng(e.target.value)}
            className="w-20 px-2 py-1 rounded text-black bg-white text-xl"
            maxLength={4}
          />
          <button onClick={goToAng} className="bg-white px-3 py-1 rounded text-black">Go</button>
          <div className="flex items-center gap-2">
            <button onClick={prevAng} className="bg-white px-3 py-1 rounded text-black">Prev</button>
            <button onClick={nextAng} className="bg-white px-3 py-1 rounded text-black">Next</button>
          </div>
        </div>

        {/* Center Section: Play Button */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <button onClick={togglePlay} className="bg-white px-6 py-2 rounded-full text-black">{playing ? "Pause" : "Play"}</button>
        </div>

        {/* Right Section: +10/-10 Angs */}
        <div className="flex items-center gap-4 text-white">
          <span className="text-white">+10 Angs</span>
          <button onClick={subtract10Angs} className="bg-white px-3 py-1 rounded text-black">-10</button>
          <button onClick={add10Angs} className="bg-white px-3 py-1 rounded text-black">+10</button>
        </div>
      </div>
    </div>
  );
};

export default function ListenGurbani() {
  // Load saved settings and Ang
  const savedAng = parseInt(localStorage.getItem('currentAng') || '1', 10);
  const savedGurbaniFontSize = parseInt(localStorage.getItem('gurbaniFontSize') || '60', 10);
  const savedTranslationFontSize = parseInt(localStorage.getItem('translationFontSize') || '40', 10);
  const savedShowSettings = localStorage.getItem('showSettings') === 'true';

  const [ang, setAng] = useState(savedAng);
  const [panktis, setPanktis] = useState<Pankti[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [inputAng, setInputAng] = useState(savedAng.toString()); // Keep input as string for leading zeros

  const [gurbaniFontSize, setGurbaniFontSize] = useState(savedGurbaniFontSize);
  const [translationFontSize, setTranslationFontSize] = useState(savedTranslationFontSize);
  const [showSettings, setShowSettings] = useState(savedShowSettings);

  const audioRef = useRef<HTMLAudioElement>(null);

  // Load Ang data based on ang state
  useEffect(() => {
    let cancelled = false;

    const loadAng = async () => {
      try {
        const res = await fetch(`/api/gurbani/angs/${ang}`);
        const data = await res.json();
        if (cancelled) return;

        const newPanktis: Pankti[] = data.panktis;
        if (!newPanktis.length) return;

        setPanktis(newPanktis);

        setCurrentIndex(0);
      } catch (err) {
        console.error("Failed to load Ang:", err);
      }
    };

    loadAng();
    return () => { cancelled = true; };
  }, [ang]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || panktis.length === 0) return;

    const currentPankti = panktis[currentIndex];
    if (!currentPankti) return;

    const audioFileName = `/audio/angs/sehaj_path_bhai_sarwan_singh_ang${ang}.webm`;
    const currentAudioFile = audio.src.split("/").slice(-3).join("/");

    if (currentAudioFile !== audioFileName.slice(1)) {
      audio.src = audioFileName;
      audio.load();
      audio.play();
    }

    const onTimeUpdate = () => {
      setProgress((audio.currentTime / audio.duration) * 100);

      if (audio.currentTime >= panktis[currentIndex].end_time) {
        const nextPanktiIndex = currentIndex + 1;

        if (panktis[nextPanktiIndex] && audio.currentTime <= panktis[nextPanktiIndex].end_time) {
          setCurrentIndex(nextPanktiIndex);
          setInputAng(panktis[nextPanktiIndex].source_page.toString());
        } else {
          const pankti = panktis.filter(pankti => audio.currentTime >= pankti.start_time && audio.currentTime <= pankti.end_time);
          if (pankti[0]) {
            const nextIndex = pankti.indexOf(pankti[0]);
            setCurrentIndex(nextPanktiIndex);
            setInputAng(panktis[nextPanktiIndex].source_page.toString());
          }
        }
      }
    };

    const onEnded = () => {
      setAng((prevAng) => Math.min(prevAng + 1, 1430));
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
    };
  }, [currentIndex, panktis, ang, playing]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play().catch(() => { });
      setPlaying(true);
    }
  };

  const goToAng = () => {
    const val = parseInt(inputAng, 10);
    if (val < 1 || val > 1430) {
      alert("Please enter a valid Ang number between 1 and 1430.");
      return;
    }

    setAng(val);
    setInputAng(val.toString());
    setCurrentIndex(0);

    localStorage.setItem('currentAng', val.toString());
  };

  useEffect(() => {
    localStorage.setItem('currentAng', ang.toString());
  }, [ang]);

  useEffect(() => {
    localStorage.setItem('gurbaniFontSize', gurbaniFontSize.toString());
    localStorage.setItem('translationFontSize', translationFontSize.toString());
    localStorage.setItem('showSettings', showSettings.toString());
  }, [gurbaniFontSize, translationFontSize, showSettings]);

  const nextAng = () => {
    setAng(prevAng => {
      const newAng = Math.min(prevAng + 1, 1430);
      setInputAng(newAng.toString());
      return newAng;
    });
  };

  const prevAng = () => {
    setAng(prevAng => {
      const newAng = Math.max(prevAng - 1, 1);
      setInputAng(newAng.toString());
      return newAng;
    });
  };

  const add10Angs = () => {
    setAng(prevAng => {
      const newAng = Math.min(prevAng + 10, 1430);
      setInputAng(newAng.toString());
      return newAng;
    });
  };

  const subtract10Angs = () => {
    setAng(prevAng => {
      const newAng = Math.max(prevAng - 10, 1);
      setInputAng(newAng.toString());
      return newAng;
    });
  };

  const pankti = panktis[currentIndex];

  return (
    <>
      <Head title={`Listen Gurbani – Ang ${ang}`} />

      <div className="min-h-screen flex flex-col justify-center px-6 pb-32 relative" style={{ background: "#000000" }}>
        {/* Settings */}
        <div className="absolute top-6 right-6">
          <button onClick={() => setShowSettings(s => !s)} className="text-white text-2xl p-4 rounded hover:text-gray-500">&#9776;</button>

          {showSettings && (
            <div className="absolute right-0 mt-2 w-64 bg-gray-900 text-white p-4 rounded shadow-lg z-50 space-y-4">
              <div>
                <label>Gurbani Font: {gurbaniFontSize}px</label>
                <input type="range" min={10} max={150} value={gurbaniFontSize} onChange={e => setGurbaniFontSize(Number(e.target.value))} className="w-full" />
              </div>
              <div>
                <label>Translation Font: {translationFontSize}px</label>
                <input type="range" min={10} max={150} value={translationFontSize} onChange={e => setTranslationFontSize(Number(e.target.value))} className="w-full" />
              </div>
            </div>
          )}
        </div>

        {pankti && (
          <GurbaniDisplay gurmukhi={pankti.gurmukhi} translation={pankti.translation} gurbaniFontSize={gurbaniFontSize} translationFontSize={translationFontSize} />
        )}

        <audio ref={audioRef} preload="auto" />

        {/* Player Bar */}
        <BottomBar
          progress={progress}
          inputAng={inputAng}
          setInputAng={setInputAng}
          goToAng={goToAng}
          prevAng={prevAng}
          nextAng={nextAng}
          togglePlay={togglePlay}
          playing={playing}
          add10Angs={add10Angs}
          subtract10Angs={subtract10Angs}
        />

      </div>
    </>
  );
}
