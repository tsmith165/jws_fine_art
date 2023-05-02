import logger from "@/lib/logger";
import PROJECT_CONSTANTS from '@/lib/constants'

import React from 'react';
import Image from 'next/image'

import styles from '@/styles/pages/Biography.module.scss'

class BiographyPage extends React.Component {
    constructor(props) {
        super(props);

        this.page_name = 'Biography'
    }

    async componentDidMount() {

    }

    render() {
        logger.debug(`Loading ${this.page_name} Page`)

        return (
            <div className={styles.bio_container}>
                <div className={styles.bio_image_container}>
                    <div className={`${styles.bio_image_border} ${styles.centered_image_container}`}>
                        <Image
                            className={`${styles.bio_image} ${styles.centered_image}`}
                            src={`${PROJECT_CONSTANTS.AWS_BUCKET_URL}/site/bio_pic_small.jpg`}
                            alt={"Bio Pic"}
                            priority={true}
                            width={200}
                            height={267}
                            quality={100}
                        />
                    </div>
                </div>
                <div className={styles.bio_title_container}>
                    <b className={styles.bio_title}>Jill Weeks Smith</b>
                </div>
                <div className={styles.bio_text_container}>
                    <p className={styles.bio_text}>
                        “My work captures moments I can’t let go of, so I can revisit often and bring others with me. I’m drawn to unique perspectives. I love experimenting with techniques and tools to explore color, find light and suggest texture to capture the soul of what’s often overlooked.”

                        <br/>
                        <br/>

                        A native of San Diego, CA, Jill Weeks Smith was born with a passion for creativity. Her passion was recognized by a local artist and family friend who mentored Smith in oil painting from the young age of twelve, teaching her to experience the world by taking in small moments and changing light. Smith worked as a local silkscreen artist through high school and, as a student-athlete, combined her talents to create media for the athletic department and yearbook.
                        <br/>
                        <br/>

                        Smith was educated at Utah State University in Fine Art with an emphasis in Oil Painting and a minor in Interior Design, while high jumping on USU’s track team. After migrating with her husband to Sacramento, CA, Smith’s work was featured in numerous galleries, publications, exhibitions, Second Saturday Art Walks, as well as fine art & wine fairs throughout Northern California and Lake Tahoe.
                        <br/>
                        <br/>

                        In 2009, Smith saw a need and took a hiatus from professional art to cultivate youth. She embarked on a very successful second career as a girls and boys high school varsity and club volleyball coach with her players and team achieving state and national recognition. During this period, Smith felt the desire to share her artistic talents by becoming an art docent for the local school district. Ten years later, she retired from coaching to return to her primary passion with a renewed drive and desire to capture the world around her. 
                        <br/>
                        <br/>

                        “While oil painting is how I communicate most often, it can require a little drying between layers of color. This allows me time to engage the more technical and physically challenging side of the creative spectrum with relief etching and intaglio. This medium’s tactile, aggressive nature of mark making, gouging, carving, acid etching, and inking in limited color to tell a story is challenging and therapeutic. It is a welcome counterbalance to the looser and vibrant nature of oils. Moving between the two disciplines helps me avoid the creative block that can happen when focused solely on one.
                        <br/>
                        <br/>

                        Previously, my work has been large scale. I’ve since transitioned to smaller and more intimate work. With so many ideas waiting to be expressed, this size allows me to realize more of them. This shift in size also enables me to reach a broader audience. Everyone should be able to enjoy original works of art, which is very important to me.”
                        <br/>
                        <br/>

                        Jill Weeks Smith’s work can be found in public and private collections throughout the United States.
                    </p>
                </div>
                <div className={styles.contact_container}>
                    <div className={styles.contact_text_container}>
                        <b className={`${styles.contact_text} ${styles.title}`}>{PROJECT_CONSTANTS.CONTACT_FULL_NAME}</b>
                    </div>
                    <div className={styles.contact_text_container}>
                        <a className={`${styles.contact_link} ${styles.link}`} href={`mailto:${PROJECT_CONSTANTS.CONTACT_EMAIL}`}>{PROJECT_CONSTANTS.CONTACT_EMAIL}</a>
                    </div>
                </div>
            </div>
        )
    }
}

export default BiographyPage;
