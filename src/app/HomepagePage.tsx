import { BIOGRAPHY_TEXT } from '@/lib/biography_text';
import Homepage from './Homepage';
import GallerySection from '@/components/gallery/GallerySection';
import { readHomepageArtworks } from '@/data/artworkReads';

async function fetchHomepageImages(limit: number) {
    return readHomepageArtworks(limit);
}

async function fetchHomepageData() {
    const numParagraphs = BIOGRAPHY_TEXT.length;
    const homepage_pieces = await fetchHomepageImages(numParagraphs);
    return homepage_pieces.map((piece, index) => ({
        id: piece.id,
        title: piece.title,
        image_path: piece.image_path,
        width: piece.width,
        height: piece.height,
        bio_paragraph: BIOGRAPHY_TEXT[index],
    }));
}

interface HomepagePageProps {
    initialPieceId?: string;
}

export default async function HomepagePage({ initialPieceId }: HomepagePageProps) {
    const homepageData = await fetchHomepageData();

    return (
        <>
            <Homepage homepageData={homepageData} />
            <GallerySection initialPieceId={initialPieceId} />
        </>
    );
}
