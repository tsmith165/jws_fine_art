import React from 'react';
import OrderTree from './OrderTree';
import { SignedIn } from '@clerk/nextjs';
import { VerifiedTransactions } from '@/db/schema';

interface OrdersProps {
    verified_list: VerifiedTransactions[];
}

const Orders: React.FC<OrdersProps> = (props) => {
    return (
        <SignedIn>
            <div className={'h-full w-full overflow-y-auto overflow-x-hidden'}>
                <div className={'p-4'}>
                    <h2 className={'mt-1 text-primary_dark'}>Order Management:</h2>
                    <OrderTree verified_list={props.verified_list} />
                </div>
            </div>
        </SignedIn>
    );
};

export default Orders;
