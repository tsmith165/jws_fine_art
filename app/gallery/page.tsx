import { prisma } from '@/lib/prisma';
import { Piece as PieceType } from '@prisma/client';
import Gallery from './Gallery';
import FilterMenu from '@/components/layout/FilterMenu';
import PageLayout from '@/components/layout/PageLayout';

export const metadata = {
  title: 'JWS Fine Art - Gallery',
  description: 'Gallery page for JWS Fine Art',
  icons: {
    icon: '/JWS_ICON.png',
  },
};

async function fetchPieces(): Promise<PieceType[]> {
  const pieces = await prisma.piece.findMany({
    orderBy: {
      o_id: 'desc',
    },
  });
  return pieces;
}

export default async function Page() {
  const pieces = await fetchPieces();

  return (
    <PageLayout page='/gallery'>
      <FilterMenu />
      <Gallery pieces={pieces} />
    </PageLayout>
  );
}
