import { useEffect } from "react";
import { Akhar } from "@/components/akhar";

const images = import.meta.glob("../../../../images/alphabets/*.webp", { eager: true });
const sounds = import.meta.glob("../../../../sounds/*.mp3", { eager: true });

function getAsset(obj: Record<string, any>, serial: number) {
  const entry = Object.entries(obj).find(([path]) => path.includes(`/${serial}.`));
  return entry ? (entry[1] as any).default : null;
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

export default function Alphabets({ serial }: { serial: number }) {
  const img = getAsset(images, serial);
  const sound = getAsset(sounds, serial);

  const prevSerial = serial - 1;
  const nextSerial = serial + 1;

  useEffect(() => {
    // Preload next image/sound
    preloadImage(getAsset(images, nextSerial));
    preloadAudio(getAsset(sounds, nextSerial));

    // Preload previous image/sound
    if (prevSerial >= 1) {
      preloadImage(getAsset(images, prevSerial));
      preloadAudio(getAsset(sounds, prevSerial));
    }
  }, [serial]);

  if (!img || !sound) {
    return <div className="p-8">Alphabet {serial} not found.</div>;
  }

  const backHref =
    serial > 1 ? `/learn/punjabi/reading/alphabets/${serial - 1}` : null;

  const nextHref = `/learn/punjabi/reading/alphabets/${serial + 1}`;

  return (
    <Akhar
      imgSrc={img}
      alt={`Punjabi Alphabet ${serial}`}
      soundSrc={sound}
      nextHref={nextHref}
      backHref={backHref}
    />
  );
}