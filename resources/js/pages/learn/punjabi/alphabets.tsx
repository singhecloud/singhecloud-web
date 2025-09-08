import { Akhar } from "@/components/akhar";

// Import all images and sounds dynamically
const images = import.meta.glob("../../../../images/alphabets/*.png", { eager: true });
const sounds = import.meta.glob("../../../../sounds/*.mp3", { eager: true });

// Helper: normalize keys into numbers
function getAsset(obj: Record<string, any>, serial: number) {
  const entry = Object.entries(obj).find(([path]) => path.includes(`/${serial}.`));
  return entry ? (entry[1] as any).default : null;
}

export default function Alphabets({ serial }: { serial: number }) {
  const img = getAsset(images, serial);
  const sound = getAsset(sounds, serial);

  if (!img || !sound) {
    return <div className="p-8">Alphabet {serial} not found.</div>;
  }

  // Previous & next links
  const backHref = serial > 1 ? `/learn/punjabi/reading/alphabets/${serial - 1}` : null;
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
