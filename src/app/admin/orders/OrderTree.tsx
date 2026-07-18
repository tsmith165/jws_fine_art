import React from 'react';
import { VerifiedTransactions } from '@/db/schema';

interface OrderTreeProps {
    verified_list: VerifiedTransactions[];
}

const OrderTree: React.FC<OrderTreeProps> = (props) => {
    const list_items = props.verified_list.reverse().map((verified_payment_data) => {
        return (
            <div className={'group hover:bg-secondary_dark flex flex-row'} key={verified_payment_data.id}>
                <div className={'bg-primary_dark'}>
                    <img
                        className={'h-[150px] w-[150px] object-contain'}
                        src={verified_payment_data.image_path}
                        alt={verified_payment_data.piece_title}
                    />
                </div>
                <div className={'mt-auto mb-auto w-[30%] overflow-hidden p-2.5 pl-5 text-lg overflow-ellipsis whitespace-nowrap'}>
                    <b className="text-secondary_dark group-hover:text-primary">{verified_payment_data.piece_title}</b>
                </div>
                <div className={'flex w-[70%] flex-col px-2.5 py-1'}>
                    <div className={'mt-auto mb-auto pr-4'}>
                        <div className={'inline-block !w-[100px]'}>
                            <b className={'text-secondary_dark group-hover:text-primary'}>Date: </b>
                        </div>
                        <b className="text-secondary_dark group-hover:text-primary">{verified_payment_data.date}</b>
                    </div>
                    <div className={'mt-auto mb-auto pr-4'}>
                        <div className={'inline-block !w-[100px]'}>
                            <b className={'text-secondary_dark group-hover:text-primary'}>Name: </b>
                        </div>
                        <b className="text-secondary_dark group-hover:text-primary">{verified_payment_data.full_name}</b>
                    </div>
                    <div className={'mt-auto mb-auto pr-4'}>
                        <div className={'inline-block !w-[100px]'}>
                            <b className={'text-secondary_dark group-hover:text-primary'}>Address: </b>
                        </div>
                        <b className="text-secondary_dark group-hover:text-primary">{verified_payment_data.address}</b>
                    </div>
                    <div className={'mt-auto mb-auto pr-4'}>
                        <div className={'inline-block !w-[100px]'}>
                            <b className={'text-secondary_dark group-hover:text-primary'}>Phone: </b>
                        </div>
                        <b className="text-secondary_dark group-hover:text-primary">{verified_payment_data.phone}</b>
                    </div>
                    <div className={'mt-auto mb-auto pr-4'}>
                        <div className={'inline-block !w-[100px]'}>
                            <b className={'text-secondary_dark group-hover:text-primary'}>Email: </b>
                        </div>
                        <b className="text-secondary_dark group-hover:text-primary">{verified_payment_data.email}</b>
                    </div>
                    <div className={'mt-auto mb-auto pr-4'}>
                        <div className={'inline-block !w-[100px]'}>
                            <b className={'text-secondary_dark group-hover:text-primary'}>Price: </b>
                        </div>
                        <b className="text-secondary_dark group-hover:text-primary">${verified_payment_data.price}</b>
                    </div>
                </div>
            </div>
        );
    });

    return (
        <div className={'border-primary_dark bg-primary relative h-full w-full rounded-md border-2 text-lg'}>
            <div className={'h-full w-full'}>{list_items}</div>
        </div>
    );
};

export default OrderTree;
