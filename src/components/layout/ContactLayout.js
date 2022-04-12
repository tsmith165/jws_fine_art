import Image from 'next/image';

import styles from '../../../styles/pages/Contact.module.scss'

const ContactLayout = ({}) => {
    return (
        <div className={styles.contact_container}>
            <div className={styles.contact_image_container}>
                <div className={styles.contact_image_border}>
                    <Image
                        className={styles.contact_image}
                        src={"/bio_pic.jpg"}
                        alt={"Bio Pic"}
                        priority={true}
                        layout='fill'
                        quality={100}
                    />
                </div>
            </div>
            <div className={styles.contact_title_container}>
                <b className={styles.contact_title}>Jill Weeks Smith</b>
            </div>
            <div className={styles.contact_text_container}>
                <a className={`${styles.contact_link} ${styles.link}`} href="mailto:jwsfineart@gmail.com">jwsfineart@gmail.com</a>
            </div>
        </div>
    )
}

export default ContactLayout;
