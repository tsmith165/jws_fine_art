import PROJECT_CONSTANTS from '@/lib/constants';

import React from 'react';

import { prisma } from '@/lib/prisma'

import PageLayout from '@/components/layout/PageLayout'
import Biography from '@/components/pages/biography/Biography'

class BiographyPage extends React.Component {
    constructor(props) {
        super(props);

        this.page_title = `Biography ${PROJECT_CONSTANTS.SITE_FULL_NAME}`
    }

    async componentDidMount() { }

    render() {
        return (
            <PageLayout page_title={this.page_title}>
                <Biography/>
            </PageLayout>
        )
    }
}

export const getServerSideProps = async (context) => {
    console.log("Getting Server Side Props")
    const piece = await prisma.piece.findFirst({
        orderBy: {
            o_id: 'desc',
        },
    })

    return { 
        props: {
            "most_recent_id": piece['id']
        }
    }
}

export default BiographyPage