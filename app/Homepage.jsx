// /app/Homepage.js

'use client';

import React, { useRef } from 'react';
import Image from 'next/image';

import styles from '@/styles/pages/Homepage.module.scss'; // Updated the path for renamed SCSS module

import PROJECT_CONSTANTS from '@/lib/constants';
import { biographyText } from '@/lib/biographyText';

const {
    AWS_BUCKET_URL,
    CONTACT_FULL_NAME,
    CONTACT_EMAIL
} = PROJECT_CONSTANTS;

function Homepage() {
    const overlayRef = useRef(null);

    const handleGalleryEnter = () => {
        overlayRef.current.style.display = 'block';
        setTimeout(() => {
            window.location.href = '/gallery';
        }, 1000);
    }

    return (
        <div className={'w-full h-full overflow-y-auto bg-light pt-5'}>
            <div className={styles.left_column}>
                <div className={styles.bio_image_container}>
                    <div className={styles.bio_image_border}>
                        <Image className={styles.bio_image} width={200} height={250} quality={100} priority
                            src={`/bio_pic_small.jpg`} alt="Bio Pic"
                        />
                    </div>
                </div>
                <div className={styles.contact_container}>
                    <div className={styles.contact_text_container}>
                        <b className={`${styles.contact_text} ${styles.title}`}>{CONTACT_FULL_NAME}</b>
                    </div>
                    <div className={styles.contact_text_container}>
                        <a className={`${styles.contact_link} ${styles.link}`} href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
                    </div>
                    <div className={styles.enter_gallery_button_container}>
                        <button className={styles.enter_gallery_button} onClick={handleGalleryEnter}>
                            Enter Gallery
                        </button>
                    </div>
                </div>
                <div className={`${styles.overlay} hidden`} ref={overlayRef}></div>
            </div>
            <div className={styles.right_column}>
                <div className={styles.bio_text_container}>
                    {biographyText.map((paragraph, index) => (
                        <p key={index} className={styles.bio_text}>
                            {paragraph}
                        </p>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Homepage;
