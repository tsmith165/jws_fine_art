import PROJECT_CONSTANTS from '@/lib/constants';
import Image from 'next/image';
import styles from '@/styles/pages/Contact.module.scss';

const Contact = () => {
  return (
    <div className={styles.contact_container}>
      <div className={styles.contact_image_container}>
        <div className={styles.contact_image_border}>
          <Image
            className={styles.contact_image}
            src={`${PROJECT_CONSTANTS.AWS_BUCKET_URL}/site/bio_pic_small.jpg`}
            alt={"Bio Pic"}
            priority={true}
            width={200}
            height={267}
            quality={100}
          />
        </div>
      </div>
      <div className={styles.contact_title_container}>
        <b className={styles.contact_title}>{PROJECT_CONSTANTS.CONTACT_FULL_NAME}</b>
      </div>
      <div className={styles.contact_text_container}>
        <a className={`${styles.contact_link} ${styles.link}`} href={`mailto:${PROJECT_CONSTANTS.CONTACT_EMAIL}`}>{PROJECT_CONSTANTS.CONTACT_EMAIL}</a>
      </div>
    </div>
  );
};

export default Contact;
