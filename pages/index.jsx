import React from 'react';

import { prisma } from '../lib/prisma'

import PageLayout from '../src/components/layout/PageLayout'
import Gallery from '../src/components/pages/gallery/Gallery';

class Home extends React.Component {
    constructor(props) {
        super(props);

        this.page_title = "Gallery JWS Fine Art"
    }

    async componentDidMount() { }

    render() {
        return (
            <PageLayout page_title={this.page_title}>
              <Gallery piece_list={this.props.piece_list} app_state={this.props.app_state} app_set_state={this.props.app_set_state}/>
            </PageLayout>
        )
    }
}

export default Home

async function fetchPieces() {
    console.log(`Fetching pieces with prisma`)
    const piece_list = await prisma.piece.findMany({
        orderBy: {
            o_id: 'desc',
        }
    })
    return piece_list
}

export const getServerSideProps = async (context) => {
    console.log("Getting Server Side Props")
    const piece_list = await fetchPieces()

    return { 
        props: {
            "piece_list": piece_list,
            "most_recent_id": piece_list[0]['id']
        }
    } 
}

