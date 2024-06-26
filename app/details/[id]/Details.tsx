import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import PieceSpecificationTable from '@/app/details/[id]/PieceSpecificationTable';
import TitleComponent from '@/app/details/[id]/TitleComponent';
import StripeBrandedButton from '@/components/svg/StripeBrandedButton';
import EditPieceButton from '@/app/details/[id]/EditPieceButton';

interface DetailsProps {
    pieceData: any;
    selectedIndex: number;
    type: string;
}

const Details: React.FC<DetailsProps> = ({ pieceData, selectedIndex, type }) => {
    const description_raw = pieceData?.description?.length > 2 ? pieceData?.description : '';
    const db_id = pieceData?.id ?? -1;
    const o_id = pieceData?.o_id ?? '';
    const title = pieceData?.title ?? '';
    const price = pieceData?.price ?? '';
    const width = pieceData?.width ?? 0;
    const height = pieceData?.height ?? 0;
    const theme = pieceData?.theme ?? 'None';
    const framed = pieceData?.framed === true ? 'True' : pieceData?.framed === false ? 'False' : '';
    const sold = pieceData?.sold === true ? 'True' : pieceData?.sold === false ? 'False' : '';
    const available = pieceData?.available === true ? 'True' : pieceData?.available === false ? 'False' : '';
    const piece_type = pieceData?.piece_type ?? '';
    const comments = pieceData?.comments ?? '';
    const description = description_raw.split('<br>').join('\n');
    const real_width = pieceData?.real_width ?? '';
    const real_height = pieceData?.real_height ?? '';
    const image_path = pieceData?.image_path ?? '';
    const instagram = pieceData?.instagram ?? '';

    const extra_images = pieceData?.extraImages || [];
    const progress_images = pieceData?.progressImages || [];

    const using_extra_images = [
        { image_path: image_path, width, height },
        ...extra_images.map((image: any) => ({
            image_path: image.image_path,
            width: image.width,
            height: image.height,
        })),
    ];
    const using_progress_images = progress_images.map((image: any) => ({
        image_path: image.image_path,
        width: image.width,
        height: image.height,
    }));

    const sold_text = sold.toLowerCase() === 'true' ? 'Sold' : available.toLowerCase() === 'false' ? 'Not For Sale' : '';

    const allImages = [...using_extra_images, ...using_progress_images];

    const mainImage = allImages[selectedIndex];
    const extraImagesCard = (
        <div className="relative z-0 flex min-w-[300px] flex-col">
            <div className="relative z-0 rounded-t-md bg-primary">
                <div className="flex pt-1">
                    {using_extra_images.length !== 0 && (
                        <Link
                            href={`/details/${db_id}?type=gallery`}
                            className={`rounded-t-md px-2 py-1 ${
                                type === 'gallery'
                                    ? 'bg-secondary text-primary'
                                    : 'bg-secondary_light text-primary_dark hover:bg-secondary hover:text-primary'
                            }`}
                            prefetch={false}
                        >
                            Gallery Images
                        </Link>
                    )}
                    {using_progress_images.length !== 0 && (
                        <Link
                            href={`/details/${db_id}?type=progress`}
                            className={`rounded-t-md px-2 py-1 ${
                                type === 'progress'
                                    ? 'bg-secondary text-primary'
                                    : 'bg-secondary_light text-primary_dark hover:bg-secondary hover:text-primary'
                            }`}
                            prefetch={false}
                        >
                            Progress Images
                        </Link>
                    )}
                </div>
            </div>
            <div className="relative z-0 h-fit overflow-y-hidden overflow-x-scroll rounded-b-md bg-secondary_dark">
                <div className="flex min-h-[120px] w-fit flex-row space-x-2 p-2">
                    {type === 'gallery' &&
                        using_extra_images.map((image: any, index: number) => (
                            <Link
                                key={`extra_image_container_${index}`}
                                href={`/details/${db_id}?selected=${index}&type=gallery`}
                                prefetch={false}
                                className={`${
                                    selectedIndex === index ? 'bg-primary' : 'bg-primary_dark'
                                } flex h-[110px] max-h-[110px] min-h-[110px] w-[110px] min-w-[110px] max-w-[110px] items-center justify-center rounded-md p-1`}
                            >
                                {image.image_path === null || image.image_path === undefined || image.image_path === '' ? null : (
                                    <Image
                                        src={image.image_path}
                                        alt=""
                                        width={110}
                                        height={110}
                                        quality={75}
                                        className="h-full w-full object-contain"
                                        sizes="110px"
                                    />
                                )}
                            </Link>
                        ))}
                    {type === 'progress' &&
                        using_progress_images.length !== 0 &&
                        using_progress_images.map((image: any, index: number) => {
                            return (
                                <Link
                                    key={`progress_image_${index}`}
                                    href={`/details/${db_id}?selected=${using_extra_images.length + index}&type=progress`}
                                    prefetch={false}
                                    className={`${
                                        selectedIndex === index ? 'bg-primary' : 'bg-primary_dark'
                                    } flex max-h-[110px] min-h-[110px] min-w-[110px] max-w-[110px] items-center justify-center rounded-md p-1`}
                                >
                                    {image.image_path === null || image.image_path === undefined || image.image_path === '' ? null : (
                                        <Image
                                            src={image.image_path}
                                            alt=""
                                            width={110}
                                            height={110}
                                            quality={75}
                                            className="h-full w-full object-contain"
                                            placeholder="blur"
                                            sizes="110px"
                                        />
                                    )}
                                </Link>
                            );
                        })}
                </div>
            </div>
        </div>
    );

    return (
        <div className="relative z-0 flex h-[calc(100dvh-80px)] w-full flex-col lg:flex-row">
            <div className="relative z-0 flex h-1/2 w-full flex-col bg-secondary_dark md:h-3/5 lg:h-full lg:w-[65%]">
                <div className={`flex h-full max-w-full items-center justify-center`}>
                    <div className="flex h-full w-full items-center justify-center">
                        <Image
                            src={mainImage.image_path}
                            alt={title}
                            quality={70}
                            priority
                            sizes="(max-width: 640px) 100vw, 66vw"
                            width={mainImage.width}
                            height={mainImage.height}
                            className="h-full w-full object-contain"
                        />
                    </div>
                </div>
            </div>
            <div className="relative z-0 flex h-1/2 w-full flex-col overflow-x-hidden bg-secondary_light md:h-2/5 lg:h-full lg:w-[35%]">
                <TitleComponent title={title ? `"${title}"` : ''} next_id={pieceData?.next_id} last_id={pieceData?.last_id} />

                <div className="flex w-full flex-col space-y-2 overflow-y-auto rounded-md p-2">
                    <div className="flex max-w-full flex-row space-x-1.5">
                        {sold_text === '' ? (
                            <StripeBrandedButton url={'/checkout/' + db_id} price={price} text="Checkout" />
                        ) : (
                            <div className="py-1 text-xl font-[600] text-red-800">{sold_text}</div>
                        )}
                        {instagram === null || instagram === '' || instagram.length <= 5 ? null : (
                            <Link
                                className="flex items-center justify-center rounded-md bg-secondary_dark p-1.5 hover:bg-secondary_light"
                                href={`https://www.instagram.com/p/${instagram}`}
                                prefetch={false}
                            >
                                <Image
                                    src="/icon/instagram_icon_100.png"
                                    alt="Instagram Link"
                                    priority
                                    width={25}
                                    height={25}
                                    className="h-6 w-6"
                                />
                            </Link>
                        )}
                        <EditPieceButton db_id={db_id} />
                    </div>

                    {extraImagesCard}

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
