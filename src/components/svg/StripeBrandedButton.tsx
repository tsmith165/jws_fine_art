import React from 'react';
import Link from 'next/link';
import StripeSVG from './StripeSVG';

interface StripeBrandedButtonProps {
    url: string;
    price: string;
    text: string;
}

const StripeBrandedButton: React.FC<StripeBrandedButtonProps> = ({ url, price, text }) => {
    if (url === 'submit') {
        return (
            <button type="submit" className="flex items-center space-x-1.5">
                <div className="group flex items-center rounded-lg bg-primary pr-2 font-bold hover:bg-secondary_dark">
                    <div className="flex items-center rounded-l-lg bg-secondary_dark p-1 px-2 text-lg text-primary group-hover:bg-primary group-hover:font-bold group-hover:text-stone-900">
                        {`$${price}`}
                    </div>
                    <div className="flex p-1 pl-2">
                        <StripeSVG svg_className="h-6 w-auto" path_className="fill-stone-900 group-hover:fill-primary" />
                    </div>
                    <div className="flex p-1 pl-0 font-sans text-stone-900 group-hover:text-primary">{text}</div>
                </div>
            </button>
        );
    }
    return (
        <div className="flex items-center space-x-2">
            <Link href={url} prefetch={false}>
                <div className="group flex items-center rounded-lg bg-primary pr-2 font-bold hover:bg-secondary_dark">
                    <div className="flex items-center rounded-l-lg bg-secondary_dark p-1 px-2 text-lg text-primary group-hover:bg-primary group-hover:font-bold group-hover:text-stone-900">
                        {`$${price}`}
                    </div>
                    <div className="flex p-1 pl-2">
                        <StripeSVG svg_className="h-6 w-auto" path_className="fill-stone-900 group-hover:fill-primary" />
                    </div>
                    <div className="flex p-1 pl-0 font-sans text-stone-900 group-hover:text-primary">{text}</div>
                </div>
            </Link>
        </div>
    );
};

export default StripeBrandedButton;
