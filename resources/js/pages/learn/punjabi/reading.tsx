import { ReadTile } from '@/components/read-tile';

import alphabetsImg from "../../../../images/alphabets.png";
import vowelsImg from "../../../../images/vowels.png";
import weeksImg from "../../../../images/weeks.png";
import monthsImg from "../../../../images/months.png";

export default function Home() {
    return (
        <div className="p-4 bg-orange-100 grid grid-cols-1 sm:grid-cols-2 gap-4 justify-items-center">
            <ReadTile imgSrc={alphabetsImg} alt="Punjabi Alphabets" />
            <ReadTile imgSrc={vowelsImg} alt="Punjabi Alphabets" />
            <ReadTile imgSrc={weeksImg} alt="Punjabi Alphabets" />
            <ReadTile imgSrc={monthsImg} alt="Punjabi Alphabets" />
        </div>
    );
}
