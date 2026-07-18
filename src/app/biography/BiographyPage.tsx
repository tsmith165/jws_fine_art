import { BIOGRAPHY_TEXT } from '@/lib/biography_text';
import Biography from './Biography';
import { readHomepageArtworks } from '@/data/artworkReads';

async function fetchImages(limit: number) {
    return readHomepageArtworks(limit);
}

async function fetchBiographyData() {
    const numParagraphs = BIOGRAPHY_TEXT.length;
    const pieces = await fetchImages(numParagraphs);
    return pieces.map((piece, index) => ({
        id: piece.id,
        title: piece.title,
        image_path: piece.image_path,
        width: piece.width,
        height: piece.height,
        bio_paragraph: BIOGRAPHY_TEXT[index],
    }));
}

export default async function HomepagePage() {
    const biographyData = await fetchBiographyData();

    return <Biography biographyData={biographyData} />;
}
