import Link from 'next/link';
import Image from 'next/image'

import styles from '../../styles/OrderTree.module.scss'

const baseURL = "https://jwsfineart.s3.us-west-1.amazonaws.com";

const OrderTree = ({verified_list, refresh_data}) => {

    console.log("Generating Order Tree - Data Next Line")
    console.log(verified_list)

    var list_items = [];

    for (var i = 0; i < verified_list.length; i++) {
        const verified_payment_data = verified_list[i];
        console.log(`Verified Payment Data (Next Line):`);
        console.log(verified_payment_data);

        var image_url = `${baseURL}${verified_payment_data['image_path']}`
        if (!verified_payment_data['image_path'].includes("https://jwsfineart.s3.us-west-1.amazonaws.com")) {
            image_url = `${baseURL}/pieces/${verified_payment_data['image_path'].split('pieces/')[1]}`
        }

        const list_item_jsx = (
            <div className={styles.list_item_container}>
                <div className={styles.list_item_image_container}>
                    <img className={styles.list_item_image} src={image_url}/>
                </div>

                <div className={styles.list_item_title_container_order}>
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

        list_items.push(list_item_jsx)
    }

    return (
        <div className={styles.order_tree_body}>
            <div className={styles.tree_list_item_container}>
                {list_items}
            </div>
        </div>
    )
}

export default OrderTree;
