import React from 'react';
import { withRouter } from 'next/router'

import { prisma } from '@/lib/prisma'

import PageLayout from '@/components/layout/PageLayout'
import Cancel from '@/components/pages/cancel/Cancel';

class CancelPage extends React.Component {
  constructor(props) {
      super(props);

      this.page_title = "Checkout"
  }

  async componentDidMount() { }

  render() {
    if (!this.props.router.isReady) return null
    return ( 
      <PageLayout page_title={this.page_title}>
        <Cancel id={this.props.router.query.id} piece_list={this.props.piece_list} router={this.props.router}/> 
      </PageLayout>
    )
  }
}

export default withRouter(CancelPage)

export const getServerSideProps = async (context) => {
    console.log(`-------------- Fetching Initial Server List --------------`)
    var piece_list = await prisma.piece.findMany()
    piece_list.sort((a, b) => a['o_id'] - b['o_id']);
  
    return {
      props: {piece_list: piece_list, most_recent_id: piece_list[piece_list.length - 1]['id']}, // will be passed to the page component as props
    }
}