import Image from 'next/image'
import { prisma } from '../../../lib/prisma'

import PageLayout from '../../../src/components/layout/PageLayout'
import styles from '../../../styles/CheckoutReturn.module.scss'

const baseURL = "https://jwsfineart.s3.us-west-1.amazonaws.com";

function getPieceId(PathOID, pieces) {
    for (var i=0; i < pieces.length; i++) {
        if (pieces[i]['o_id'].toString() == PathOID.toString()) {
            return i
        }
    }
}

async function fetchPieces() {
    console.log(`Fetching pieces with prisma`)
    const pieces = await prisma.piece.findMany({
        orderBy: {
            o_id: 'asc',
        },
    })

    return pieces
}

export const getStaticProps = async (context) => {
    console.log("Getting Static Props")
    const pieces = await fetchPieces()

    //console.log(context)
    return { 
        props: {
            "id": context.params.id, 
            "pieces": pieces
        },
        revalidate: 60
    }
}

export const getStaticPaths = async () => {
    console.log("Getting Static Paths")
    const pieces = await fetchPieces()

    const offset_for_testing = 0;
    
    var paths = [];
    for (var i=0; i < pieces.length - offset_for_testing; i++) {
        paths.push({params: {id: pieces[i]['o_id'].toString()}}); 
    }
    return {
        paths: paths,
        fallback: 'blocking'
    }
}

const CancelPage = ({id, pieces}) => {
    var PathOID = id;
    var pieceID = getPieceId(PathOID, pieces);
    console.log(`Piece ID: ${pieceID}`)
    var piece = pieces[pieceID];

    return (
        <PageLayout>
            <div className={styles.details_container}>
                <div className={styles.details_container_left}>
                    <div className={styles.details_image_container}>
                        <Image
                            className={styles.details_image}
                            src={`${baseURL}${piece['image_path']}`}
                            alt={piece['title']}
                            width={piece['width']}
                            height={piece['height']}
                            priority={true}
                            layout='fill'
                            objectFit='contain'
                            quality={100}
                        />
                    </div>
                </div>
                <div className={styles.details_container_right}>
                    <div className={styles.title_container}>
                        <b className={styles.title}>{piece['title']}</b>
                    </div>
                    <div className={styles.checkout_return_message_container}>
                        <div className={styles.checkout_return_message}>
                            {`Purchase Unsuccessful!` }
                        </div>
                        <div className={styles.checkout_return_message}>
                            {`Try reloading the home page and selecting the piece again.` }
                        </div>
                        <div className={styles.checkout_return_message}>
                            {`If problems persist, feel free to reach out at jwsfineart@gmail.com` }
                        </div>
                    </div>
                </div>
            </div>
        </PageLayout>
    )
}

export default CancelPage