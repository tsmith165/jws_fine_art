import React from 'react';
import Image from 'next/image';
// import ContactForm from './contact_form';

export default function Contact() {
    return (
        <div className="flex h-full w-full items-center p-4 first-line:justify-center">
            <div className="relative flex h-full max-h-full w-full flex-col overflow-y-scroll ">
                <Image
                    src="/bio/bio_pic_updated_small.jpg"
                    alt="Jill Weeks Smith"
                    width={300}
                    height={400}
                    quality={100}
                    className="absolute left-0 right-0 m-auto h-[calc(45dvh-50px)] w-auto rounded-lg shadow-lg md:h-[calc(55dvh-50px)] lg:h-[calc(55dvh-50px)]"
                />
                <div className="absolute top-[calc(40dvh-50px)] flex h-fit w-full flex-col items-center justify-center space-y-2 rounded-lg bg-secondary_light p-4 text-white shadow-lg md:top-[calc(50dvh-50px)] lg:top-[calc(50dvh-50px)]">
                    <h1 className="w-fit bg-gradient-to-r from-secondary_dark via-primary_dark to-secondary_dark bg-clip-text text-center text-2xl font-bold text-transparent">
                        Get in Touch with Jill
                    </h1>
                    <div className="mt-4 ">
                        <p className="text-md text-secondary_dark">jwsfineart@gmail.com</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
