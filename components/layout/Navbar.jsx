import PROJECT_CONSTANTS from '@/lib/constants';
import Link from 'next/link';
import Image from 'next/image';

import SiteMenu from './SiteMenu';

import styles from '@/styles/layout/Navbar.module.scss';

const Navbar = () => {
    return (
        <nav className={styles.navbar}>
            <div className={styles.navbar_container}>
                <div className={`${styles.navbar_logo} ${styles.centered_image_container}`}>
                    <Link href="/">
                        <Image
                            className={`${styles.navbar_logo_image} ${styles.centered_image}`}
                            src="/jws_logo_small.png"
                            alt={`${PROJECT_CONSTANTS.SITE_FULL_NAME} logo`}
                            width={274}
                            height={80}
                            sizes="250px"
                        />
                    </Link>
                </div>

                <Link href="https://www.instagram.com/jws_fineart/" target="_blank" rel="noreferrer">
                    <div className={styles.instagram_link_container}>
                        <div className={styles.instagram_logo_link_container}>
                            <Image
                                className={styles.instagram_logo_link}
                                src="/instagram_icon_50.png"
                                alt="Instagram Link"
                                width={50}
                                height={50}
                            />
                        </div>
                    </div>
                </Link>

                <SiteMenu />
            </div>
        </nav>
    );
};

export default Navbar;
