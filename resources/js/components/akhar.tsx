"use client";

import { useEffect, useRef, useState } from "react";
import { Home } from "lucide-react";
import { router } from "@inertiajs/react";

type ReadTileProps = {
  imgSrc: string;
  alt?: string;
  soundSrc?: string;
  onNext: () => void;
  currentSerial: number;
  onComplete: () => void;
};

export function Akhar({
  imgSrc,
  alt = "",
  soundSrc,
  onNext,
  currentSerial,
  onComplete,
}: ReadTileProps) {
  const [showHome, setShowHome] = useState(true);
  const homeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const showControls = () => {
      setShowHome(true);
      document.body.style.cursor = "default";

      if (timer) clearTimeout(timer);

      timer = setTimeout(() => {
        setShowHome(false);
        document.body.style.cursor = "none";
      }, 2000);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      showControls();

      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        setShowHome(true);
        homeButtonRef.current?.focus();
      }
    };

    window.addEventListener("mousemove", showControls);
    window.addEventListener("touchstart", showControls);
    window.addEventListener("keydown", handleKeyDown);

    showControls();

    return () => {
      window.removeEventListener("mousemove", showControls);
      window.removeEventListener("touchstart", showControls);
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(timer);
      document.body.style.cursor = "default";
    };
  }, []);

  useEffect(() => {
    if (!soundSrc) return;

    const newAudio = new Audio(soundSrc);
    newAudio.preload = "auto";

    let nextTimer: ReturnType<typeof setTimeout> | null = null;

    const handleEnd = () => {
      nextTimer = setTimeout(() => {
        if (currentSerial >= 37) {
          onComplete();
        } else {
          onNext();
        }
      }, 1000);
    };

    newAudio.addEventListener("ended", handleEnd);

    newAudio.currentTime = 0;
    newAudio.play().catch((err) => {
      console.log("Autoplay blocked:", err);
    });

    return () => {
      newAudio.pause();
      newAudio.currentTime = 0;

      if (nextTimer) clearTimeout(nextTimer);

      newAudio.removeEventListener("ended", handleEnd);
    };
  }, [soundSrc, currentSerial, onNext, onComplete]);

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-orange-100 p-4">
      <button
        ref={homeButtonRef}
        onClick={() => router.visit("/learn/punjabi/reading")}
        aria-label="Go home"
        className={`
          fixed top-6 left-6 z-50
          bg-white/90 text-green-700
          border border-green-200
          p-4 rounded-full shadow-md
          hover:bg-green-50
          focus:outline-none focus:ring-4 focus:ring-green-500
          flex items-center justify-center
          transition-all duration-300
          ${
            showHome
              ? "opacity-100 scale-100"
              : "opacity-0 scale-90 pointer-events-none"
          }
        `}
      >
        <Home size={26} />
      </button>

      <div className="w-full max-w-3xl flex flex-col items-center">
        <div className="w-full aspect-[3/2] bg-white border-4 border-yellow-600 rounded-2xl shadow-lg shadow-yellow-500/50 overflow-hidden flex items-center justify-center">
          <img
            key={imgSrc}
            src={imgSrc}
            alt={alt}
            className="w-full object-contain"
            style={{ height: "fit-content" }}
          />
        </div>
      </div>
    </div>
  );
}