import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { type ReactNode } from 'react';

interface AppLayoutProps {
    children: ReactNode;
}

export default ({ children, ...props }: AppLayoutProps) => (
    <>
            <Head title="SinghECloud | Learn Punjabi">

            </Head>
            <div className='flex bg-gray-50 w-full h-full flex-row'>
                <div className='absolute w-full bg-blue-500 dark:hidden min-h-75'></div>
                <div className='fixed w-60 h-full flex-col bg-white p-4 rounded-lg mx-8 m-4 shadow-xl'>
                    <h1 className='ml-1 font-semibold text-slate-700 h-10'>Learn Punjabi</h1>
                    <hr />
                    <ul className='flex flex-col pl-0 mb-0'>
                        <li className='w-full'>
                            <a href='/learn/punjabi/reading' className='text-lg mt-4 mx-2 flex flex-row items-center'>
                                <span className='text-emerald-500'>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                                        <path d="M11.25 4.533A9.707 9.707 0 0 0 6 3a9.735 9.735 0 0 0-3.25.555.75.75 0 0 0-.5.707v14.25a.75.75 0 0 0 1 .707A8.237 8.237 0 0 1 6 18.75c1.995 0 3.823.707 5.25 1.886V4.533ZM12.75 20.636A8.214 8.214 0 0 1 18 18.75c.966 0 1.89.166 2.75.47a.75.75 0 0 0 1-.708V4.262a.75.75 0 0 0-.5-.707A9.735 9.735 0 0 0 18 3a9.707 9.707 0 0 0-5.25 1.533v16.103Z" />
                                    </svg>
                                </span>
                                <span className='ml-2'>Reading</span>
                            </a>
                        </li>
                        <li className='w-full'>
                            <a href='/learn/punjabi/writing' className='text-lg mt-4 mx-2 flex flex-row items-center'>
                                <span className='text-orange-500'>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                                <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32l8.4-8.4Z" />
                                <path d="M5.25 5.25a3 3 0 0 0-3 3v10.5a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3V13.5a.75.75 0 0 0-1.5 0v5.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5V8.25a1.5 1.5 0 0 1 1.5-1.5h5.25a.75.75 0 0 0 0-1.5H5.25Z" />
                            </svg>
                                </span>
                                <span className='ml-2'>Writing</span>
                            </a>
                        </li>

                        <li className='w-full'>
                            <a href='/learn/punjabi/listening' className='text-lg mt-4 mx-2 flex flex-row items-center'>
                                <span className='text-cyan-500'>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                                <path fillRule="evenodd" d="M19.952 1.651a.75.75 0 0 1 .298.599V16.303a3 3 0 0 1-2.176 2.884l-1.32.377a2.553 2.553 0 1 1-1.403-4.909l2.311-.66a1.5 1.5 0 0 0 1.088-1.442V6.994l-9 2.572v9.737a3 3 0 0 1-2.176 2.884l-1.32.377a2.553 2.553 0 1 1-1.402-4.909l2.31-.66a1.5 1.5 0 0 0 1.088-1.442V5.25a.75.75 0 0 1 .544-.721l10.5-3a.75.75 0 0 1 .658.122Z" clipRule="evenodd" />
                            </svg>
                                </span>
                                <span className='ml-2'>Listening</span>
                            </a>
                        </li>

                        <li className='w-full'>
                            <a href='/learn/punjabi/speaking' className='text-lg mt-4 mx-2 flex flex-row items-center'>
                                <span className='text-red-500'>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                                <path d="M8.25 4.5a3.75 3.75 0 1 1 7.5 0v8.25a3.75 3.75 0 1 1-7.5 0V4.5Z" />
                                <path d="M6 10.5a.75.75 0 0 1 .75.75v1.5a5.25 5.25 0 1 0 10.5 0v-1.5a.75.75 0 0 1 1.5 0v1.5a6.751 6.751 0 0 1-6 6.709v2.291h3a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1 0-1.5h3v-2.291a6.751 6.751 0 0 1-6-6.709v-1.5A.75.75 0 0 1 6 10.5Z" />
                            </svg>
                                </span>
                                <span className='ml-2'>Speaking</span>
                            </a>
                        </li>
                    </ul>

                </div>
                <div className='relative ml-72 mr-4 p-4 w-full bg-white my-4 rounded-lg'>
                    {children}
                </div>
            </div>
        </>
);
