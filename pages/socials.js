// pages/socials.js

import PageLayout from '@/components/layout/PageLayout';
import PROJECT_CONSTANTS from '@/lib/constants';
import styles from '@/styles/pages/Socials.module.scss';
import Image from 'next/image';
import React from 'react';

class SocialsPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            window_width: null,
            window_height: null,
        };

        this.handleResize = this.handleResize.bind(this);
    }

    async componentDidMount() {
        // Add event listener
        window.addEventListener('resize', this.handleResize);

        // Call handler right away so state gets updated with initial window size
        this.handleResize();
    }

    async componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize);
    }

    handleResize() {
        console.log(`Window Width: ${window.innerWidth} | Height: ${window.innerHeight}`);
        this.setState({
            window_width: window.innerWidth,
            window_height: window.innerHeight,
        });
    }

    render() {
        const artist_name_div = <div className={styles.artist_name}>Jill Weeks Smith</div>;
        const bio_image_div = (
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
        );
        const qr_code_div = (
            <div className={styles.qr_code_wrapper}>
                <Image className={styles.qr_code} src="/JWS_QR_CODE.png" alt="QR Code" width={200} height={200} />
            </div>
        );
        const instagram_div = (
            <div className={styles.instagram_wrapper}>
                <a href="https://www.instagram.com/jws_fineart/" target="_blank" rel="noreferrer">
                    <Image src="/instagram_icon_100.png" alt="Instagram Logo" width={100} height={100} />
                </a>
                <div className={styles.follow_us}>Follow & ❤️</div>
            </div>
        );

        const socials_content =
            this.state.window_width >= 768 ? (
                <div className={styles.socials_container}>
                    {/* Left Side */}
                    <div className={styles.left_side}>{bio_image_div}</div>

                    {/* Right Side */}
                    <div className={styles.right_side}>
                        {artist_name_div}
                        {qr_code_div}
                        {instagram_div}
                    </div>
                </div>
            ) : (
                <div className={styles.socials_container}>
                    {/* Left Side */}
                    <div className={styles.left_side}>
                        {bio_image_div}
                        {artist_name_div}
                    </div>

                    {/* Right Side */}
                    <div className={styles.right_side}>
                        {qr_code_div}
                        {instagram_div}
                    </div>
                </div>
            );

        return <PageLayout page_title={this.page_title}>{socials_content}</PageLayout>;
    }
}

export default SocialsPage;
