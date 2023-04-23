// pages/socials.js

import PageLayout from '@/components/layout/PageLayout';
import PROJECT_CONSTANTS from '@/lib/constants';
import styles from '@/styles/pages/Socials.module.scss';
import Image from 'next/image';
import React from 'react';

class SocialsPage extends React.Component {
    constructor(props) {
        super(props);

        this.page_title = `Socials - ${PROJECT_CONSTANTS.SITE_FULL_NAME}`;
    }

    async componentDidMount() {}

    render() {
        return (
            <PageLayout page_title={this.page_title}>
                <div className={styles.socials_container}>
                    <div className={styles.left_side}>
                        <div className={styles.bio_image_border}>
                            <Image
                                className={styles.bio_image}
                                src={`${PROJECT_CONSTANTS.AWS_BUCKET_URL}/site/bio_pic.jpg`}
                                alt="Bio Pic"
                                layout="fill"
                                objectFit="cover"
                                quality={100}
                            />
                        </div>
                    </div>
                    <div className={styles.right_side}>
                        <div className={styles.artist_name}>Jill Weeks Smith</div>
                        <div className={styles.qr_code_wrapper}>
                            <Image
                                className={styles.qr_code}
                                src="/JWS_QR_CODE.png"
                                alt="QR Code"
                                width={200}
                                height={200}
                            />
                        </div>
                        <div className={styles.instagram_wrapper}>
                            <a href="https://www.instagram.com/jws_fineart/" target="_blank" rel="noreferrer">
                                <Image src="/instagram_icon_100.png" alt="Instagram Logo" width={100} height={100} />
                            </a>
                            <div className={styles.follow_us}>Follow Us</div>
                        </div>
                    </div>
                </div>
            </PageLayout>
        );
    }
}

export default SocialsPage;
