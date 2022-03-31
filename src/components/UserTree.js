import styles from '../../styles/UserTree.module.scss'

import { demote_user, promote_user, delete_user } from '../../lib/api_calls'

const UserTree = ({user_tree_data, refresh_data}) => {

    console.log("Generating User Tree - Data Next Line")
    console.log(user_tree_data)

    var list_items = [];

    for (var i = 0; i < user_tree_data.length; i++) {
        const user_data = user_tree_data[i];
        console.log("User Data (Next Line):");
        console.log(user_data);

        const list_item_jsx = (
            <div className={styles.tree_list_item}>
                <div className={styles.user_grid}>
                    <div className={styles.email_container}>{user_data.email}</div>
                    <div className={styles.role_container}>{user_data.role}</div>
                </div>

                <button className={`${styles.delete_button} ${styles.list_item_button}`} onClick={() => {delete_user(user_data.id, refresh_data);}}>Delete</button>
                {
                    user_data.role == 'ADMIN' ? 
                    <button className={`${styles.demote_button} ${styles.list_item_button}`} onClick={() => {demote_user(user_data.id, refresh_data); }}>Demote</button> :
                    <button className={`${styles.promote_button} ${styles.list_item_button}`} onClick={() => {promote_user(user_data.id, refresh_data); }}>Promote</button>
                }
            </div>
        );

        list_items.push(list_item_jsx)
    }

    return (
        <div className={styles.user_tree_body}>
            <div className={styles.tree_list_header_container}>
                <div className={styles.tree_list_header}>
                    <div className={styles.user_grid}>
                        <div className={styles.email_container}>Email</div>
                        <div className={styles.role_container}>Role</div>
                    </div>

                    <div className={`${styles.list_item_header}`}>Delete</div>
                    <div className={`${styles.list_item_header}`}>Promote</div>
                </div>
            </div>
            <div className={styles.tree_list_item_container}>
                {list_items}
            </div>
        </div>
    )
}

export default UserTree;
