import React from 'react';
import Link from 'next/link';
import { IoIosArrowUp, IoIosArrowDown } from 'react-icons/io';

interface TitleComponentProps {
    title: string;
    next_id: number;
    last_id: number;
}

const TitleComponent: React.FC<TitleComponentProps> = ({ title, next_id, last_id }) => {
    console.log(`Using next id: ${next_id} / last id: ${last_id}`);
    return (
        <div className="flex h-fit flex-row items-center space-x-2 bg-secondary p-2">
            <div className="flex h-[48px] flex-col space-y-1">
                <Link href={`/details/${next_id}`} prefetch={true}>
                    <IoIosArrowUp className="h-[22px] w-8 rounded-md bg-secondary_light fill-primary_dark hover:bg-primary hover:fill-primary_dark" />
                </Link>
                <Link href={`/details/${last_id}`} prefetch={true}>
                    <IoIosArrowDown className="h-[22px] w-8 rounded-md bg-secondary_light fill-primary_dark hover:bg-primary hover:fill-primary_dark" />
                </Link>
            </div>
            <div className="flex flex-grow items-center text-2xl font-bold text-primary">{title}</div>
        </div>
    );
};

export default TitleComponent;
