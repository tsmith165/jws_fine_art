import Image from 'next/image';
import Link from 'next/link';
import styles from '@/styles/pages/Homepage.module.scss';
import PROJECT_CONSTANTS from '@/lib/constants';
import { biographyText } from '@/lib/biographyText';

const {
    AWS_BUCKET_URL,
    CONTACT_FULL_NAME,
    CONTACT_EMAIL
} = PROJECT_CONSTANTS;

interface HomepageProps {
    most_recent_id: number | null;
}

function Homepage({ most_recent_id }: HomepageProps) {
    return (
        <div className={styles.bio_container}>
            <div className={styles.left_column}>
                <div className={styles.bio_image_container}>
                    <div className={styles.bio_image_border}>
                        <Image className={styles.bio_image} width={200} height={267} quality={100} priority
                            src={`${AWS_BUCKET_URL}/site/bio_pic_small.jpg`} alt="Bio Pic"
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
                        <Link href="/gallery">
                            <button className={styles.enter_gallery_button}>
                                Enter Gallery
                            </button>
                        </Link>
                    </div>
                </div>
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