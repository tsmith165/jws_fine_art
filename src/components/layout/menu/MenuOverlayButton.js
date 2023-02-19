import React from 'react';

import styles from '../../../../styles/layout/MenuOverlay.module.scss'

import { withClerk } from "@clerk/clerk-react";
import { withRouter } from 'next/router'

class MenuOverlayButton extends React.Component {
    constructor(props) {
        super(props);

    }

    async componentDidMount() {

    }

    render() {
        this.props.router.prefetch(this.props.url_endpoint)

        if (this.props.menu_name == 'Sign Out') {
            return (
                <div className={styles.menu_overlay_item} id={this.props.id} onClick={() => this.props.clerk.signOut()}>
                    <b className={styles.menu_overlay_item_title}>{this.props.menu_name}</b>
                </div>
            )
        }
        return (
            <div className={styles.menu_overlay_item} id={this.props.id} onClick={ (e) => {e.preventDefault(); app_set_state({...app_state, menu_open: false}); router.push(this.props.url_endpoint)} }>
                <b className={styles.menu_overlay_item_title}>{this.props.menu_name}</b>
            </div>
        )
    }
}

export default withRouter(withClerk(MenuOverlayButton));