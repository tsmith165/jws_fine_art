import Image from 'next/image'
import Link from 'next/link'
import styles from '../../../../styles/pages/Gallery.module.scss'

const SITE_BASE_URL = "https://jwsfineartpieces.s3.us-west-1.amazonaws.com";

// Setting to false as we are not using yello dot for unavailable currently
const USING_YELLOW_DOT = false;

const Piece = ({id, o_id, className, image_path, dimensions, title, description, sold, available}) => {
    var [x, y, img_width, img_height] = dimensions;

    if (x == null || x < 0) {
        x = 0;
    }
 
    return (
        <div id={id} className={`${styles.piece_container} ${className}`} style={{width: img_width + 10, height: img_height + 10, top: y, left: x}}>
            <Link href={`/details/${o_id}`}>
                <div className={styles.piece_secondary_container} style={{width: img_width}}>
                    <div className={styles.piece_image_container}>
                        <Image className={styles.piece_image} src={`${SITE_BASE_URL}${image_path}`} width={img_width} height={img_height} alt={title} style={{width: img_width, height: img_height}} sizes="(min-width: 799px) 30vw, (max-width: 800px) 45vw"/>
                    </div>
                    { 
                    (sold == true) ? (
                        <div className={styles.piece_sold_container}>
                            <Image className={styles.piece_sold} src="/redDot.png" alt="Piece Sold" width={30} height={30} priority={true}/> 
                        </div>
                    ) : ( 
                        (USING_YELLOW_DOT && available == false) ? ( 
                            <div className={styles.piece_sold_container}>
                                <Image className={styles.piece_sold} src="/yellowDot.png" alt="Piece Sold" fill style={{objectFit:"contain"}} width={30} height={30}/> 
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
