import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { SearchIcon, Settings2, Minus, Plus, Bold, Type, ArrowRightCircle, ArrowLeftCircle } from 'lucide-react';
import axios from 'axios';

import '../../../css/gurbani.css';

interface SearchPankti {
    id: string;
    gurmukhi: string;
    shabad_id: string;
}

interface ShabadPankti {
    id: string;
    gurmukhi: string;
}

type SearchType = 'first_letters' | 'words';
type Theme = 'light' | 'sepia' | 'dark' | 'paper' | 'soft' | 'sand' | 'slate' | 'blue';

const themes = {
    light: {
        bg: 'bg-white',
        text: 'text-[#1b1b18]',
        card: 'bg-white border-gray-200 border-3',
    },
    sepia: {
        bg: 'bg-[#f9f5eb]',
        text: 'text-[#4a3728]',
        card: 'bg-white border-amber-200 border-5',
    },
    dark: {
        bg: 'bg-[#0a0a0a]',
        text: 'text-[#e5e5e5]',
        card: 'bg-[#111] border-gray-700 border-5',
    },
    paper: {
        bg: 'bg-[#f3eddc]',
        text: 'text-[#2f2a1e]',
        card: 'bg-[#fffaf0] border-[#e6dcc6] border-5',
    },
    soft: {
        bg: 'bg-[#f2f0ea]',
        text: 'text-[#2b2b2b]',
        card: 'bg-[#faf8f3] border-[#d8d2c4] border-5',
    },
    sand: {
        bg: 'bg-[#ffe2a8]',
        text: 'text-[#2f1f0a]',
        card: 'bg-[#fff1d1] border-[#e5c07a] border-5',
    },
    slate: {
        bg: 'bg-[#f6f7f9]',
        text: 'text-[#1f2937]',
        card: 'bg-[#ffffff] border-[#e6e9ee] border-5',
    },
    blue: {
        bg: 'bg-[#cfe6ee]',
        text: 'text-[#1d2b33]',
        card: 'bg-[#eaf6fb] border-[#9fbfcc]',
    }
};

interface ControlsSettings {
    fontSize: number;
    isBold: boolean;
    whiteCards: boolean;
    textAlign: 'left' | 'center';
    lineHeight: number;
    showControls: boolean;
}

const getInitialTheme = (): Theme => {
    if (typeof window === 'undefined') return 'sepia';
    return (localStorage.getItem('theme') as Theme) || 'sepia';
};

const getInitialSettings = (): ControlsSettings => {
    if (typeof window === 'undefined') {
        return {
            fontSize: 62,
            isBold: false,
            whiteCards: false,
            textAlign: 'left',
            lineHeight: 1.9,
            showControls: true,
        };
    }

    const stored = localStorage.getItem('controlsSettings');

    if (stored) return JSON.parse(stored);

    return {
        fontSize: 62,
        isBold: false,
        whiteCards: false,
        textAlign: 'left',
        lineHeight: 1.9,
        showControls: true,
    };
};

export default function Search() {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchType, setSearchType] = useState<SearchType>('first_letters');
    const [searchPanktis, setSearchPanktis] = useState<SearchPankti[]>([]);
    const [shabadPanktis, setShabadPanktis] = useState<ShabadPankti[]>([]);
    const [page, setPage] = useState<'search' | 'shabad'>('search');
    const [controls, setControls] = useState<ControlsSettings>(getInitialSettings);

    const [showSettings, setShowSettings] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [lastActivity, setLastActivity] = useState(Date.now());
    const [prevShabadId, setPrevShabadId] = useState(null);
    const [nextShabadId, setNextShabadId] = useState(null);

    const [theme, setTheme] = useState<Theme>(getInitialTheme);

    const themeStyles = themes[theme];

    // persist theme
    useEffect(() => {
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        localStorage.setItem('controlsSettings', JSON.stringify(controls));
    }, [controls]);

    const toggleSearchType = (type: SearchType) => {
        setSearchType(type);
        handleSearch(searchTerm, type);
    };

    const handleSearch = async (value: string, type: string) => {
        if (value.length < 2) return;

        try {
            const response = await axios.get(
                `/api/gurbani/search?q=${encodeURIComponent(value)}&type=${type}`
            );
            setSearchPanktis(response.data);
        } catch (error) {
            console.error('Search failed:', error);
        }
    };

    const showShabad = async (id: string) => {
        try {
            const response = await axios.get(`/api/gurbani/shabad/${id}`);
            setShabadPanktis(response.data.panktis);
            setPrevShabadId(response.data.prev_shabad_id);
            setNextShabadId(response.data.next_shabad_id);
            setPage('shabad');
        } catch (error) {
            console.error('Search failed:', error);
        }
    };

    const handleChangeSearch = (value: string) => {
        setSearchTerm(value);
        if (value.length <= 2) return;
        handleSearch(value, searchType);
    };

    const increaseFontSize = () => setControls((prev) => ({
        ...prev,
        fontSize: Math.min(prev.fontSize + 2, 150),
    }));;
    const decreaseFontSize = () => setControls((prev) => ({
        ...prev,
        fontSize: Math.max(prev.fontSize - 2, 40),
    }));

    const shabadTextStyle = {
        fontSize: `${controls.fontSize}px`,
        fontWeight: controls.isBold ? 700 : 400,
        lineHeight: controls.lineHeight,
        textAlign: controls.textAlign,
    };

    useEffect(() => {
        if (page !== 'shabad') return;

        let timer: ReturnType<typeof setTimeout>;

        const resetActivity = () => {
            setLastActivity(Date.now());
            setShowControls(true);
        };

        const events = ['mousemove', 'keydown', 'touchstart'];

        const handleActivity = () => resetActivity();

        events.forEach((event) => window.addEventListener(event, handleActivity));

        timer = setInterval(() => {
            const now = Date.now();
            if (now - lastActivity > 4000) {
                setShowControls(false);
            }
        }, 500);

        return () => {
            events.forEach((event) => window.removeEventListener(event, handleActivity));
            clearInterval(timer);
        };
    }, [page, lastActivity]);

    useEffect(() => {
        document.body.classList.toggle('cursor-none', !showControls);
        document.documentElement.classList.toggle('hide-scrollbar', !showControls);
        document.body.classList.toggle('hide-scrollbar', !showControls);
    }, [showControls]);

    return (
        <>
            <Head title="SinghECloud" />

            {/* SEARCH PAGE */}
            {page === 'search' && (
                <div className={`flex min-h-screen flex-col items-start p-6 lg:p-8 ${themeStyles.bg} ${themeStyles.text}`}>
                    <div className="w-full flex">
                        <div className="relative w-full">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => handleChangeSearch(e.target.value ?? '')}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchTerm, searchType)}
                                placeholder="Koj..."
                                className="font-gurbani w-full rounded-full border border-gray-300 bg-[#fdfdfd] py-2 pl-4 pr-48 text-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />

                            <div className="absolute inset-y-0 right-0 flex items-center">
                                <select
                                    value={searchType}
                                    onChange={(e) => toggleSearchType(e.target.value as SearchType)}
                                    className="mr-2 rounded-full border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700"
                                >
                                    <option value="words">By Words</option>
                                    <option value="first_letters">First Letters</option>
                                </select>

                                <button
                                    type="button"
                                    onClick={() => handleSearch(searchTerm, searchType)}
                                    className="flex items-center justify-center px-4 text-gray-500"
                                >
                                    <SearchIcon />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 w-full space-y-4">
                        {searchPanktis.map((searchPankti) => (
                            <div
                                onClick={() => showShabad(searchPankti.shabad_id)}
                                key={searchPankti.id}
                                className="cursor-pointer rounded-2xl border border-amber-200 bg-white p-6 shadow-sm"
                            >
                                <p className="font-gurbani text-3xl text-[#4a3728]">
                                    {searchPankti.gurmukhi
                                        .replaceAll(';', '')
                                        .replaceAll('.', '')
                                        .replaceAll(',', '')}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* SHABAD PAGE */}
            {page === 'shabad' && (
                <div
                    className={`min-h-screen p-6 lg:p-8 ${themeStyles.bg} ${themeStyles.text}`}
                >
                    <div
                        className={`mb-6 flex items-center justify-between transition-all duration-300 ${
                            showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
                        }`}
                    >
                        <button
                            onClick={() => setPage('search')}
                            className="rounded-full border border-amber-300 bg-white px-5 py-2 text-sm font-medium text-black"
                        >
                            Back to Search
                        </button>

                        <div className="relative">
                            {
                                prevShabadId &&
                                <button
                                    className='bg-white rounded-full p-3 mr-4'
                                    onClick={() => showShabad(prevShabadId)}
                                >
                                    <ArrowLeftCircle />
                                </button>
                            }
                            {
                                nextShabadId &&
                                <button
                                    className='bg-white rounded-full p-3 mr-4'
                                    onClick={() => showShabad(nextShabadId)}
                                >
                                    <ArrowRightCircle />
                                </button>
                            }
                            <button
                                onClick={() => setShowSettings(!showSettings)}
                                className="rounded-full border border-amber-300 bg-white p-3 text-black"
                            >
                                <Settings2 className="h-5 w-5" />
                            </button>

                            {showSettings && (
                                <div className="absolute right-0 top-14 z-20 w-80 rounded-2xl border bg-white p-5 shadow-xl text-black">
                                    <h3 className="mb-4 text-lg font-semibold">Display Settings</h3>

                                    {/* FONT WEIGHT */}
                                    <div className="flex items-center justify-between mb-4">
                                        <span>Font Weight</span>
                                        <button
                                            onClick={() => setControls((prev) => ({ ...prev, isBold: !prev.isBold }))}
                                            className="rounded-full bg-gray-100 px-3 py-1"
                                        >
                                            {controls.isBold ? 'Bold' : 'Normal'}
                                        </button>
                                    </div>

                                    {/* FONT SIZE */}
                                    <div className="flex items-center justify-between mb-4">
                                        <span>Font Size</span>

                                        <div className="flex items-center gap-2">
                                            <button onClick={decreaseFontSize} className='bg-gray-200 border rounded-full p-1'>
                                                <Minus />
                                            </button>

                                            <span>{controls.fontSize}px</span>

                                            <button onClick={increaseFontSize} className='bg-gray-200 border rounded-full p-1'>
                                                <Plus />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mb-4">
                                        <span>Alignment</span>

                                        <select
                                            value={controls.textAlign}
                                            onChange={(e) => setControls((prev) => ({ ...prev, textAlign: e.target.value as 'left' | 'center'}))}
                                            className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm"
                                        >
                                            <option value="left">Left</option>
                                            <option value="center">Center</option>
                                        </select>
                                    </div>

                                    <div className="flex items-center justify-between mb-4">
                                        <span>Line Height</span>

                                        <div className="flex items-center gap-2">
                                            <button
                                                className='bg-gray-200 border rounded-full p-1'
                                                onClick={() => setControls((prev) => ({ ...prev, lineHeight: Math.max(1.2, + (prev.lineHeight - 0.1).toFixed(1)) }))}>
                                                <Minus />
                                            </button>

                                            <span>{controls.lineHeight.toFixed(1)}</span>

                                            <button
                                                className='bg-gray-200 border rounded-full p-1'
                                                onClick={() => setControls((prev) => ({ ...prev, lineHeight: prev.lineHeight + 0.1}))}>
                                                <Plus />
                                            </button>
                                        </div>
                                    </div>

                                    {/* THEME SWITCHER */}
                                    <div>
                                        <div className="mb-4 font-medium">Theme</div>

                                        <select
                                            value={theme}
                                            onChange={(e) => setTheme(e.target.value as Theme)}
                                            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm capitalize"
                                        >
                                            {([
                                                'light',
                                                'sepia',
                                                'dark',
                                                'paper',
                                                'soft',
                                                'sand',
                                                'slate',
                                                'blue',
                                            ] as Theme[]).map((t) => (
                                                <option key={t} value={t} className="capitalize">
                                                    {t}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="flex items-center justify-between mb-4">
                                        <span>Pankti Focus</span>

                                        <button
                                            onClick={() => setControls((prev) => ({ ...prev, whiteCards: !prev.whiteCards }))}
                                            className="rounded-full bg-gray-100 px-3 py-1"
                                        >
                                            {controls.whiteCards ? 'On' : 'Off'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* SHABAD CONTENT */}
                    <div className={`w-full ${
                        controls.whiteCards ? '' : `shadow-sm rounded-2xl border p-6 ${themeStyles.card}`
                    }`}>
                        {shabadPanktis.map((shabadPankti) => (
                            <p
                                key={shabadPankti.id}
                                className={
                                    `font-gurbani leading-relaxed ${
                                        controls.whiteCards ? `${themeStyles.card} mt-4 border rounded-2xl p-4` : ''
                                    }`
                                }
                                style={shabadTextStyle}
                            >
                                {shabadPankti.gurmukhi
                                    .replaceAll(';', '')
                                    .replaceAll('.', '')
                                    .replaceAll(',', '')}
                            </p>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
}