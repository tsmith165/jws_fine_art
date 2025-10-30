import React from 'react';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';

interface PurchaseButtonProps {
    pieceId: number;
}

const PurchaseButton: React.FC<PurchaseButtonProps> = ({ pieceId }) => {
    return (
        <Link href={`/checkout/${pieceId}`} prefetch={false}>
            <button className="group flex h-9 items-center space-x-2 rounded-lg bg-primary/20 px-4 py-2 font-bold text-primary transition-colors duration-300 hover:bg-primary">
                <ShoppingCart className="h-5 w-5 stroke-primary group-hover:stroke-stone-900" />
                <span className="group-hover:text-stone-900">Add to Cart</span>
            </button>
        </Link>
    );
};

export default PurchaseButton;
