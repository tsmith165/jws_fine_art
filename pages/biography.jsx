import React from 'react';

import PageLayout from '../src/components/layout/PageLayout'
import BiographyPage from '../src/components/pages/biography/BiographyPage'

import { prisma } from '../lib/prisma'

class Biography extends React.Component {
    constructor(props) {
        super(props);

        this.page_title = "Gallery JWS Fine Art"
    }

    async componentDidMount() { }

    render() {
        return (
            <PageLayout page_title={"Biography"}>
                <BiographyPage/>
            </PageLayout>
        )
    }
}

export default Biography

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