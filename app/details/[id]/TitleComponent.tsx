import React from 'react';
import Link from 'next/link';
import { IoIosArrowUp, IoIosArrowDown } from 'react-icons/io';

interface TitleComponentProps {
    title: string;
    piece_list: any[];
    next_oid: string;
    last_oid: string;
}

const TitleComponent: React.FC<TitleComponentProps> = ({ title, piece_list, next_oid, last_oid }) => {
    return (
        <div className="flex h-[58px] items-center justify-between bg-secondary">
            <div className="flex h-[58px] w-full flex-row items-center space-x-4">
                <div className="flex h-[58px] flex-col space-y-1 p-1">
                    <Link href={`/details/${next_oid}`} prefetch={true}>
                        <IoIosArrowUp className="p- h-[22px] w-8 rounded-md bg-secondary_light fill-primary_dark hover:bg-primary hover:fill-primary_dark" />
                    </Link>
                    <Link href={`/details/${last_oid}`} prefetch={true}>
                        <IoIosArrowDown className="h-[22px] w-8 rounded-md bg-secondary_light fill-primary_dark hover:bg-primary hover:fill-primary_dark" />
                    </Link>
                </div>
                <div className="flex flex-grow items-center text-2xl font-bold text-primary">{title}</div>
            </div>
        </div>
    );
};

export default TitleComponent;
