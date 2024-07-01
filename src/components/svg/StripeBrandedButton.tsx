import React from 'react';
import Link from 'next/link';
import StripeSVG from './StripeSVG';

interface StripeBrandedButtonProps {
    url: string;
    price: string;
    text: string;
    className?: string;
}

const StripeBrandedButton: React.FC<StripeBrandedButtonProps> = ({ url, price, text, className }) => {
    className = className || '';
    if (url === 'submit') {
        return (
            <button type="submit" className="flex items-center space-x-1.5">
                <div className="group flex items-center rounded-lg bg-stone-600 pr-2 font-bold hover:bg-primary">
                    <div
                        className={`flex items-center justify-center rounded-l-lg bg-primary p-1 px-2 text-center font-sans text-lg text-stone-900 group-hover:bg-stone-600 group-hover:font-bold group-hover:text-stone-900 ${className}`}
                    >
                        {`$${price}`}
                    </div>
                    <div className="flex p-1 pl-2">
                        <StripeSVG svg_className="h-7 w-auto" path_className="fill-stone-900 " />
                    </div>
                    <div className="flex p-1 pl-0 font-sans text-lg text-stone-900 ">{text}</div>
                </div>
            </button>
        );
    }
    return (
        <div className="flex items-center space-x-2">
            <Link href={url} prefetch={false}>
                <div className="group flex items-center rounded-lg bg-stone-600 pr-2 font-bold hover:bg-primary">
                    <div
                        className={`flex items-center justify-center rounded-l-lg bg-primary p-1 px-2 text-center font-sans text-lg text-stone-900 group-hover:bg-stone-600 group-hover:font-bold group-hover:text-stone-900 ${className}`}
                    >
                        {`$${price}`}
                    </div>
                    <div className="flex p-1 pl-2">
                        <StripeSVG svg_className="h-7 w-auto" path_className="fill-stone-900" />
                    </div>
                    <div className="flex p-1 pl-0 font-sans text-lg text-stone-900 ">{text}</div>
                </div>
            </Link>
        </div>
    );
};

export default StripeBrandedButton;
