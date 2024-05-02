import Image from 'next/image';
import Link from 'next/link';
import PROJECT_CONSTANTS from '@/lib/constants';
import { biographyText } from '@/lib/biographyText';

const { AWS_BUCKET_URL, CONTACT_FULL_NAME, CONTACT_EMAIL } = PROJECT_CONSTANTS;

interface HomepageProps {
    most_recent_id: number | null;
}

function Homepage({ most_recent_id }: HomepageProps) {
    return (
        <div className="flex h-full w-full flex-col bg-secondary_light">
            <div className="flex flex-col items-center justify-center px-0">
                <div className="flex h-fit w-full flex-row items-center justify-center space-x-2.5 py-5">
                    <div className="relative h-fit w-max rounded bg-secondary_dark">
                        <Image
                            className="p-1"
                            width={200}
                            height={267}
                            quality={100}
                            priority
                            src={`${AWS_BUCKET_URL}/site/bio_pic_small.jpg`}
                            alt="Bio Pic"
                        />
                    </div>
                    <div className="flex flex-col items-center justify-center">
                        <div className="font-alegrya-300 flex w-full justify-center">
                            <b className="p-1 text-center text-2xl text-secondary_dark">{CONTACT_FULL_NAME}</b>
                        </div>
                        <div className="font-alegrya-300 flex w-full justify-center">
                            <a className="p-1 text-center text-xl leading-5 text-secondary_dark underline" href={`mailto:${CONTACT_EMAIL}`}>
                                {CONTACT_EMAIL}
                            </a>
                        </div>
                        <div className="mt-5 flex justify-center">
                            <Link href="/gallery">
                                <button className="hover:bg-dark cursor-pointer rounded bg-primary px-4 py-2 text-xl text-primary_dark hover:bg-secondary_dark hover:font-bold hover:text-primary">
                                    Enter Gallery
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex-grow overflow-y-auto">
                <div className="mx-auto w-3/5 px-2.5">
                    {biographyText.map((paragraph, index) => (
                        <p key={index} className="mb-5 p-3.5 text-center text-xl text-secondary_dark">
                            {paragraph}
                        </p>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Homepage;
