import Image from 'next/image'
import Link from 'next/link'
import styles from '../../../../styles/pages/Gallery.module.scss'

const baseURL = "https://jwsfineartpieces.s3.us-west-1.amazonaws.com";

const Piece = ({id, o_id, myClick, className, image_path, dimensions, title, description, sold, available}) => {
    var [x, y, img_width, img_height] = dimensions;

    if (x == null || x < 0) {
        x = 0;
    }
 
    return (
        <div id={id} className={`${styles.piece_container} ${className}`} style={{width: img_width + 10, height: img_height + 10, top: y, left: x}} /*onClick={myClick}*/>
            <Link href={`/details/${o_id}`}>
                <div className={styles.piece_secondary_container} style={{width: img_width}}>
                    <div className={styles.piece_image_container}>
                        <Image className={styles.piece_image} src={`${baseURL}${image_path}`} width={img_width} height={img_height} alt={title} style={{width: img_width, height: img_height}} sizes="(max-width: 1200px) 50vw, (max-width: 768px) 40vw, 30vw"/>
                    </div>
                    { sold == false ? (
                        ( available == true ? (
                            null
                        ) : (
                            null
                            /*
                            <div className={styles.piece_sold_container}>
                                <Image className={styles.piece_sold} src="/yellowDot.png" alt="Piece Sold" layout='fixed' width={30} height={30}/> 
                            </div>
                            */
                        ))
                    ) : (
                        <div className={styles.piece_sold_container}>
                            <Image className={styles.piece_sold} src="/redDot.png" alt="Piece Sold" width={30} height={30} priority={true}/> 
                        </div>
                    )}
                </div>
            </Link>
        </div>
    )
}

export default Piece;
