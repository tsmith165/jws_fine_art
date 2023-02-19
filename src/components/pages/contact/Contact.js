import React from 'react';
import Image from 'next/image'

import styles from '../../../../styles/pages/Contact.module.scss'

class Contact extends React.Component {
    constructor(props) {
        super(props);

        this.page_name = 'Contact'
    }

    async componentDidMount() {

    }

    render() {
        console.log(`Loading ${this.page_name} Page`)

        return (
            <div className={styles.contact_container}>
            <div className={styles.contact_image_container}>
                <div className={styles.contact_image_border}>
                    <Image
                        className={styles.contact_image}
                        src={"https://jwsfineartpieces.s3.us-west-1.amazonaws.com/site/bio_pic_small.jpg"}
                        alt={"Bio Pic"}
                        priority={true}
                        width={200}
                        height={267}
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
}

export default Contact;
