'use client'

import Image from 'next/image'
import Link from 'next/link'

import PROJECT_CONSTANTS from '@/lib/constants'

import styles from '@/styles/pages/Gallery.module.scss'

const USING_YELLOW_DOT = false;

const Piece = ({ dimensions, id, className, o_id, image_path, title, sold, available }) => {
    var [x, y, img_width, img_height] = dimensions;
    x = (x == null || x < 0) ? 0 : x;

    return (
        <div id={id} className={`${styles.piece_container} ${className}`} style={{width: img_width + 10, height: img_height + 10, top: y, left: x}}>
            <Link href={`/details/${o_id}`}>
                <div className={styles.piece_secondary_container} style={{width: img_width}}>
                    <div className={styles.piece_image_container}>
                        <Image 
                            className={styles.piece_image} 
                            src={`${PROJECT_CONSTANTS.AWS_BUCKET_URL}${image_path}`} 
                            width={img_width} 
                            height={img_height} 
                            style={{width: img_width, height: img_height}} 
                            sizes="(min-width: 768px) 30vw, (max-width: 769px) 45vw"
                            alt={title} 
                        />
                    </div>
                    { 
                    (sold === true) ? (
                        <div className={styles.piece_sold_container}>
                            <Image className={styles.piece_sold} src="/redDot.png" alt="Piece Sold" width={30} height={30} priority={true}/> 
                        </div>
                    ) : ( 
                        (USING_YELLOW_DOT && available === false) ? ( 
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

export default Piece;
