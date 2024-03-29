export const metadata = {
    title: 'JWS Fine Art - Admin Management',
    description: 'Jill Weeks Smith Admin Management',
    icons: {
        icon: '/JWS_ICON.png',
    },
}

import PROJECT_CONSTANTS from '@/lib/constants'
import PageLayout from '@/components/layout/PageLayout';
import Manage from '@/app/manage/Manage';

import { prisma } from '@/lib/prisma';

export default async function Page(props) {
    const {piece_list, most_recent_id} = await get_piece_list()

    return (
        <PageLayout {...props}>
            <Manage piece_list={piece_list} most_recent_id={most_recent_id}/>
        </PageLayout>
    )
}

async function fetchPieces() {
    console.log(`Fetching pieces with prisma`)
    var piece_list = await prisma.piece.findMany();
    piece_list.sort((a, b) => a['o_id'] - b['o_id']);

    // Add AWS bucket URL to the image_path if not exists
    piece_list.forEach((piece) => {
        piece.image_path = piece.image_path.includes(PROJECT_CONSTANTS.AWS_BUCKET_URL) ? piece.image_path : `${PROJECT_CONSTANTS.AWS_BUCKET_URL}${piece.image_path}`;
    });
    return piece_list
}

async function get_piece_list() {
console.log("Fetching piece list...")
const piece_list = await fetchPieces()

//console.log(`Found piece_list:`, piece_list)

return {
    "piece_list": piece_list,
    "most_recent_id": piece_list[0]['id']
    }
}