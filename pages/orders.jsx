import React from 'react';
import { withRouter } from 'next/router'

import { prisma } from '@/lib/prisma'

import PageLayout from '@/components/layout/PageLayout'
import OrderTree from '@/components/pages/orders/OrderTree';

import styles from '@/styles/pages/Orders.module.scss'

class Orders extends React.Component {
    constructor(props) {
        super(props);

        this.page_title = "Orders"
    }

    async componentDidMount() { }

    render() {
        if (!this.props.isLoaded) { return(<></>) }
        if (!this.props.isSignedIn) { this.props.router.push('/') }
        if (this.props.user == null) { this.props.router.push('/') }
        
        const role = (this.props.user.publicMetadata.role !== undefined) ? this.props.user.publicMetadata.role : null;
        console.log(`USER ROLE: ${role}`)
        
        if (role !== "ADMIN") { this.props.router.push('/') }
        
        if (!this.props.router.isReady) { return(<></>) }

        return (
            <PageLayout page_title={"Orders"}>
                <div className={styles.main_container}>
                    <div className={styles.main_body}>
                        <h2 className={styles.module_title}>Order Management:</h2>
                        <div className={styles.manage_main_container}>
                            <div className={styles.pieces_tree_container}>
                                <OrderTree verified_list={this.props.verified_list}/>
                            </div>
                        </div>
                    </div>
                </div>
            </PageLayout>
        )
    }
}

async function fetchVerfiedPayments() {
    console.log(`Fetching pieces with prisma`)
    var verified_list = await prisma.verified.findMany()

    console.log("Verified Payments List (Next Line):")
    console.log(verified_list)

    for (var i = 0; i < verified_list.length; i++) {
        const date_string = new Date(verified_list[i]['date']).toUTCString();
        console.log(`Current Date: ${date_string}`)
        verified_list[i]['date'] = date_string
    }

    console.log("Verified Payments List (Next Line):")
    console.log(verified_list)

    return verified_list
}

export const getServerSideProps = async (context) => {
    console.log("Getting Server Side Props")
    const verified_list = await fetchVerfiedPayments()

    const piece = await prisma.piece.findFirst({
        orderBy: {
            o_id: 'desc',
        },
    })

    return { 
        props: {
            "verified_list": verified_list,
            "most_recent_id": piece['id']
        }
    }
}

export default withRouter(Orders);
