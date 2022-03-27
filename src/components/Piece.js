import Image from 'next/image'
import Link from 'next/link'
import styles from '../../styles/Home.module.scss'

const baseURL = "https://jwsfineart.s3.us-west-1.amazonaws.com";

const Piece = ({key, id, o_id, myClick, className, image_path, dimensions, title, description, sold}) => {
    var [x, y, img_width, img_height] = dimensions;

    return (
        <div id={id} className={`${styles.piece_container} ${className}`} style={{width: img_width + 10, height: img_height + 10, top: y, left: x}} /*onClick={myClick}*/>
            <Link href={`/details/${o_id}`} passHref={true}>
                <div className={styles.piece_secondary_container} style={{width: img_width}}>
                    <div className={styles.piece_image_container}>
                        <Image className={styles.piece_image} src={`${baseURL}${image_path}`} layout='fixed' width={img_width} height={img_height} alt={title}/>
                    </div>
                    { sold == false ? null :
                    <div className={styles.piece_sold_container}>
                        <Image className={styles.piece_sold} src="/redDot.png" width={30} height={30}/> 
                    </div>
                    }
                </div>
            </Link>
        </div>
    )
}

export default Piece;
