'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import logger from '@/lib/logger';
import styles from '@/styles/pages/Biography.module.scss';

import PROJECT_CONSTANTS from '@/lib/constants';
import { biographyText } from '@/lib/biographyText';

const { AWS_BUCKET_URL, CONTACT_FULL_NAME, CONTACT_EMAIL } = PROJECT_CONSTANTS;

function BiographyPage() {
    const page_name = 'Biography';

    useEffect(() => {
        console.log(`Loading ${page_name} Page`);
    }, [page_name]);

    return (
        <div className={'h-full w-full overflow-y-auto overflow-x-hidden px-2.5 py-0'}>
            <div className={'jusify-center mt-4 flex w-full'}>
                <div className={'relative !h-[267px] !w-max rounded-md bg-tertiary'}>
                    <Image
                        className={'p-1'}
                        width={200}
                        height={267}
                        quality={100}
                        priority
                        src={`${AWS_BUCKET_URL}/site/bio_pic_small.jpg`}
                        alt="Bio Pic"
                    />
                </div>
            </div>
            <div className={'mt-4 w-full'}>
                <b className={'font-lato block text-center text-xl font-bold text-dark'}>Jill Weeks Smith</b>
            </div>
            <div className={'flex w-full justify-center'}>
                <div className={'mb-5 p-4 text-center text-lg text-dark'}>
                    {biographyText.map((paragraph, index) => (
                        <p key={index} className={'mb-5 p-4 text-center text-lg text-dark'}>
                            {paragraph}
                        </p>
                    ))}
                </div>
            </div>
            <div className={'mb-4'}>
                <div className={'flex w-full justify-center'}>
                    <b className={`font-lg p-1 text-center text-dark`}>{CONTACT_FULL_NAME}</b>
                </div>
                <div className={'flex w-full justify-center'}>
                    <a className={'font-xl p-1 text-center text-blue-600 underline '} href={`mailto:${CONTACT_EMAIL}`}>
                        {CONTACT_EMAIL}
                    </a>
                </div>
            </div>
        </div>
    );
}

export default BiographyPage;
