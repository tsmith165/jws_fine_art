import React from 'react';
import Image from 'next/image'
import Link from 'next/link'
import styles from '@/styles/pages/Gallery.module.scss'

const AWS_BUCKET_URL = "https://jwsfineartpieces.s3.us-west-1.amazonaws.com";

// Setting to false as we are not using yello dot for unavailable currently
const USING_YELLOW_DOT = false;

class Piece extends React.Component {
    constructor(props) {
        super(props);

    }

    async componentDidMount() {

    }

    render() {
        var [x, y, img_width, img_height] = this.props.dimensions;
        x = (x == null || x < 0) ? 0 : x;
     
        return (
            <div id={this.props.id} className={`${styles.piece_container} ${this.props.className}`} style={{width: img_width + 10, height: img_height + 10, top: y, left: x}}>
                <Link href={`/details/${this.props.o_id}`}>
                    <div className={styles.piece_secondary_container} style={{width: img_width}}>
                        <div className={styles.piece_image_container}>
                            <Image 
                                className={styles.piece_image} 
                                src={`${AWS_BUCKET_URL}${this.props.image_path}`} 
                                width={img_width} 
                                height={img_height} 
                                style={{width: img_width, height: img_height}} 
                                sizes="(min-width: 799px) 30vw, (max-width: 800px) 45vw"
                                alt={this.props.title} 
                            />
                        </div>
                        { 
                        (this.props.sold == true) ? (
                            <div className={styles.piece_sold_container}>
                                <Image className={styles.piece_sold} src="/redDot.png" alt="Piece Sold" width={30} height={30} priority={true}/> 
                            </div>
                        ) : ( 
                            (USING_YELLOW_DOT && this.props.available == false) ? ( 
                                <div className={styles.piece_sold_container}>
                                    <Image className={styles.piece_sold} src="/yellowDot.png" alt="Piece Sold" layout='fixed' width={30} height={30}/> 
                                </div>
                            ) : (
                                null
                            ))
                        }
                    </div>
                </Link>
            </div>
        )
    }
}

export default Piece;
