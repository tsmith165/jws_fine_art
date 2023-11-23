import logger from '@/lib/logger';
import PROJECT_CONSTANTS from '@/lib/constants';
import React, { useEffect } from 'react';
import styles from '@/styles/components/OrderTree.module.scss';

const OrderTree = (props) => {
    useEffect(() => {}, []);

    console.log('Generating Order Tree - Data Next Line');
    console.log(props.verified_list);

    const list_items = props.verified_list.map((verified_payment_data) => {
        console.log(`Verified Payment Data (Next Line):`);
        console.log(verified_payment_data);

        let image_url = verified_payment_data['image_path'];
        if (!verified_payment_data['image_path'].includes(PROJECT_CONSTANTS.AWS_BUCKET_URL)) {
            image_url = `${PROJECT_CONSTANTS.AWS_BUCKET_URL}/pieces/${verified_payment_data['image_path'].split('pieces/')[1]}`;
        }

        return (
            <div className={'flex flex-row hover:bg-secondary hover:text-light'} key={verified_payment_data.id || Math.random()}>
                <div className={'bg-secondary'}>
                    <img className={'h-[150px] w-[150px] object-contain'} src={image_url} alt={verified_payment_data['piece_title']} />
                </div>
                <div className={'mb-auto mt-auto w-[30%] overflow-hidden overflow-ellipsis whitespace-nowrap p-2.5 pl-5 text-lg'}>
                    <b className="text-dark">{verified_payment_data['piece_title']}</b>
                </div>
                <div className={'flex w-[70%] flex-col px-2.5 py-1'}>
                    <div className={'mb-auto mt-auto pr-4'}>
                        <div className={'inline-block !w-[100px]'}>
                            <b className={'text-dark'}>Date: </b>
                        </div>
                        <b className="">{verified_payment_data['date']}</b>
                    </div>
                    <div className={'mb-auto mt-auto pr-4'}>
                        <div className={'inline-block !w-[100px]'}>
                            <b className={'text-dark'}>Name: </b>
                        </div>
                        <b className="">{verified_payment_data['full_name']}</b>
                    </div>
                    <div className={'mb-auto mt-auto pr-4'}>
                        <div className={'inline-block !w-[100px]'}>
                            <b className={'text-dark'}>Address: </b>
                        </div>
                        <b className="">{verified_payment_data['address']}</b>
                    </div>
                    <div className={'mb-auto mt-auto pr-4'}>
                        <div className={'inline-block !w-[100px]'}>
                            <b className={'text-dark'}>Phone: </b>
                        </div>
                        <b className="">{verified_payment_data['phone']}</b>
                    </div>
                    <div className={'mb-auto mt-auto pr-4'}>
                        <div className={'inline-block !w-[100px]'}>
                            <b className={'text-dark'}>Email: </b>
                        </div>
                        <b className="">{verified_payment_data['email']}</b>
                    </div>
                    <div className={'mb-auto mt-auto pr-4'}>
                        <div className={'inline-block !w-[100px]'}>
                            <b className={'text-dark'}>Price: </b>
                        </div>
                        <b className="">${verified_payment_data['price']}</b>
                    </div>
                </div>
            </div>
        );
    });

    return (
        <div className={'relative h-full w-full rounded-md border-2 border-secondary bg-primary text-lg'}>
            <div className={'h-full w-full'}>{list_items}</div>
        </div>
    );
};

export default OrderTree;
