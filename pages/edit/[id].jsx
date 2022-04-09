import PageLayout from '../../src/components/layout/PageLayout'
import Image from 'next/image'
import { prisma } from '../../lib/prisma'
import React, { useState, useEffect } from 'react';
import { useSession } from '../../lib/next-auth-react-query';

import styles from '../../styles/Details.module.scss'

import EditDetailsForm from '../../src/components/EditDetailsForm'

import { get_piece_id_from_path_o_id } from '../../lib/helpers'

const baseURL = "https://jwsfineart.s3.us-west-1.amazonaws.com";

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
    for (var i=0; i < pieces.length - offset_for_testing - 1; i++) {
        paths.push({params: {id: pieces[i]['o_id'].toString()}}); 
    }
    return {
        paths: paths,
        fallback: 'blocking'
    }
}

const EditPage = ({id, pieces}) => {
    var PathOID = id;
    var pieceID = get_piece_id_from_path_o_id(PathOID, pieces);
    console.log(`Piece ID: ${pieceID}`)

    const pieces_length = pieces.length;
    var next_oid = (pieceID + 1 > pieces_length - 1) ? pieces[0]['o_id']                 : pieces[pieceID + 1]['o_id'];
    var last_oid = (pieceID - 1 < 0)                 ? pieces[pieces_length - 1]['o_id'] : pieces[pieceID - 1]['o_id'];


    var piece_details = {
        title:       pieces[pieceID]['title'],
        description: pieces[pieceID]['description'],
        sold:        pieces[pieceID]['sold'],
        price:       pieces[pieceID]['price'],
        width:       pieces[pieceID]['width'],
        height:      pieces[pieceID]['height'],
        real_width:  pieces[pieceID]['real_width'],
        real_height: pieces[pieceID]['real_height'],
        image_path:  `${baseURL}${pieces[pieceID]['image_path']}`
    }

    console.log("CURRENT PIECE DETAILS:")
    console.log(piece_details)

    var [piece, set_piece] = useState(piece_details)

    useEffect(() => {
        set_piece(piece_details)
    }, [id, pieces]);

    var [image_url, set_image_url] = useState(piece['image_path'])
    
    useEffect(() => {
        set_image_url(piece['image_path'])
    }, [piece['image_path']]);

    const [session, loading] = useSession({
        required: true,
        queryConfig: {
          staleTime: 60 * 1000 * 60 * 3, // 3 hours
          refetchInterval: 60 * 1000 * 5, // 5 minutes
        },
    });

    var page_jsx = null;
    if (loading) {
        page_jsx = (
            <h1>Loading...</h1>
        );
    } else {
        if (!session) {
            // Session Does Not exist
            page_jsx =  (
                <h1>Not signed in</h1>
            );
        } else {
            // Session Exists
            console.log("Session (Next Line):");
            console.log(session)
    
            console.log(`User Role: ${session.token?.role}`)
    
            if ( !session.token?.role && session.token?.role != 'ADMIN' ) {
                // User Role Token does not exist or User role is not ADMIN
                page_jsx = urn (
                    <h1>Not signed in</h1>
                );
            } else {
                // User Role is Admin
                console.log("LOAD ADMIN PAGE")
            
                console.log(`IMAGE URL : ${image_url}`)
            
                page_jsx =  (
                    <PageLayout>
                        <div className={styles.details_container}>
                            <div className={styles.details_container_left}>
                                <div className={styles.details_image_containter}>
            
                                    <Image
                                        className={styles.details_image}
                                        src={image_url}
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
            
                                <EditDetailsForm 
                                    id={id} 
                                    last_oid={last_oid} 
                                    next_oid={next_oid} 
                                    piece={piece} 
                                    set_piece={set_piece} 
                                    set_image_url={set_image_url}
                                />
            
                            </div>
                        </div>
                    </PageLayout>
                )
            }
        }
    }

    return page_jsx
}

export default EditPage