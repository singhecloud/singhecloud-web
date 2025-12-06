import { Head } from '@inertiajs/react';

export default function Home() {
    return (
        <>
            <Head title="SinghECloud | Learn Punjabi" />

            {/* Softer, cleaner background */}
            <div className="min-h-screen bg-gradient-to-b from-white to-emerald-50">

                <div className="mx-auto max-w-6xl px-4 pt-10 pb-6">

                    {/* Header with spacing so no scroll */}
                    <header className="mb-10">
                        <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600">
                            SinghECloud
                        </p>
                        <h1 className="mt-2 text-4xl font-extrabold text-slate-800">
                            Learn Punjabi
                        </h1>
                        <p className="mt-2 text-slate-600 text-base max-w-xl">
                            Choose a learning super-power and begin your Punjabi adventure!
                        </p>
                    </header>

                    {/* GRID — 2×2 layout, each tile = 1/2 screen height */}
                    <nav className="grid grid-cols-1 sm:grid-cols-2 gap-6"
                         style={{ height: "calc(100vh - 220px)" }}>

                        {/* TILE TEMPLATE STYLE */}
                        {[
                            {
                                title: "Reading",
                                color: "from-emerald-400 to-emerald-500",
                                link: "/learn/punjabi/reading",
                                icon: (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor"
                                        viewBox="0 0 24 24" className="h-12 w-12">
                                        <path d="M11.25 4.533A9.707 9.707 0 0 0 6 3a9.735 9.735 0 0 0-3.25.555.75.75 0 0 0-.5.707v14.25a.75.75 0 0 0 1 .707A8.237 8.237 0 0 1 6 18.75c1.995 0 3.823.707 5.25 1.886V4.533ZM12.75 20.636A8.214 8.214 0 0 1 18 18.75c.966 0 1.89.166 2.75.47a.75.75 0 0 0 1-.708V4.262a.75.75 0 0 0-.5-.707A9.735 9.735 0 0 0 18 3a9.707 9.707 0 0 0-5.25 1.533v16.103Z" />
                                    </svg>
                                ),
                                desc: "Read fun Punjabi words and stories made for kids!"
                            },
                            {
                                title: "Writing",
                                color: "from-orange-400 to-orange-500",
                                link: "/learn/punjabi/writing",
                                icon: (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor"
                                        viewBox="0 0 24 24" className="h-12 w-12">
                                        <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32l8.4-8.4Z" />
                                    </svg>
                                ),
                                desc: "Trace and write Punjabi letters step by step!"
                            },
                            {
                                title: "Listening",
                                color: "from-cyan-400 to-cyan-500",
                                link: "/learn/punjabi/listening",
                                icon: (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor"
                                        viewBox="0 0 24 24" className="h-12 w-12">
                                        <path d="M19.952 1.651a.75.75 0 0 1 .298.599V16.303a3 3 0 0 1-2.176 2.884l-1.32.377a2.553 2.553 0 1 1-1.403-4.909l2.311-.66a1.5 1.5 0 0 0 1.088-1.442V6.994l-9 2.572v9.737a3 3 0 0 1-2.176 2.884l-1.32.377a2.553 2.553 0 1 1-1.402-4.909l2.31-.66a1.5 1.5 0 0 0 1.088-1.442V5.25a.75.75 0 0 1 .544-.721l10.5-3a.75.75 0 0 1 .658.122Z" />
                                    </svg>
                                ),
                                desc: "Listen to Punjabi songs, sounds and stories!"
                            },
                            {
                                title: "Speaking",
                                color: "from-rose-400 to-rose-500",
                                link: "/learn/punjabi/speaking",
                                icon: (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor"
                                        viewBox="0 0 24 24" className="h-12 w-12">
                                        <path d="M8.25 4.5a3.75 3.75 0 1 1 7.5 0v8.25a3.75 3.75 0 1 1-7.5 0V4.5Z" />
                                        <path d="M6 10.5a.75.75 0 0 1 .75.75v1.5a5.25 5.25 0 1 0 10.5 0v-1.5a.75.75 0 0 1 1.5 0v1.5a6.751 6.751 0 0 1-6 6.709v2.291h3a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1 0-1.5h3v-2.291a6.751 6.751 0 0 1-6-6.709v-1.5A.75.75 0 0 1 6 10.5Z" />
                                    </svg>
                                ),
                                desc: "Speak Punjabi words like a superhero!"
                            }
                        ].map((tile, i) => (
                            <a key={i} href={tile.link}
                                className={`group rounded-3xl p-6 text-white shadow-lg bg-gradient-to-br ${tile.color}
                                           flex flex-col justify-center items-center text-center transition 
                                           hover:scale-[1.03] hover:shadow-2xl`}
                            >
                                <div className="mb-3">{tile.icon}</div>
                                <h2 className="text-2xl font-bold">{tile.title}</h2>
                                <p className="text-md mt-2 opacity-90">{tile.desc}</p>
                            </a>
                        ))}

                    </nav>
                </div>
            </div>
        </>
    );
}
