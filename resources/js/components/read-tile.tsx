import { forwardRef } from "react";

type ReadTileProps = {
    imgSrc: string;
    url: string;
    alt?: string;
    isSelected?: boolean;
};

export const ReadTile = forwardRef<HTMLAnchorElement, ReadTileProps>(
    ({ imgSrc, url = "", alt = "", isSelected = false }, ref) => {
        return (
            <a
                href={url}
                ref={ref}
                className={`block rounded-xl transition-all mb-12 ${
                    isSelected
                        ? "ring-8 ring-blue-500 scale-105"
                        : "ring-0 scale-100"
                }`}
            >
                <img
                    src={imgSrc}
                    alt={alt}
                    className="w-[400px] h-[300px] border-4 border-yellow-600 rounded-xl shadow-lg shadow-yellow-500/50 object-cover"
                />
            </a>
        );
    }
);

ReadTile.displayName = "ReadTile";