import React from 'react';
import { withRouter } from 'next/router';

import { prisma } from '@/lib/prisma';

import PageLayout from '@/components/layout/PageLayout';
import PieceTree from '@/components/pages/manage/PieceTree';

import styles from '@/styles/pages/Users.module.scss';

class Manage extends React.Component {
    constructor(props) {
        super(props);

        this.page_title = 'Piece Management';
    }

    async componentDidMount() {}

    render() {
        if (!this.props.isLoaded) {
            return <></>;
        }
        if (!this.props.isSignedIn) {
            this.props.router.push('/');
        }
        if (this.props.user == null) {
            this.props.router.push('/');
        }

        const role = this.props.user.publicMetadata.role !== undefined ? this.props.user.publicMetadata.role : null;
        console.log(`USER ROLE: ${role}`);

        if (role !== 'ADMIN') {
            this.props.router.push('/');
        }

        return (
            <PageLayout page_title={this.page_title}>
                <div className={styles.main_container}>
                    <div className={styles.main_body}>
                        <h2 className={styles.module_title}>Piece Management:</h2>
                        <div className={styles.manage_main_container}>
                            <div className={styles.pieces_tree_container}>
                                <PieceTree
                                    piece_tree_data={this.props.piece_list}
                                    refresh_data={this.props.refresh_data}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </PageLayout>
        );
    }
}

async function fetchPieces() {
    console.log(`Fetching pieces with prisma`);
    const piece_list = await prisma.piece.findMany({
        orderBy: {
            o_id: 'desc',
        },
    });

    return piece_list;
}

export const getServerSideProps = async (context) => {
    console.log('Getting Server Side Props');
    const piece_list = await fetchPieces();

    return {
        props: {
            piece_list: piece_list,
            most_recent_id: piece_list[0]['id'],
        },
    };
};

export default withRouter(Manage);
