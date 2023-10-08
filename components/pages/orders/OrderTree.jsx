import logger from '@/lib/logger';
import PROJECT_CONSTANTS from '@/lib/constants'
import React, { useEffect } from 'react';
import styles from '@/styles/components/OrderTree.module.scss'

const OrderTree = (props) => {
    useEffect(() => {
        
    }, []);

    logger.debug("Generating Order Tree - Data Next Line");
    logger.debug(props.verified_list);

    const list_items = props.verified_list.map(verified_payment_data => {
        logger.debug(`Verified Payment Data (Next Line):`);
        logger.debug(verified_payment_data);

        let image_url = verified_payment_data['image_path'];
        if (!verified_payment_data['image_path'].includes(PROJECT_CONSTANTS.AWS_BUCKET_URL)) {
            image_url = `${PROJECT_CONSTANTS.AWS_BUCKET_URL}/pieces/${verified_payment_data['image_path'].split('pieces/')[1]}`;
        }

        return (
            <div className={styles.list_item_container} key={verified_payment_data.id || Math.random()}>
                <div className={styles.list_item_image_container}>
                    <img className={styles.list_item_image} src={image_url} alt={verified_payment_data['piece_title']} />
                </div>
                <div className={styles.list_item_title_container}>
                    <b className={styles.list_item_title}>{verified_payment_data['piece_title']}</b>
                </div>
                <div className={styles.order_description_container}>
                        <div className={styles.list_item_text_container}>
                            <div className={styles.list_item_desc_container}>
                                <b className={styles.list_item_desc}>Date: </b>
                            </div>
                            <b className={styles.list_item_text}>{verified_payment_data['date']}</b>
                        </div>
                        <div className={styles.list_item_text_container}>
                            <div className={styles.list_item_desc_container}>
                                <b className={styles.list_item_desc}>Name: </b>
                            </div>
                            <b className={styles.list_item_text}>{verified_payment_data['full_name']}</b>
                        </div>
                        <div className={styles.list_item_text_container}>
                            <div className={styles.list_item_desc_container}>
                                <b className={styles.list_item_desc}>Address: </b>
                            </div>
                            <b className={styles.list_item_text}>{verified_payment_data['address']}</b>
                        </div>
                        <div className={styles.list_item_text_container}>
                            <div className={styles.list_item_desc_container}>
                                <b className={styles.list_item_desc}>Phone: </b>
                            </div>
                            <b className={styles.list_item_text}>{verified_payment_data['phone']}</b>
                        </div>
                        <div className={styles.list_item_text_container}>
                            <div className={styles.list_item_desc_container}>
                                <b className={styles.list_item_desc}>Email: </b>
                            </div>
                            <b className={styles.list_item_text}>{verified_payment_data['email']}</b>
                        </div>
                        <div className={styles.list_item_text_container}>
                            <div className={styles.list_item_desc_container}>
                                <b className={styles.list_item_desc}>Price: </b>
                            </div>
                            <b className={styles.list_item_text}>${verified_payment_data['price']}</b>
                        </div>
                    </div>
            </div>
        );
    });

    return (
        <div className={styles.order_tree_body}>
            <div className={styles.tree_list_item_container}>
                {list_items}
            </div>
        </div>
    );
}

export default OrderTree;
