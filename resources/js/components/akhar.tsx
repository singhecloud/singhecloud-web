"use client";

import { useState, useEffect } from "react";
import { Volume2, ArrowRight, ArrowLeft } from "lucide-react";

type ReadTileProps = {
  imgSrc: string;
  alt?: string;
  soundSrc?: string; // optional sound
  nextHref?: string; // link to next alphabet
  backHref?: string;
};

export function Akhar({ imgSrc, alt = "", soundSrc, backHref, nextHref }: ReadTileProps) {
  const [audio] = useState<HTMLAudioElement | null>(
    soundSrc ? new Audio(soundSrc) : null
  );
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handleEnd = () => setIsPlaying(false);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener("playing", handlePlay);
    audio.addEventListener("ended", handleEnd);
    audio.addEventListener("pause", handlePause);

    return () => {
      audio.removeEventListener("playing", handlePlay);
      audio.removeEventListener("ended", handleEnd);
      audio.removeEventListener("pause", handlePause);
    };
  }, [audio]);

  const playSound = () => {
    if (audio && !isPlaying) {
      audio.currentTime = 0;
      audio.play();
    }
  };

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-orange-100 p-4">
      {/* Container keeps image + buttons same width */}
      <div className="w-full max-w-3xl flex flex-col items-center">
        {/* Alphabet Image */}
        <img
          src={imgSrc}
          alt={alt}
          className="w-full border-4 border-yellow-600 rounded-2xl shadow-lg shadow-yellow-500/50"
        />

        {/* Bottom row for buttons */}
        <div className="w-full flex justify-between mt-12">
          {backHref ? (
            <a
              href={backHref}
              className="bg-green-600 text-white px-6 py-4 rounded-xl shadow-lg hover:bg-green-700 transition flex items-center gap-2"
            >
              <ArrowLeft size={24} />
            </a>
          ) : (
            <div /> // empty spacer for alignment
          )}

          <button
            onClick={playSound}
            disabled={isPlaying}
            className={`px-6 py-4 rounded-xl shadow-lg flex items-center gap-2 transition
              ${isPlaying ? "bg-gray-400 cursor-not-allowed" : "bg-yellow-600 hover:bg-yellow-700 text-white"}`}
          >
            <Volume2 size={24} />
            {isPlaying ? "Playing..." : "Play"}
          </button>

          {nextHref && (
            <a
              href={nextHref}
              className="bg-green-600 text-white px-6 py-4 rounded-xl shadow-lg hover:bg-green-700 transition flex items-center gap-2"
            >
              <ArrowRight size={30} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
