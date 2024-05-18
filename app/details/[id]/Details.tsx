import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { SignedIn } from '@clerk/nextjs';

import PieceSpecificationTable from '@/app/details/[id]/PieceSpecificationTable';
import TitleComponent from '@/app/details/[id]/TitleComponent';

import StripeBrandedButton from '@/components/svg/StripeBrandedButton';

interface DetailsProps {
    piece_list: any[];
    current_id: number;
    selectedIndex: number;
    type: string;
}

const fetchImageData = async (imagePath: string) => {
    const res = await fetch(imagePath);
    const imageData = await res.arrayBuffer();
    return imageData;
};

const Details: React.FC<DetailsProps> = async ({ piece_list, current_id, selectedIndex, type }) => {
    const passed_o_id = current_id;
    console.log(`LOADING DETAILS PAGE - Piece ID: ${passed_o_id}`);

    const num_pieces = piece_list?.length || 0;
    let piece_position = 0;

    for (let i = 0; i < piece_list.length; i++) {
        if (piece_list[i]['o_id'].toString() === passed_o_id.toString()) {
            piece_position = i;
        }
    }
    const current_piece = piece_list[piece_position];

    const description_raw = current_piece?.description?.length > 2 ? current_piece.description : '';
    const db_id = current_piece?.id ?? -1;
    const o_id = current_piece?.o_id ?? '';
    const title = current_piece?.title ?? '';
    const price = current_piece?.price ?? '';
    const width = current_piece?.width ?? '';
    const height = current_piece?.height ?? '';
    const theme = current_piece?.theme ?? 'None';
    const framed = current_piece?.framed === true || current_piece.framed.toString().toLowerCase() === 'true' ? 'True' : 'False';
    const sold = current_piece?.sold === true || current_piece.sold.toString().toLowerCase() === 'true' ? 'True' : 'False';
    const available = current_piece?.available === true || current_piece.sold.toString().toLowerCase() === 'true' ? 'True' : 'False';
    const piece_type = current_piece?.piece_type ?? '';
    const comments = current_piece?.comments ?? '';
    const description = description_raw.split('<br>').join('\n');
    const real_width = current_piece?.real_width ?? '';
    const real_height = current_piece?.real_height ?? '';
    const image_path = current_piece.image_path;
    const instagram = current_piece?.instagram ?? '';

    const extra_images = [undefined, null, ''].includes(current_piece.extra_images) ? [] : JSON.parse(current_piece.extra_images);
    console.log(`Using Extra Images: "${extra_images}"`);

    const progress_images = [undefined, null, ''].includes(current_piece.progress_images) ? [] : JSON.parse(current_piece.progress_images);
    console.log(`Using Progress Images: "${progress_images}"`);

    const nextPiece = piece_position + 1 < num_pieces ? piece_list[piece_position + 1] : null;
    const prevPiece = piece_position - 1 >= 0 ? piece_list[piece_position - 1] : null;

    const next_oid = nextPiece ? nextPiece.o_id : null;
    const last_oid = prevPiece ? prevPiece.o_id : null;

    const using_extra_images = [
        { src: image_path, width, height },
        ...extra_images.map((image: any) => ({
            src: image.image_path,
            width: image.width,
            height: image.height,
        })),
    ];
    const using_progress_images = progress_images;

    console.log(`Using Extra Images: ${using_extra_images.length !== 0} | Using Progress Images: ${using_progress_images.length !== 0}`);

    const sold_text = sold.toLowerCase() === 'true' ? 'Sold' : available.toLowerCase() === 'false' ? 'Not For Sale' : '';

    const allImages = [
        ...using_extra_images,
        ...using_progress_images.map((image: any) => ({
            src: image.image_path,
            width: image.width,
            height: image.height,
        })),
    ];

    console.log(`Type: '${type}'`);

    const mainImage = allImages[selectedIndex];

    const preloadNextAndPrevImages = async () => {
        if (nextPiece) {
            await fetchImageData(nextPiece.image_path);
            if (nextPiece.extra_images) {
                const extraImages = JSON.parse(nextPiece.extra_images);
                await Promise.all(extraImages.map((image: any) => fetchImageData(image.image_path)));
            }
        }

        if (prevPiece) {
            await fetchImageData(prevPiece.image_path);
            if (prevPiece.extra_images) {
                const extraImages = JSON.parse(prevPiece.extra_images);
                await Promise.all(extraImages.map((image: any) => fetchImageData(image.image_path)));
            }
        }
    };

    await preloadNextAndPrevImages();

    const extraImagesCard = (
        <div className="flex min-w-[300px] flex-col">
            <div className="text-dark rounded-t-md bg-primary text-lg font-bold">
                <div className="flex pt-1">
                    {using_extra_images.length !== 0 && (
                        <Link
                            href={`/details/${current_id}?type=gallery`}
                            className={`rounded-t-md px-2 py-1 ${
                                type === 'gallery'
                                    ? 'bg-secondary text-primary'
                                    : 'bg-secondary_light text-primary_dark hover:bg-secondary hover:text-primary'
                            }`}
                        >
                            Gallery Images
                        </Link>
                    )}
                    {using_progress_images.length !== 0 && (
                        <Link
                            href={`/details/${current_id}?type=progress`}
                            className={`rounded-t-md px-2 py-1 ${
                                type === 'progress'
                                    ? 'bg-secondary text-primary'
                                    : 'bg-secondary_light text-primary_dark hover:bg-secondary hover:text-primary'
                            }`}
                        >
                            Progress Images
                        </Link>
                    )}
                </div>
            </div>
            <div className="h-fit rounded-b-md bg-secondary_dark">
                <div className="flex max-h-full w-full flex-row p-2">
                    <div className="flex h-[120px] w-full flex-row space-x-[5px]">
                        {type === 'gallery' &&
                            using_extra_images.map((image: any, index: number) => (
                                <Link
                                    key={`extra_image_container_${index}`}
                                    href={`/details/${current_id}?selected=${index}&type=gallery`}
                                    className={`relative mr-[5px] h-[120px] w-[120px] overflow-hidden rounded-md ${
                                        selectedIndex === index ? 'bg-primary' : 'bg-primary_dark'
                                    }`}
                                    prefetch={true}
                                >
                                    <div className="m-[5px] flex h-[110px] w-[110px] items-center justify-center">
                                        <Image
                                            src={image.src}
                                            priority
                                            alt=""
                                            width={image.width}
                                            height={image.height}
                                            quality={100}
                                            className="max-h-full max-w-full object-contain"
                                        />
                                    </div>
                                </Link>
                            ))}
                        {type === 'progress' &&
                            using_progress_images.length !== 0 &&
                            using_progress_images.map((image: any, index: number) => {
                                return (
                                    <Link
                                        key={`progress_image_${index}`}
                                        href={`/details/${current_id}?selected=${using_extra_images.length + index}&type=progress`}
                                        className={`relative mr-[5px] h-[110px] w-[110px] overflow-hidden rounded-md ${
                                            selectedIndex === using_extra_images.length + index ? 'bg-primary' : 'bg-primary_dark'
                                        }`}
                                        prefetch={true}
                                    >
                                        <div className="m-[5px] flex h-[100px] w-[100px] items-center justify-center">
                                            <Image src={image.src} alt="" width={image.width} height={image.height} quality={100} />
                                        </div>
                                    </Link>
                                );
                            })}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex h-full w-full flex-col lg:flex-row">
            <div className="flex h-3/5 w-full flex-col bg-secondary_dark lg:h-full lg:w-[65%]">
                {/* Main Image */}
                <div className={`flex h-full max-w-full items-center justify-center`}>
                    <div className="flex h-full w-full items-center justify-center">
                        <Image
                            src={mainImage.src}
                            alt={title}
                            quality={100}
                            priority
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            width={mainImage.width}
                            height={mainImage.height}
                            className="h-full w-full object-contain"
                        />
                    </div>
                </div>
            </div>
            <div className="flex h-2/5 w-full flex-col bg-secondary_light lg:h-full lg:w-[35%]">
                <TitleComponent title={title ? `"${title}"` : ''} piece_list={piece_list} next_oid={next_oid} last_oid={last_oid} />

                <div className="flex w-full flex-col space-y-2 overflow-y-auto rounded-md p-2">
                    <div className="flex flex-row space-x-1.5">
                        {sold_text === '' ? (
                            <StripeBrandedButton url={'/checkout/' + current_id} price={price} text="Checkout" />
                        ) : (
                            <div className="py-1 text-xl font-[600] text-red-800">{sold_text}</div>
                        )}
                        {instagram === null || instagram === '' || instagram.length <= 5 ? null : (
                            <Link
                                className="flex items-center justify-center rounded-md bg-secondary_dark p-1.5 hover:bg-secondary_light"
                                href={`https://www.instagram.com/p/${instagram}`}
                            >
                                <Image
                                    src="/instagram_icon_100.png"
                                    alt="Instagram Link"
                                    priority
                                    width={25}
                                    height={25}
                                    className="h-6 w-6"
                                />
                            </Link>
                        )}
                        <SignedIn>
                            <Link href={`/edit/${current_id}`} className="flex h-full w-fit">
                                <div className="flex h-full items-center justify-center rounded-md border-2 border-primary_dark bg-primary px-3 font-bold text-secondary_dark hover:border-primary hover:bg-secondary_dark hover:text-primary">
                                    Edit Piece
                                </div>
                            </Link>
                        </SignedIn>
                    </div>

                    {(using_extra_images.length > 0 || using_progress_images.length > 0) && extraImagesCard}

                    <PieceSpecificationTable
                        realWidth={real_width}
                        realHeight={real_height}
                        framed={framed}
                        comments={comments}
                        piece_type={piece_type}
                        with_header={false}
                    />
                    {description === null || description.length <= 2 ? null : (
                        <div className="px-2.5 py-2.5">
                            <h3 className="whitespace-pre-wrap text-lg font-[600] text-primary_dark">{description}</h3>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Details;
