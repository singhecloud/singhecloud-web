// resources/js/Pages/gurbani/ereader/display.tsx

import { Head, router } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import './../../../../css/font.css';

type Pankti = {
  id: number;
  type_id: number;
  gurmukhi: string;
};

function getIdFromPath() {
  if (typeof window === 'undefined') return 1;
  const parts = window.location.pathname.split('/').filter(Boolean);
  const last = parts[parts.length - 1];
  const n = parseInt(last, 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

function goTo(id: number) {
  const safe = Math.max(1, Math.floor(id));
  router.visit(`/gurbani/ereader/download/shabads/${safe}`);
}

const endsWithBracketNumber = (s: string) => /(?:\]\d+\])+$/u.test(s.trim());
const cleanText = (s: string) =>
  s.replaceAll(';', '').replaceAll('.', '').replaceAll(',', '').trim();

/** Group consecutive panktis; end a group when break condition is met */
function groupPanktis(panktis: Pankti[]) {
  const groups: { key: string; text: string }[] = [];
  let buffer: string[] = [];
  let keyParts: number[] = [];

  const flush = () => {
    if (!buffer.length) return;
    groups.push({
      key: keyParts.join('-') || Math.random().toString(36).slice(2),
      text: buffer.join(' '),
    });
    buffer = [];
    keyParts = [];
  };

  for (const p of panktis) {
    const t = cleanText(p.gurmukhi);
    if (!t) continue;

    buffer.push(t);
    keyParts.push(p.id);

    const needsBreak = p.type_id === 1 || p.type_id === 2 || endsWithBracketNumber(t);
    if (needsBreak) flush();
  }
  flush();
  return groups;
}

export default function Display({ panktis }: { panktis: Pankti[] }) {
  const groups = useMemo(() => groupPanktis(panktis), [panktis]);

  // ======== Fit-to-screen scaling (no manual resize) ========
  const BASE_FONT_PX = 28;              // authoring size; we scale this
  const containerRef = useRef<HTMLDivElement | null>(null);
  const contentRef   = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);

  const recalcScale = () => {
    const container = containerRef.current;
    const content   = contentRef.current;
    if (!container || !content) return;

    // Reset scale to measure natural size at base font
    content.style.transform = 'scale(1)';
    content.style.transformOrigin = 'top center';

    // Use client sizes (exclude scrollbars)
    const cw = container.clientWidth;
    const ch = container.clientHeight;

    const rect = content.getBoundingClientRect();
    const tw = rect.width;
    const th = rect.height;

    if (tw === 0 || th === 0) {
      setScale(1);
      return;
    }

    // Padding/margins headroom (prevent touching edges)
    const PAD_W = 24; // px
    const PAD_H = 24; // px

    const sx = (cw - PAD_W) / tw;
    const sy = (ch - PAD_H) / th;
    const s  = Math.max(0.1, Math.min(sx, sy)); // clamp a bit

    setScale(s);
  };

  // Recalculate on mount, when groups change, and on resize
  useEffect(() => {
    recalcScale();
    const onResize = () => recalcScale();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groups]);

  // Keyboard navigation only
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const id = getIdFromPath();
      if (e.key === 'ArrowRight') goTo(id + 1);
      if (e.key === 'ArrowLeft')  goTo(id - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Click/tap left/right half to navigate
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const id = getIdFromPath();
    const middle = window.innerWidth / 2;
    if (e.clientX < middle) goTo(id - 1);
    else goTo(id + 1);
  };

  return (
    <>
      <Head title="SinghECloud" />
      <div
        ref={containerRef}
        className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-0 text-black lg:p-0 dark:bg-[#0a0a0a] relative overflow-hidden"
        onClick={handleClick}
      >
        {/* Content is measured at base font size, then scaled to fit */}
        <div
          ref={contentRef}
          className="w-auto max-w-none shabad-text leading-relaxed text-center"
          style={{
            fontFamily: 'GurbaniWebThick',
            fontSize: `${BASE_FONT_PX}px`,
            display: 'inline-block',
            transform: `scale(${scale})`,
            transformOrigin: 'top center',
            // Prevent wrapping-induced jitter: keep a comfortable line-height
            lineHeight: 1.5,
          }}
        >
          {groups.map((g) => (
            <div key={g.key} className="mb-3">
              {g.text}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
