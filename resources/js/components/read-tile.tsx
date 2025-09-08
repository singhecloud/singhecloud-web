type ReadTileProps = {
    imgSrc: string;
    alt?: string;
};

export function ReadTile({ imgSrc, alt = "" }: ReadTileProps) {
    return (
        <a href="/learn/punjabi/reading/alphabets/1">
            <img
                src={imgSrc}
                alt={alt}
                className="w-[400px] h-[300px] border-4 border-yellow-600 rounded-xl shadow-lg shadow-yellow-500/50 m-8"
            />
        </a>
    );
}
