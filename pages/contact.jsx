import React from 'react';

import { prisma } from '../lib/prisma'

import PageLayout from '../src/components/layout/PageLayout'
import Contact from '../src/components/pages/contact/Contact';

class ContactPage extends React.Component {
    constructor(props) {
        super(props);

        this.page_title = "Contact"
    }

    async componentDidMount() { }

    render() {
        return (
          <PageLayout page_title={this.page_title}>
            <Contact/>
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

export default ContactPage;