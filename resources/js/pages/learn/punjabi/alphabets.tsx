import { useEffect, useState } from "react";
import { Akhar } from "@/components/akhar";
import { router } from "@inertiajs/react";

const images = import.meta.glob("../../../../images/alphabets/*.webp");
const sounds = import.meta.glob("../../../../sounds/*.mp3");

async function getAsset(obj: Record<string, any>, serial: number) {
  const entry = Object.entries(obj).find(([path]) =>
    path.includes(`/${serial}.`)
  );

  if (!entry) return null;

  const mod = await entry[1]();
  return (mod as any).default;
}

function preloadImage(src: string | null) {
  if (!src) return;
  const img = new Image();
  img.src = src;
}

function preloadAudio(src: string | null) {
  if (!src) return;
  const audio = new Audio();
  audio.preload = "auto";
  audio.src = src;
  audio.load();
}

export default function Alphabets() {
  const [currentSerial, setCurrentSerial] = useState(1);
  const [img, setImg] = useState<string | null>(null);
  const [sound, setSound] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const goNext = () => {
    setCurrentSerial((prev) => prev + 1);
  };

  useEffect(() => {
    let cancelled = false;

    async function loadAssets() {
      setLoading(true);

      const [loadedImg, loadedSound] = await Promise.all([
        getAsset(images, currentSerial),
        getAsset(sounds, currentSerial),
      ]);

      if (cancelled) return;

      setImg(loadedImg);
      setSound(loadedSound);
      setLoading(false);

      for (let i = 1; i <= 3; i++) {
        const nextSerial = currentSerial + i;

        getAsset(images, nextSerial).then(preloadImage);
        getAsset(sounds, nextSerial).then(preloadAudio);
      }

      // Optional: keep previous preload
      const prevSerial = currentSerial - 1;

      if (prevSerial >= 1) {
        getAsset(images, prevSerial).then(preloadImage);
        getAsset(sounds, prevSerial).then(preloadAudio);
      }
    }

    loadAssets();

    return () => {
      cancelled = true;
    };
  }, [currentSerial]);

  if (loading) {
    return <div className="p-8">Loading alphabet {currentSerial}...</div>;
  }

  if (!img || !sound) {
    return <div className="p-8">Alphabet {currentSerial} not found.</div>;
  }

  return (
    <Akhar
      imgSrc={img}
      alt={`Punjabi Alphabet ${currentSerial}`}
      soundSrc={sound}
      onNext={goNext}
      currentSerial={currentSerial}
      onComplete={() => router.visit("/learn/punjabi/reading")}
    />
  );
}