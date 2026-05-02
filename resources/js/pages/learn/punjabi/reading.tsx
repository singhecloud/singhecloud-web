import { useEffect, useRef, useState } from 'react';
import { ReadTile } from '@/components/read-tile';

import alphabetsImg from "../../../../images/alphabets.png";
import vowelsImg from "../../../../images/vowels.png";
import weeksImg from "../../../../images/weeks.png";
import monthsImg from "../../../../images/months.png";

const tiles = [
    { imgSrc: alphabetsImg, alt: "Punjabi Alphabets", url: "/learn/punjabi/reading/alphabets" },
    { imgSrc: vowelsImg, alt: "Punjabi Vowels", url: "/learn/punjabi/reading/vowels" },
    { imgSrc: weeksImg, alt: "Punjabi Weeks", url: "/learn/punjabi/reading/weeks" },
    { imgSrc: monthsImg, alt: "Punjabi Months", url: "/learn/punjabi/reading/months" },
];

export default function Home() {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const tileRefs = useRef<(HTMLAnchorElement | null)[]>([]);

    const isTV =
        /TV|SMART-TV|Tizen|Web0S|WebOS|AFT|BRAVIA/i.test(navigator.userAgent) ||
        (matchMedia("(pointer: coarse)").matches &&
        matchMedia("(hover: none)").matches);

    useEffect(() => {
        let lastX: number | null = null;
        let lastMoveTime = 0;

        function handlePointerMove(e: PointerEvent) {
            if (!isTV) return;

            const now = Date.now();

            // prevent moving too fast
            if (now - lastMoveTime < 300) return;

            if (lastX === null) {
                lastX = e.clientX;
                return;
            }

            const diffX = e.clientX - lastX;

            // ignore tiny movement
            if (Math.abs(diffX) < 80) return;

            setSelectedIndex((current) => {
                let next = current;

                if (diffX > 0) {
                    // mouse moved right
                    next = Math.min(current + 1, tiles.length - 1);
                } else {
                    // mouse moved left
                    next = Math.max(current - 1, 0);
                }

                tileRefs.current[next]?.focus();
                return next;
            });

            lastX = e.clientX;
            lastMoveTime = now;
        }

        window.addEventListener("pointermove", handlePointerMove);

        return () => {
            window.removeEventListener("pointermove", handlePointerMove);
        };
    }, [isTV]);

    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            setSelectedIndex((current) => {
                let next = current;

                if (e.key === "ArrowRight") next = Math.min(current + 1, tiles.length - 1);
                if (e.key === "ArrowLeft") next = Math.max(current - 1, 0);
                if (e.key === "ArrowDown") next = Math.min(current + 2, tiles.length - 1);
                if (e.key === "ArrowUp") next = Math.max(current - 2, 0);

                if (e.key === "Enter") {
                    tileRefs.current[current]?.click();
                }

                return next;
            });
        }

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    return (
        <div className="p-4 bg-orange-100 grid grid-cols-1 sm:grid-cols-2 gap-4 justify-items-center">
            {tiles.map((tile, index) => (
                <ReadTile
                    key={index}
                    ref={(el) => {
                        tileRefs.current[index] = el;
                    }}
                    imgSrc={tile.imgSrc}
                    alt={tile.alt}
                    url={tile.url}
                    isSelected={selectedIndex === index}
                />
            ))}
        </div>
    );
}