import PageLayout from '../../src/components/layout/PageLayout'
import Image from 'next/image'
import React, { useState, useEffect, useRef } from 'react';

import styles from '../../styles/pages/Details.module.scss'
import { prisma } from '../../lib/prisma'

import Link from 'next/link'

import ArrowForwardIosRoundedIcon from '@material-ui/icons/ArrowForwardIosRounded';
import CloseIcon from '@material-ui/icons//Close';

const baseURL = "https://jwsfineartpieces.s3.us-west-1.amazonaws.com";

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

export const getServerSideProps = async (context) => {
    console.log("Getting Server Side Props")
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

const DetailsPage = ({id, pieces}) => {
    var PathOID = id;
    var pieceID = getPieceId(PathOID, pieces);
    console.log(`Piece ID: ${pieceID}`)
    var piece = pieces[pieceID];

    const [full_screen, set_full_screen] = useState(false)

    const pieces_length = pieces.length;
    var next_oid = (pieceID + 1 > pieces_length - 1) ? pieces[0]['o_id']                 : pieces[pieceID + 1]['o_id'];
    var last_oid = (pieceID - 1 < 0)                 ? pieces[pieces_length - 1]['o_id'] : pieces[pieceID - 1]['o_id'];
    
    var sold_html = null;
    if      (piece["sold"] == true) sold_html = <b className={styles.piece_sold}>Sold</b>;
    else if (piece["sold"] == false) { 
        sold_html = (
            <Link href={`/checkout/${PathOID}`}>
                <button className={styles.buy_now_button}>Buy</button>
            </Link>
        );
    }

    const description = piece['description'];
    const description_text = description.split('<br>').join("\n")


    var price_html = null;
    if (piece["sold"] == false) price_html = <b className={styles.price_text}>${piece['price']}</b>;

    return (
        full_screen == true ? (
            <PageLayout page_title={`Piece Details - ${piece['title']}`}>
                <div className={styles.full_screen_container}>
                    <div className={styles.full_screen_image_container}>
                        <Image
                            className={styles.full_screen_image}
                            src={`${baseURL}${piece['image_path']}`}
                            alt={piece['title']}
                            width={piece['width']}
                            height={piece['height']}
                            priority={true}
                            layout='fill'
                            objectFit='contain'
                            quality={100}
                            onClick={(e) => {e.preventDefault(); set_full_screen(true)}}
                        />
                    </div>
                    <div className={styles.full_screen_close_container} onClick={(e) => {e.preventDefault(); set_full_screen(false)}}>
                        <CloseIcon className={`${styles.full_screen_close_icon}`} />
                    </div>
                </div>
            </PageLayout>
        ) : (
            <PageLayout page_title={`Piece Details - ${piece['title']}`}>
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
                                onClick={(e) => {e.preventDefault(); set_full_screen(true)}}
                            />
                        </div>
                    </div>
                    <div className={styles.details_container_right}>
                        <div className={styles.title_container}>
                            <div className={styles.title_inner_container}>
                                <Link href={`/details/${last_oid}`}>
                                    <ArrowForwardIosRoundedIcon className={`${styles.title_arrow} ${styles.img_hor_vert}`} />
                                </Link>
                                <b className={styles.title}>{piece['title']}</b>
                                <Link href={`/details/${next_oid}`}>
                                    <ArrowForwardIosRoundedIcon className={styles.title_arrow}  />
                                </Link>
                            </div>
                        </div>
                        <div className={styles.details_form_container}>
                            <div className={styles.details_navigation_container}>
                                <div className={styles.details_navigation_inner_container}>
                                    {price_html}
                                    {sold_html}
                                    {
                                        (piece["sold"] == true) ? 
                                            (
                                                null
                                            ) : (
                                                <Link href='https://stripe.com'>
                                                    <div className={styles.powered_by_stripe_container}>
                                                        <Image src='/powered_by_stripe_blue_background_small.png' alt='View Stripe Info' priority={true} layout="fill" objectFit='contain'/>
                                                        </div>
                                                </Link>
                                            )
                                    }
                                    {
                                        (piece['instagram'] != null && piece['instagram'] != '') ? (
                                            <Link href={`https://www.instagram.com/${piece['instagram']}`}>
                                                <div className={styles.instagram_link_container}>
                                                    <div className={styles.instagram_image_container}>
                                                        <Image className={styles.instagram_link_image} src='/instagram_icon_100.png' alt='Instagram Link' priority={true} layout="fill" objectFit='contain'/>
                                                    </div>
                                                    <div className={styles.instagram_link_label}>View On Instagram</div>
                                                </div>
                                            </Link>
                                        ) : (
                                            null
                                        )
                                    }
                                </div>
                            </div>
                            <div className={styles.details_description_container}>
                                <h3 className={styles.details_description}>{description_text}</h3>
                            </div>
                        </div>
                    </div>
                </div>
            </PageLayout>
        )
    )
}

export default DetailsPage