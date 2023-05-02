// pages/socials.js
import logger from '@/lib/logger';
import PROJECT_CONSTANTS from '@/lib/constants';

import Image from 'next/image';
import React from 'react';

import PageLayout from '@/components/layout/PageLayout';
import styles from '@/styles/pages/Socials.module.scss';

const BLACK_AND_WHITE_QR_CODE = '/JWS_QR_CODE_WHITE_BLACK.png';
const COLORED_QR_CODE = '/JWS_QR_CODE_GREEN_TAN.png';

class SocialsPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            window_width: null,
            window_height: null,
            current_qr_code: COLORED_QR_CODE,
        };

        this.handleResize = this.handleResize.bind(this);
        this.handleClickQRCode = this.handleClickQRCode.bind(this);
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

    handleClickQRCode() {
        this.setState((prevState) => ({
            current_qr_code:
                prevState.current_qr_code === BLACK_AND_WHITE_QR_CODE ? COLORED_QR_CODE : BLACK_AND_WHITE_QR_CODE,
        }));
    }

    handleResize() {
        logger.debug(`Window Width: ${window.innerWidth} | Height: ${window.innerHeight}`);
        this.setState({
            window_width: window.innerWidth,
            window_height: window.innerHeight,
        });
    }

    render() {
        const artist_name_div = <div className={styles.artist_name}>Jill Weeks Smith</div>;
        const website_div = <div className={styles.website}>jwsfineart.com</div>;
        const bio_image_div = (
            <div className={`${styles.bio_image_border} ${styles.centered_image_container}`}>
                <Image
                    className={`${styles.bio_image} ${styles.centered_image}`}
                    src={`${PROJECT_CONSTANTS.AWS_BUCKET_URL}/site/bio_pic.jpg`}
                    alt="Bio Pic"
                    quality={100}
                />
            </div>
        );
        const qr_code_div = (
            <div className={styles.qr_code_wrapper} onClick={this.handleClickQRCode}>
                <Image
                    className={styles.qr_code}
                    src={this.state.current_qr_code}
                    alt="QR Code"
                    width={200}
                    height={200}
                />
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
            this.state.window_width >= 768 ? (
                <div className={styles.socials_container}>
                    {/* Left Side */}
                    <div className={styles.left_side}>{bio_image_div}</div>

                    {/* Right Side */}
                    <div className={styles.right_side}>
                        {artist_name_div}
                        {website_div}
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
