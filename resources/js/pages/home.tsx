import { dashboard, login, register } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Learn Punjabi" />

            <div className="min-h-screen bg-gradient-to-b from-bg-1 via-bg-2 to-bg-3 px-6 py-6 text-foreground lg:px-8">
                <header className="mx-auto mb-8 flex w-full max-w-5xl items-center justify-between">
                    <div>
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 rounded-full border border-border bg-card-bg px-4 py-2 text-sm font-semibold text-foreground shadow-sm backdrop-blur transition hover:bg-card/90 mr-8"
                        >
                            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-accent/10 text-xs font-bold text-accent">
                                ੴ
                            </span>

                            <span className="flex flex-col leading-tight">
                                <span className="text-sm font-semibold tracking-tight">
                                    Gurbani Searcher
                                </span>
                                <span className="text-[10px] font-normal text-muted-foreground">
                                    Search Shabads &amp; Panktis
                                </span>
                            </span>
                        </Link>

                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 rounded-full border border-border bg-card-bg px-4 py-2 text-sm font-semibold text-foreground shadow-sm backdrop-blur transition hover:bg-card/90 mr-8"
                        >
                            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-accent/10 text-xs font-bold text-accent">
                                🎧
                            </span>

                            <span className="flex flex-col leading-tight">
                                <span className="text-sm font-semibold tracking-tight">
                                    Listen Gurbani
                                </span>
                                <span className="text-[10px] font-normal text-muted-foreground">
                                    Stream Gurbani &amp; Kirtan
                                </span>
                            </span>
                        </Link>
                        
                        <Link
                            href="/learn/punjabi"
                            className="inline-flex items-center gap-2 rounded-full border border-border bg-card-bg px-4 py-2 text-sm font-semibold text-foreground shadow-sm backdrop-blur transition hover:bg-card/90"
                        >
                            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-accent/10 text-xs font-bold text-accent">
                                ਪੰ
                            </span>

                            <span className="flex flex-col leading-tight">
                                <span className="text-sm font-semibold tracking-tight">
                                    Punjabi Learner
                                </span>
                                <span className="text-[10px] font-normal text-muted-foreground">
                                    Learn to read, write &amp; speak
                                </span>
                            </span>
                        </Link>
                    </div>

                    <nav className="flex items-center gap-4 text-sm">
                        {auth.user ? (
                            <Link
                                href={dashboard()}
                                className="inline-flex items-center rounded-full border border-border px-4 py-1.5 text-sm font-medium text-foreground shadow-sm backdrop-blur transition hover:bg-card/80"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={login()}
                                    className="inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium text-muted-foreground transition hover:bg-card/80 hover:text-foreground"
                                >
                                    Log in
                                </Link>

                                <Link
                                    href={register()}
                                    className="inline-flex items-center rounded-full border border-border px-4 py-1.5 text-sm font-medium text-foreground shadow-sm backdrop-blur transition hover:bg-card/80"
                                >
                                    Get started
                                </Link>
                            </>
                        )}
                    </nav>
                </header>

                <main className="mx-auto w-full space-y-16 pb-16 pt-20">

                    {/* GURBANI SEARCH SECTION */}
                    <section
                        id="gurbani-search"
                        className="flex flex-col items-center justify-center gap-12 bg-secondary px-8 py-12 lg:flex-row"
                    >
                        {/* LEFT: text + explanation */}
                        <div className="max-w-xl space-y-6 text-center lg:text-left">
                            <div className="space-y-2">
                                <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
                                    Search
                                    <span className="block bg-gradient-to-r from-accent to-accent-soft bg-clip-text text-transparent">
                                        Gurbani instantly
                                    </span>
                                </h2>

                                <p className="mt-4 text-sm text-muted-foreground sm:text-base">
                                    Look up Shabads, lines, or words from Sri Guru Granth Sahib Ji
                                    by typing any part of the Gurbani text. Quickly find references
                                    for learning, kirtan prep, or personal study.
                                </p>
                            </div>

                            <div className="mt-6 text-xs text-muted-foreground sm:text-sm">
                                <p>Search by:</p>
                                <ul className="mt-1 list-inside list-disc space-y-1">
                                    <li>Full or partial Gurbani line</li>
                                    <li>Individual words or combinations</li>
                                    <li>Gurmukhi script (recommended)</li>
                                </ul>
                            </div>
                        </div>

                        {/* RIGHT: Gurbani search card */}
                        <div className="mt-4 w-full max-w-md lg:mt-0">
                            <div className="relative overflow-hidden rounded-2xl border border-border bg-card-bg p-5 shadow-[0_18px_60px_-35px_rgba(0,0,0,0.5)] backdrop-blur">
                                <div className="mb-4 flex items-center justify-between text-xs text-muted-foreground">
                                    <span className="inline-flex items-center gap-2">
                                        <span className="inline-flex h-2 w-2 rounded-full bg-accent" />
                                        Gurbani search
                                    </span>
                                    <span>Type &amp; search</span>
                                </div>

                                <div className="space-y-4 text-sm">
                                    {/* Input + button */}
                                    <div className="space-y-2">
                                        <label
                                            htmlFor="gurbani-query"
                                            className="text-xs font-medium text-foreground"
                                        >
                                            Enter Gurbani text
                                        </label>

                                        <div className="flex flex-col gap-3 sm:flex-row">
                                            <input
                                                id="gurbani-query"
                                                type="text"
                                                placeholder="e.g. ਸਤਿ ਨਾਮੁ ਕਰਤਾ ਪੁਰਖੁ"
                                                className="w-full rounded-lg border border-border bg-card-bg/60 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                                            />

                                            <button
                                                type="button"
                                                className="inline-flex items-center justify-center rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground shadow-sm transition hover:bg-accent-soft"
                                            >
                                                Search
                                            </button>
                                        </div>
                                    </div>

                                    {/* Helper text / example */}
                                    <div className="rounded-lg border border-dashed border-border p-3 text-xs text-muted-foreground">
                                        <p className="font-medium text-foreground">
                                            Quick examples:
                                        </p>
                                        <p className="mt-1">
                                            • &quot;ik oankar satnam&quot;  
                                            • &quot;jo mangeh thakur apne te&quot;
                                        </p>
                                        <p className="mt-2">
                                            Results will show matching lines and sources.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section
                        id="listen-kirtan"
                        className="flex flex-col items-center justify-center gap-12 bg-secondary px-8 py-12 lg:flex-row"
                    >
                        {/* LEFT */}
                        <div className="max-w-xl space-y-6 text-center lg:text-left">
                            <h2 className="text-balance text-3xl font-semibold sm:text-4xl">
                                Listen to
                                <span className="block bg-gradient-to-r from-accent to-accent-soft bg-clip-text text-transparent">
                                    Kirtan anytime
                                </span>
                            </h2>

                            <p className="text-sm text-muted-foreground sm:text-base">
                                Stream live Kirtan or explore recordings from Harmandir Sahib,
                                Katha, Simran, and more.
                            </p>

                            <p className="text-xs text-muted-foreground sm:text-sm">
                                Enjoy immersive Gurbani audio anywhere, anytime.
                            </p>
                        </div>

                        {/* RIGHT (Audio Player Preview Card) */}
                        <div className="w-full max-w-md">
                            <div className="rounded-2xl border border-border bg-card-bg p-5 shadow-[0_18px_60px_-35px_rgba(0,0,0,0.5)] backdrop-blur">
                                <div className="mb-4 flex items-center justify-between text-xs text-muted-foreground">
                                    <span className="inline-flex items-center gap-2">
                                        <span className="inline-flex h-2 w-2 rounded-full bg-accent" />
                                        Live Kirtan
                                    </span>
                                    <span>Stream or explore</span>
                                </div>

                                {/* Simple placeholder card */}
                                <div className="space-y-4 text-sm">
                                    <div className="rounded-xl bg-accent/10 p-3">
                                        <p className="text-xs font-medium uppercase tracking-widest text-accent">
                                            Currently Playing
                                        </p>

                                        <p className="mt-2 text-lg font-semibold text-foreground">
                                            Harmandir Sahib — Asa Di Vaar
                                        </p>

                                        <p className="text-xs text-muted-foreground mt-1">
                                            Live broadcast · Sri Amritsar Sahib
                                        </p>
                                    </div>

                                    <button className="w-full rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground shadow-sm transition hover:bg-accent-soft">
                                        Listen Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>
                    
                    <section
                        id="learn-punjabi"
                        className="flex flex-col items-center justify-center gap-12 bg-secondary px-8 py-12 lg:flex-row"
                    >
                        <div className="max-w-xl space-y-6 text-center lg:text-left">
                            <div className="space-y-2">
                                <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
                                    Learn Punjabi with
                                    <span className="block bg-gradient-to-r from-accent to-accent-soft bg-clip-text text-transparent">
                                        interactive lessons
                                    </span>
                                </h1>

                                <p className="mt-6 text-balance text-sm text-muted-foreground sm:text-base">
                                    Master Gurmukhi script, common phrases, and real-world
                                    conversation with short lessons you can complete in minutes
                                    a day.
                                </p>
                            </div>

                            <div className="mt-8 flex flex-col items-center gap-6 sm:flex-row sm:justify-start">
                                <Link
                                    href="/learn/punjabi"
                                    className="inline-flex w-full items-center justify-center rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground shadow-md transition hover:-translate-y-0.5 hover:bg-accent-soft sm:w-auto"
                                >
                                    Start learning Punjabi
                                </Link>

                                <div className="flex flex-col text-xs text-muted-foreground sm:text-sm">
                                    <span>No credit card required.</span>
                                    <span>Just your curiosity ✨</span>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: lesson preview card */}
                        <div className="mt-4 w-full max-w-md lg:mt-0">
                            <div className="relative overflow-hidden rounded-2xl border border-border bg-card-bg p-5 shadow-[0_18px_60px_-35px_rgba(0,0,0,0.5)] backdrop-blur">
                                <div className="mb-4 flex items-center justify-between text-xs text-muted-foreground">
                                    <span className="inline-flex items-center gap-2">
                                        <span className="inline-flex h-2 w-2 rounded-full bg-accent" />
                                        Today&apos;s lesson
                                    </span>
                                    <span>3-5 min</span>
                                </div>

                                <div className="space-y-4 text-sm">
                                    <div className="rounded-xl bg-accent/10 p-3 text-left">
                                        <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent">
                                            Phrase
                                        </p>
                                        <p className="mt-2 text-2xl font-semibold text-foreground">
                                            ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Sat Sri Akaal · A respectful greeting
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 text-xs">
                                        <div className="rounded-lg border border-dashed border-border p-3">
                                            <p className="font-medium text-foreground">Listening</p>
                                            <p className="mt-1 text-muted-foreground">
                                                Hear native pronunciation and repeat.
                                            </p>
                                        </div>

                                        <div className="rounded-lg border border-dashed border-border p-3">
                                            <p className="font-medium text-foreground">Practice</p>
                                            <p className="mt-1 text-muted-foreground">
                                                Match words with English meanings.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </>
    );
}
