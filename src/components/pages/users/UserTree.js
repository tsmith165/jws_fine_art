import React from 'react';

import styles from '@/styles/components/UserTree.module.scss'

import { demote_user, promote_user, delete_user } from '@/lib/api_calls'

class UserTree extends React.Component {
    constructor(props) {
        super(props);

    }

    async componentDidMount() {

    }

    render() {
        console.log("Generating User Tree - Data Next Line")
        console.log(this.props.user_tree_data)
    
        var list_items = [];
    
        for (var i = 0; i < this.props.user_tree_data.length; i++) {
            const user_data = this.props.user_tree_data[i];
            console.log("User Data (Next Line):");
            console.log(user_data);
    
            const list_item_jsx = (
                <div className={styles.tree_list_item}>
                    <div className={styles.user_grid}>
                        <div className={styles.email_container}>{user_data.email}</div>
                        <div className={styles.role_container}>{user_data.role}</div>
                    </div>
    
                    <button className={`${styles.delete_button} ${styles.list_item_button}`} onClick={(e) => { e.preventDefault(); delete_user(user_data.id, this.props.refresh_data);}}>Delete</button>
                    {
                        user_data.role == 'ADMIN' ? 
                        <button className={`${styles.demote_button} ${styles.list_item_button}`} onClick={(e) => { e.preventDefault(); demote_user(user_data.id, this.props.refresh_data); }}>Demote</button> :
                        <button className={`${styles.promote_button} ${styles.list_item_button}`} onClick={(e) => { e.preventDefault(); promote_user(user_data.id, this.props.refresh_data); }}>Promote</button>
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
}

export default UserTree;
