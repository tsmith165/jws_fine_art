'use client'

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

import logger from '@/lib/logger';
import PROJECT_CONSTANTS from '@/lib/constants';
import styles from '@/styles/pages/Socials.module.scss';

const BLACK_AND_WHITE_QR_CODE = '/JWS_QR_CODE_WHITE_BLACK.png';
const COLORED_QR_CODE = '/JWS_QR_CODE_GREEN_TAN.png';

function Socials() {
    const [state, setState] = useState({
        window_width: null,
        window_height: null,
        current_qr_code: COLORED_QR_CODE,
    });

    useEffect(() => {
        const handleResize = () => {
            console.log(`Window Width: ${window.innerWidth} | Height: ${window.innerHeight}`);
            setState((prevState) => ({
                ...prevState,
                window_width: window.innerWidth,
                window_height: window.innerHeight,
            }));
        };

        // Add event listener
        window.addEventListener('resize', handleResize);

        // Call handler right away so state gets updated with initial window size
        handleResize();

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const handleClickQRCode = () => {
        setState((prevState) => ({
            ...prevState,
            current_qr_code:
                prevState.current_qr_code === BLACK_AND_WHITE_QR_CODE
                    ? COLORED_QR_CODE
                    : BLACK_AND_WHITE_QR_CODE,
        }));
    };

    const artist_name_div = <div className={'text-2xl text-primary font-bold p-2.5'}>Jill Weeks Smith</div>;
    const website_div = <div className={styles.website}>jwsfineart.com</div>;
    const bio_image_div = (
        <div className={`w-[150px] h-[200px] md:w-[225px] md:h-[300px] flex justify-center items-center bg-tertiary rounded-md`}>
            <Image
                className={`h-full bg-dark p-2 rounded-md`}
                src={`${PROJECT_CONSTANTS.AWS_BUCKET_URL}/site/bio_pic.jpg`}
                alt="Bio Pic"
                quality={100}
                width={500}
                height={667}
            />
        </div>
    );
    const qr_code_div = (
        <div className={''} onClick={handleClickQRCode}>
            <Image className={'bg-dark rounded-md p-2 hover:bg-primary'} src={state.current_qr_code} alt="QR Code" width={200} height={200} />
        </div>
    );
    const instagram_div = (
        <div className={styles.instagram_wrapper}>
            <a
                href="https://www.instagram.com/jws_fineart/"
                target="_blank"
                rel="noreferrer"
                className={styles.socials_picture}
            >
                <Image src="/Instagram_icon_512.png" alt="Instagram Logo" width={100} height={100} />
            </a>
            <div className={styles.follow_us}></div>
        </div>
    );

    const socials_content =
        state.window_width >= 768 ? (
            <div className={'flex h-full w-full bg-grey overflow-y-auto justify-center items-center space-x-2.5'}>
                {/* Left Side */}
                <div className={'flex w-fit justify-center items-center bg-dark rounded-md'}>{bio_image_div}</div>

                {/* Right Side */}
                <div className={'flex flex-col w-fit justify-center items-center space-y-2.5'}>
                    {artist_name_div}
                    {qr_code_div}
                    {instagram_div}
                </div>
            </div>
        ) : (
            <div className={'flex flex-col h-full w-full bg-grey overflow-y-auto justify-center items-center'}>
                {/* Left Side */}
                <div className={'flex flex-col w-full justify-center items-center'}>
                    {bio_image_div}
                    {artist_name_div}
                </div>

                {/* Right Side */}
                <div className={'flex flex-col w-full justify-center items-center space-y-2.5'}>
                    {qr_code_div}
                    {instagram_div}
                </div>
            </div>
        );

    return <>{socials_content}</>;
}

export default Socials;
