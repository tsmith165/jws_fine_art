import PageLayout from '../../src/components/layout/PageLayout'
import Image from 'next/image'

import styles from '../../styles/Details.module.scss'

import { useEffect } from 'react'
import { useRouter } from 'next/router'

import { useQuery, useMutation, queryCache } from 'react-query';

import ArrowForwardIosRoundedIcon from '@material-ui/icons/ArrowForwardIosRounded';
import ArrowBackRoundedIcon from '@material-ui/icons/ArrowBackRounded';

const { URL } = process.env;

const baseURL = "https://jwsfineart.sfo2.digitaloceanspaces.com"

function getPiece(PathOID, pieces) {
    for (var i=0; i < pieces.length; i++) {
        if (pieces[i]['o_id'].toString() == PathOID.toString()) {
            return pieces[i]
        }
    }
}

function findNextPiece(dir, curOID, pieces) {
    //console.log("Pieces:")
    //console.log(pieces)
    //console.log(`Cur OID: ${curOID}`)

    for (var i=0; i < pieces.length; i++) {
        if (pieces[i]['o_id'].toString() == curOID.toString()) {
            console.log(`Cur INDEX: ${i}`)
            var newID = (dir == true) ? (i - 1) : (i + 1)
            if (newID >= pieces.length || newID < 0) {
                newID = (dir == true) ? (pieces.length - 1) : 0 
            }
            return pieces[newID]
        }
    }
}

function nextClicked(dir, curOID, pieces, router) {
    const nextPiece = findNextPiece(dir, curOID, pieces)
    //console.log(`New Piece:`)
    //console.log(nextPiece)
    const newOID = nextPiece['o_id']

    router.push(`/details/${newOID}`)
}

function editClicked(piece) {
    //console.log("Editing Piece (Next Line):")
    //console.log(piece)
}

function buyClicked() {
    //console.log("Buying...")
}

function buttonHover(e, mouse_in, color_1, color_2, stroke=false ) {
    if (mouse_in) {
        if (stroke == false) e.currentTarget.style = `fill: ${color_2} !important; background-color: ${color_1};`
        else                 e.currentTarget.style = `fill: ${color_2} !important; stroke: ${color_1};`
    }
    else {
        if (stroke == false) e.currentTarget.style = `fill: ${color_2} !important; background-color: ${color_1} ;`
        else                 e.currentTarget.style = `fill: ${color_2} !important; stroke: ${color_1};`
    }
}


async function fetchPieces() {
    const response = await fetch(`${URL}/api/pieces`);
    const data = await response.json()
    const pieces = data["pieces"];
    return pieces;
}

export const getStaticProps = async (context) => {
    console.log("Getting Static Props")
    const pieces = await fetchPieces()

    //console.log(context)
    return { props: {"id": context.params.id, "pieces": pieces} }
    //return { props: {"id": context.params.id} }
}

export const getStaticPaths = async () => {
    console.log("Getting Static Paths")
    const pieces = await fetchPieces()
    
    var paths = [];
    for (var i=0; i < pieces.length; i++) {
        paths.push({params: {id: pieces[i]['o_id'].toString()}}); 
    }
    return {
        paths: paths,
        fallback:false
    }
}

const DetailsPage = ({id, pieces}) => {
    var PathOID = id;
    var piece = getPiece(PathOID, pieces);
    const router = useRouter()

    var sold_html = null;
    if      (piece["sold"] == "True")  sold_html = <b className={styles.pieceSold}>Sold</b>;
    else if (piece["sold"] == "False") sold_html = <button className={styles.buyButton} onClick={buyClicked()}>Buy Now</button>
    else if (piece["sold"] == "NFS")   sold_html = <b className={styles.pieceNFS}>Not For Sale</b>;

    var price_html = null;
    if (piece["sold"] == "False") price_html = <b className={styles.priceText}>${piece['price']}</b>;

    return (
        <PageLayout>
            <div className={styles.detailsContainer}>
                <div className={styles.detailsContainerLeft}>
                    <Image
                        className={styles.detailsImage}
                        src={`${baseURL}${piece['image_path']}`}
                        alt={piece['title']}
                        width={piece['width']}
                        height={piece['height']}
                        priority={true}
                    />
                </div>
                <div className={styles.detailsContainerRight}>
                    <div className={styles.detailsTitleContainer}>
                        <ArrowForwardIosRoundedIcon className={`${styles.detailsTitleArrow} ${styles.imgHorVert}`}
                                                            onClick={() => nextClicked(false, piece['o_id'], pieces, router)}
                                                            onMouseOver={ e => {buttonHover(e, true, "#425D76", "#30332E")}}
                                                            onMouseOut={ e => {buttonHover(e, false, "#30332E", "#597D9F")}} />
                        <b className={styles.detailsTitle}>{piece['title']}</b>
                        <ArrowForwardIosRoundedIcon className={styles.detailsTitleArrow}
                                                        onClick={() => nextClicked(true, piece['o_id'], pieces, router)}
                                                        onMouseOver={ e => {buttonHover(e, true, "#425D76", "#30332E")}}
                                                        onMouseOut={ e => {buttonHover(e, false, "#30332E", "#597D9F")}}  />
                    </div>
                    <div className={styles.detailsDescriptionContainer}>
                        <h3 className={styles.detailsDescription}>{piece['description'].replace("<br>", "\n")}</h3>
                    </div>
                    <div className={styles.detailsNavigationContainer}>
                        <button className={styles.editButton} onClick={editClicked(piece)}>Edit Piece</button>
                        {sold_html}
                        {price_html}
                    </div>
                </div>
            </div>
        </PageLayout>
    )
}

export default DetailsPage