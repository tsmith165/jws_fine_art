import logger from "@/lib/logger";
import React, { Component } from 'react';
import styles from '@/styles/components/TitleComponent.module.scss';
import ArrowForwardIosRoundedIcon from '@mui/icons-material/ArrowForwardIosRounded';

class TitleComponent extends Component {
  render() {
    const { title, piece_list, next_oid, last_oid, update_current_piece} = this.props;

    const backward_arrow = (          
      <ArrowForwardIosRoundedIcon className={`${styles.title_arrow} ${styles.img_hor_vert}`}
        onClick={(e) => {
          e.preventDefault();
          update_current_piece(piece_list, next_oid);
        }}
      />
    )

    const forward_arrow = (          
      <ArrowForwardIosRoundedIcon className={`${styles.title_arrow}`}
        onClick={(e) => {
          e.preventDefault();
          update_current_piece(piece_list, last_oid);
        }}
      />
    )

    return (
      <div className={styles.title_container}>
        <div className={styles.title_inner_container}>
          {backward_arrow}
          <div className={styles.title}>{title === '' ? '' : `"${title}"`}</div>
          {forward_arrow}
        </div>
      </div>
    );
  }
}

export default TitleComponent;
