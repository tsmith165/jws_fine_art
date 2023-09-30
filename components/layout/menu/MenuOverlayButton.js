import React from 'react';

import styles from '@/styles/layout/MenuOverlay.module.scss'

import { withClerk } from "@clerk/clerk-react";
import Router from 'next/navigation';

import AppContext from '@/contexts/AppContext';

class MenuOverlayButton extends React.Component {
    constructor(props) {
        super(props);
    }

    async componentDidMount() { }

    render() {
        const { appState, setAppState } = this.context;

        if (this.props.menu_name == 'Sign Out') {
            return (
                <div className={styles.menu_overlay_item} id={this.props.id} onClick={() => this.props.clerk.signOut()}>
                    <b className={styles.menu_overlay_item_title}>{this.props.menu_name}</b>
                </div>
            )
        }
        return (
            <div className={styles.menu_overlay_item} id={this.props.id} onClick={ (e) => {e.preventDefault(); setAppState({...this.props.app_state, menu_open: false}); Router.push(this.props.url_endpoint)} }>
                <b className={styles.menu_overlay_item_title}>{this.props.menu_name}</b>
            </div>
        )
    }
}

MenuOverlayButton.contextType = AppContext;

export default withClerk(MenuOverlayButton);