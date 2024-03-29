import PROJECT_CONSTANTS from '@/lib/constants';
import Link from 'next/link';
import Image from 'next/image';

import SiteMenu from './SiteMenu';

const Navbar = () => {
    return (
        <nav className={'min-h-[100px] overflow-hidden bg-secondary p-0'}>
            <div className={'flex flex-row'}>
                <Link href="/gallery">
                    <div className={`!h-full w-[250px] max-w-[250px]`}>
                        <Image
                            className={`max-h-[100px] min-h-[100px] p-2.5`}
                            src="/jws_logo_small.png"
                            alt={`${PROJECT_CONSTANTS.SITE_FULL_NAME} logo`}
                            width={274}
                            height={80}
                            sizes="250px"
                        />
                    </div>
                </Link>
                <div className={'absolute right-0 top-[60px] flex h-[40px] w-fit flex-row md:top-[50px] md:h-[50px]'}>
                    <Link href="https://www.instagram.com/jws_fineart/" target="_blank" rel="noreferrer">
                        <Image
                            className={'w-[40px] rounded-t-md bg-dark p-2 hover:bg-light md:w-[50px]'}
                            src="/instagram_icon_50.png"
                            alt="Instagram Link"
                            width={50}
                            height={50}
                        />
                    </Link>
                    <SiteMenu />
                </div>
            </div>
            <div hidden className="absolute right-0 top-0 w-1/2 overflow-hidden">
                <div
                    className=" mr-10 pr-4 pt-3 text-xl text-red-600"
                    style={{
                        animation: 'slide 15s linear infinite',
                        whiteSpace: 'nowrap',
                    }}
                >
                    20% Off Black Friday Sale Going On Now!
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
