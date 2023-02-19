import React from 'react';

import PageLayout from '../src/components/layout/PageLayout'
import Biography from '../src/components/pages/biography/Biography'

import { prisma } from '../lib/prisma'

class BiographyPage extends React.Component {
    constructor(props) {
        super(props);

        this.page_title = "Biography"
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