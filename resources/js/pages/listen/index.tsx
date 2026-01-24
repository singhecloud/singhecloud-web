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

export default function ListenGurbani() {
  const savedAng = parseInt(localStorage.getItem("currentAng") || "1", 10);
  const savedGurbaniFontSize = parseInt(localStorage.getItem("gurbaniFontSize") || "60", 10);
  const savedTranslationFontSize = parseInt(localStorage.getItem("translationFontSize") || "40", 10);
  const savedShowSettings = localStorage.getItem("showSettings") === "true";

  const [ang, setAng] = useState(savedAng);
  const [panktis, setPanktis] = useState<Pankti[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [inputAng, setInputAng] = useState(savedAng.toString());

  const [gurbaniFontSize, setGurbaniFontSize] = useState(savedGurbaniFontSize);
  const [translationFontSize, setTranslationFontSize] = useState(savedTranslationFontSize);
  const [showSettings, setShowSettings] = useState(savedShowSettings);

  const [uiVisible, setUiVisible] = useState(true); // controls both bottom bar & settings visibility

  const audioRef = useRef<HTMLAudioElement>(null);
  const inactivityTimer = useRef<NodeJS.Timeout | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const resetInactivity = () => {
    setUiVisible(true);
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    inactivityTimer.current = setTimeout(() => {
      setUiVisible(false);
      setShowSettings(false);
    }, 4000);
  };

  // Global inactivity tracking
  useEffect(() => {
    const handleMove = () => resetInactivity();
    document.addEventListener("mousemove", handleMove);
    document.addEventListener("touchstart", handleMove); // for mobile

    if (showSettings) panelRef.current?.addEventListener("mousemove", handleMove);

    resetInactivity();

    return () => {
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("touchstart", handleMove);
      panelRef.current?.removeEventListener("mousemove", handleMove);
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    };
  }, [showSettings]);

  // Load Ang data
  useEffect(() => {
    let cancelled = false;
    const loadAng = async () => {
      try {
        const res = await fetch(`/api/gurbani/angs/${ang}`);
        const data = await res.json();
        if (cancelled) return;
        setPanktis(data.panktis || []);
        setCurrentIndex(0);
      } catch (err) {
        console.error("Failed to load Ang:", err);
      }
    };
    loadAng();
    return () => { cancelled = true; };
  }, [ang]);

  // Audio handling
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !panktis.length) return;

    const audioFile = `/audio/angs/48k/sehaj_path_bhai_sarwan_singh_ang${ang}.webm`;

    if (!audio.src.includes(audioFile)) {
      audio.src = audioFile;
      audio.load();
      audio.play();
      setPlaying(true);
    }

    const onTimeUpdate = () => {
      setProgress((audio.currentTime / audio.duration) * 100);
      if (audio.currentTime >= panktis[currentIndex]?.end_time) {
        setCurrentIndex(i => Math.min(i + 1, panktis.length - 1));
      }
    };

    const onEnded = () => setAng(a => Math.min(a + 1, 1430));

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
    };
  }, [panktis, currentIndex, ang]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    playing ? audio.pause() : audio.play();
    setPlaying(!playing);
  };

  const goToAng = () => {
    const val = parseInt(inputAng, 10);
    if (val < 1 || val > 1430) return alert("Invalid Ang");
    setAng(val);
    localStorage.setItem("currentAng", val.toString());
  };

  const nextAng = () => { setAng(a => Math.min(a + 1, 1430)); setInputAng(prev => (Math.min(parseInt(prev) + 1, 1430)).toString()); };
  const prevAng = () => { setAng(a => Math.max(a - 1, 1)); setInputAng(prev => (Math.max(parseInt(prev) - 1, 1)).toString()); };
  const add10Angs = () => { setAng(a => Math.min(a + 10, 1430)); setInputAng(prev => (Math.min(parseInt(prev) + 10, 1430)).toString()); };
  const subtract10Angs = () => { setAng(a => Math.max(a - 10, 1)); setInputAng(prev => (Math.max(parseInt(prev) - 10, 1)).toString()); };

  const pankti = panktis[currentIndex];

  return (
    <>
      <Head title={`Listen Gurbani – Ang ${ang}`} />

      <div className="min-h-screen flex flex-col justify-center px-6 pb-32 relative bg-black">
        {/* SETTINGS BUTTON */}
        <div
          className={`fixed top-6 right-6 z-50 transition-all duration-300 ${
            uiVisible ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <button
            onClick={() => setShowSettings(s => !s)}
            className="text-white text-2xl p-4 hover:text-gray-500"
          >
            &#9776; {showSettings ? 'Close Settings' : 'Settings'}
          </button>

          {/* SETTINGS PANEL */}
          {showSettings && (
            <div
              ref={panelRef}
              className="w-full max-w-md sm:max-w-lg bg-gray-900 text-white p-6 rounded shadow-lg space-y-6 mt-2"
            >
              {/* Gurbani Font */}
              <div className="flex flex-col gap-3">
                <label className="text-2xl sm:text-4xl">Gurbani Font: {gurbaniFontSize}px</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={10}
                    max={150}
                    value={gurbaniFontSize}
                    onChange={e => setGurbaniFontSize(+e.target.value)}
                    className="h-6 sm:h-8 cursor-pointer flex-grow"
                  />
                  <div className="flex flex-col gap-1">
                    <button onClick={() => setGurbaniFontSize(f => Math.min(f + 1, 150))} className="bg-white text-black px-4 py-2 rounded text-xl sm:text-2xl">+</button>
                    <button onClick={() => setGurbaniFontSize(f => Math.max(f - 1, 10))} className="bg-white text-black px-4 py-2 rounded text-xl sm:text-2xl">−</button>
                  </div>
                </div>
              </div>

              {/* Translation Font */}
              <div className="flex flex-col gap-3">
                <label className="text-2xl sm:text-4xl">Translation Font: {translationFontSize}px</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={10}
                    max={150}
                    value={translationFontSize}
                    onChange={e => setTranslationFontSize(+e.target.value)}
                    className="h-6 sm:h-8 cursor-pointer flex-grow"
                  />
                  <div className="flex flex-col gap-1">
                    <button onClick={() => setTranslationFontSize(f => Math.min(f + 1, 150))} className="bg-white text-black px-4 py-2 rounded text-xl sm:text-2xl">+</button>
                    <button onClick={() => setTranslationFontSize(f => Math.max(f - 1, 10))} className="bg-white text-black px-4 py-2 rounded text-xl sm:text-2xl">−</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* DISPLAY PANKTI */}
        {pankti && (
          <GurbaniDisplay
            gurmukhi={pankti.gurmukhi}
            translation={pankti.translation}
            gurbaniFontSize={gurbaniFontSize}
            translationFontSize={translationFontSize}
          />
        )}

        <audio ref={audioRef} preload="auto" />

        {/* BOTTOM BAR */}
        <div
          className={`fixed bottom-0 left-0 w-full bg-gray-900 bg-opacity-95 px-4 sm:px-6 py-3 sm:py-4 transition-all duration-300 ${
            uiVisible ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          {/* Progress Bar */}
          <div className="w-full h-2 bg-gray-700 rounded-full mb-2">
            <div className="h-2 bg-white" style={{ width: `${progress}%` }} />
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-3 sm:gap-0">
            {/* Left Section */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-white">
              <span className="font-gurbani text-lg sm:text-xl">AMg</span>
              <input
                type="text"
                value={inputAng}
                onChange={e => setInputAng(e.target.value)}
                className="w-16 sm:w-20 px-2 py-1 rounded text-black bg-white text-sm sm:text-xl"
                maxLength={4}
              />
              <button
                className="bg-white px-3 py-1 rounded text-black text-sm sm:text-base"
                onClick={goToAng}
              >
                Go
              </button>
              <div className="flex items-center gap-1 sm:gap-2">
                <button className="bg-white px-2 py-1 rounded text-black text-sm sm:text-base" onClick={prevAng}>Prev</button>
                <button className="bg-white px-2 py-1 rounded text-black text-sm sm:text-base" onClick={nextAng}>Next</button>
              </div>
            </div>

            {/* Center Section */}
            <div className="mx-auto sm:mx-0">
              <button
                className="bg-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-black text-base sm:text-lg"
                onClick={togglePlay}
              >
                {playing ? "Pause" : "Play"}
              </button>
            </div>

            {/* Right Section */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-white justify-end">
              <span className="text-sm sm:text-base">+10 Angs</span>
              <button className="bg-white px-2 py-1 rounded text-black text-sm sm:text-base" onClick={subtract10Angs}>-10</button>
              <button className="bg-white px-2 py-1 rounded text-black text-sm sm:text-base" onClick={add10Angs}>+10</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
