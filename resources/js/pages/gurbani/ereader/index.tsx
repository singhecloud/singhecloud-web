import { dashboard, login, register } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Welcome() {
    return (
        <>
            <Head title="SinghECloud"></Head>
            <div className="flex min-h-screen flex-col items-center bg-[#FDFDFC] p-6 text-[#1b1b18] lg:justify-center lg:p-8 dark:bg-[#0a0a0a]">
                <div className="flex-1 w-full items-center justify-center">
                    <a className='flex' href='/gurbani/ereader/download/shabads'>
                        Shabads
                    </a>
                </div>
            </div>
        </>
    );
}
