import logger from '@/lib/logger';

import React from 'react';
import { withRouter } from 'next/router'

import { prisma } from '@/lib/prisma'

import PageLayout from '@/components/layout/PageLayout'
import Checkout from '@/components/pages/checkout/Checkout';

class CheckoutPage extends React.Component {
  constructor(props) {
      super(props);

      this.page_title = "Checkout"
  }

  async componentDidMount() { }

  render() {
    return ( 
      <PageLayout page_title={this.page_title}>
        <Checkout id={this.props.router.query.id} piece_list={this.props.piece_list} router={this.props.router}/> 
      </PageLayout>
    )
  }
}

export default withRouter(CheckoutPage)

export const getServerSideProps = async (context) => {
  logger.section({message: `Fetching Initial Server List`})

  var piece_list = await prisma.piece.findMany()
  piece_list.sort((a, b) => a['o_id'] - b['o_id']);

  return {
    props: { // will be passed to the page component as props
      piece_list: piece_list, 
      most_recent_id: piece_list[piece_list.length - 1]['id']}, 
  }
}