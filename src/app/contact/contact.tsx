// File 1: /src/app/contact/contact.tsx

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function Contact() {
    return (
        <div className="flex h-full w-full items-center bg-stone-800 p-4">
            <div className="flex h-full max-h-full w-full flex-col items-center justify-center space-y-2 overflow-y-scroll">
                <Image
                    src="/bio/bio_pic_updated_small.jpg"
                    alt="Jill Weeks Smith"
                    width={300}
                    height={400}
                    quality={100}
                    className="h-[calc(45dvh-50px)] w-auto rounded-lg shadow-lg md:h-[calc(55dvh-50px)] lg:h-[calc(55dvh-50px)]"
                />
                <Link href="mailto:jwsfineart@gmail.com" className="pt-2 text-lg text-blue-500 hover:text-blue-700">
                    jwsfineart@gmail.com
                </Link>
                <Link href="https://www.instagram.com/jws_fineart/" target="_blank" rel="noreferrer" prefetch={false}>
                    <div className="group flex flex-row items-center justify-center space-x-2 rounded-lg p-2 hover:bg-stone-300">
                        <Image
                            className={'h-[30px] w-[30px] rounded-t-md'}
                            src="/icon/instagram_icon_50.png"
                            alt="Instagram Link"
                            width={40}
                            height={40}
                        />
                        <span className="text-md text-center text-lg text-stone-300 group-hover:text-primary">Instagram</span>
                    </div>
                </Link>
            </div>
        </div>
    );
}
