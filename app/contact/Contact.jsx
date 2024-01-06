import PROJECT_CONSTANTS from '@/lib/constants';
import Image from 'next/image';
import styles from '@/styles/pages/Contact.module.scss';

const Contact = () => {
    return (
        <div className={'flex h-full w-full flex-col overflow-y-auto bg-light py-4'}>
            <div className={'flex w-full justify-center pb-1'}>
                <div className={'relative h-fit rounded-md bg-secondary'}>
                    <Image
                        className={'p-1'}
                        src={`${PROJECT_CONSTANTS.AWS_BUCKET_URL}/site/bio_pic_small.jpg`}
                        alt={'Bio Pic'}
                        priority={true}
                        width={200}
                        height={267}
                        quality={100}
                    />
                </div>
            </div>
            <div className={'flex justify-center pb-1'}>
                <b className={'font-lato text-2xl font-[900] text-dark'}>{PROJECT_CONSTANTS.CONTACT_FULL_NAME}</b>
            </div>
            <div className={'flex justify-center'}>
                <a className={'text-center text-blue-500 underline'} href={`mailto:${PROJECT_CONSTANTS.CONTACT_EMAIL}`}>
                    {PROJECT_CONSTANTS.CONTACT_EMAIL}
                </a>
            </div>
        </div>
    );
};

export default Contact;
