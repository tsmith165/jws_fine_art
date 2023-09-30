'use client'

import React, { useEffect } from 'react';
import Image from 'next/image';
import logger from '@/lib/logger';
import styles from '@/styles/pages/Biography.module.scss';

import PROJECT_CONSTANTS from '@/lib/constants';
import { biographyText } from '@/lib/biographyText';

const {
    AWS_BUCKET_URL,
    CONTACT_FULL_NAME,
    CONTACT_EMAIL
} = PROJECT_CONSTANTS;

function BiographyPage() {
    const page_name = 'Biography';

    useEffect(() => {
        logger.debug(`Loading ${page_name} Page`);
    }, [page_name]);

    return (
        <div className={styles.bio_container}>
            <div className={styles.bio_image_container}>
                <div className={styles.bio_image_border}>
                    <Image className={styles.bio_image} width={200} height={267} quality={100} priority
                        src={`${AWS_BUCKET_URL}/site/bio_pic_small.jpg`} alt="Bio Pic"
                    />
                </div>
            </div>
            <div className={styles.bio_title_container}>
                <b className={styles.bio_title}>Jill Weeks Smith</b>
            </div>
            <div className={styles.bio_text_container}>
                <div className={styles.bio_text}>
                    {biographyText.map((paragraph, index) => (
                        <p key={index} className={styles.bio_text}>
                            {paragraph}
                        </p>
                    ))}
                </div>
            </div>
            <div className={styles.contact_container}>
                <div className={styles.contact_text_container}>
                    <b className={`${styles.contact_text} ${styles.title}`}>{CONTACT_FULL_NAME}</b>
                </div>
                <div className={styles.contact_text_container}>
                    <a className={`${styles.contact_link} ${styles.link}`} href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
                </div>
            </div>
        </div>
    );
}

export default BiographyPage;
