import PageLayout from '../../src/components/layout/PageLayout'
import Image from 'next/image'

import styles from '../../styles/Details.module.scss'
import { prisma } from '../../lib/prisma'

import Link from 'next/link'

import ArrowForwardIosRoundedIcon from '@material-ui/icons/ArrowForwardIosRounded';
import ArrowBackRoundedIcon from '@material-ui/icons/ArrowBackRounded';

//const baseURL = "https://jwsfineart.sfo2.digitaloceanspaces.com";
const baseURL = "https://jwsfineart.s3.us-west-1.amazonaws.com";

function getPieceId(PathOID, pieces) {
    for (var i=0; i < pieces.length; i++) {
        if (pieces[i]['o_id'].toString() == PathOID.toString()) {
            return i
        }
    }
}

function editClicked(piece) {
    //console.log("Editing Piece (Next Line):")
    //console.log(piece)
}

function buyClicked() {
    //console.log("Buying...")
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

const DetailsPage = ({id, pieces}) => {
    var PathOID = id;
    var pieceID = getPieceId(PathOID, pieces);
    console.log(`Piece ID: ${pieceID}`)
    var piece = pieces[pieceID];

    const pieces_length = pieces.length;
    var next_oid = (pieceID + 1 > pieces_length - 1) ? pieces[0]['o_id']                 : pieces[pieceID + 1]['o_id'];
    var last_oid = (pieceID - 1 < 1)                 ? pieces[pieces_length - 1]['o_id'] : pieces[pieceID - 1]['o_id'];
    
    var sold_html = null;
    if      (piece["sold"] == true) sold_html = <b className={styles.pieceSold}>Sold</b>;
    else if (piece["sold"] == false) { 
        sold_html = (
            <Link href={`/checkout/${PathOID}`} passHref={true}>
                <button className={styles.buy_now_button}>Buy Now</button>
            </Link>
        );
    }

    var price_html = null;
    if (piece["sold"] == false) price_html = <b className={styles.priceText}>${piece['price']}</b>;

    return (
        <PageLayout>
            <div className={styles.detailsContainer}>
                <div className={styles.detailsContainerLeft}>
                    <div className={styles.detailsImageContainter}>
                        <Image
                            className={styles.detailsImage}
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
                <div className={styles.detailsContainerRight}>
                    <div className={styles.detailsTitleContainer}>
                        <Link href={`/details/${last_oid}`} passHref={true}>
                            <ArrowForwardIosRoundedIcon className={`${styles.detailsTitleArrow} ${styles.imgHorVert}`} />
                        </Link>
                        <b className={styles.detailsTitle}>{piece['title']}</b>
                        <Link href={`/details/${next_oid}`} passHref={true}>
                            <ArrowForwardIosRoundedIcon className={styles.detailsTitleArrow}  />
                        </Link>
                    </div>
                    <div className={styles.detailsDescriptionContainer}>
                        <h3 className={styles.detailsDescription}>{piece['description'].replaceAll("<br>", "\n")}</h3>
                    </div>
                    <div className={styles.detailsNavigationContainer}>
                        {sold_html}
                        {price_html}
                    </div>
                </div>
            </div>
        </PageLayout>
    )
}

export default DetailsPage