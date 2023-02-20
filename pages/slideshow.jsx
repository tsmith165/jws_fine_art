import React from 'react';

import { prisma } from '@/lib/prisma'

import PageLayout from '@/components/layout/PageLayout'
import Slideshow from '@/components/pages/slideshow/Slideshow';

import styles from '@/styles/pages/Slideshow.module.scss'

class SlideshowPage extends React.Component {
    constructor(props) {
        super(props);

        this.page_title = "Slideshow JWS Fine Art"
    }

    async componentDidMount() { }

    render() {
        return (
            <PageLayout page_title={this.page_title}>
                <div className={styles.slideshow_container}>
                    <Slideshow piece_list={this.props.piece_list}/>
                </div>
            </PageLayout>
        )
    }
}

async function fetchPieces() {
    console.log(`Fetching pieces with prisma`)
    const piece_list = await prisma.piece.findMany({
        orderBy: {
            o_id: 'desc',
        },
    })

    return piece_list
}

export const getServerSideProps = async (context) => {
    console.log("Getting Server Side Props")
    const piece_list = await fetchPieces()

    //console.log(context)
    return { 
        props: {
            "piece_list": piece_list,
            "most_recent_id": piece_list[0]['id']
        }
    }
}

export default SlideshowPage;