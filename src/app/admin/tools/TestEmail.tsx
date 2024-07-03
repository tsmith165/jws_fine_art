import { useState } from 'react';
import { sendTestCheckoutEmail } from './actions';
import InputTextbox from '@/components/inputs/InputTextbox';

const TestEmail: React.FC = () => {
    const [testEmailData, setTestEmailData] = useState({
        to: '',
        pieceTitle: '',
        fullName: '',
        address: '',
        pricePaid: 0,
    });
    const [testEmailStatus, setTestEmailStatus] = useState<'success' | 'error' | null>(null);
    const [isEmailSending, setIsEmailSending] = useState(false);

    const handleTestEmailChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setTestEmailData((prevData) => ({
            ...prevData,
            [e.target.name]: e.target.name === 'pricePaid' ? (e.target.value === '' ? 0 : parseFloat(e.target.value)) : e.target.value,
        }));
    };

    const handleSendTestEmail = async () => {
        setIsEmailSending(true);
        try {
            await sendTestCheckoutEmail(testEmailData);
            setTestEmailStatus('success');
        } catch (error) {
            console.error('Failed to send test email:', error);
            setTestEmailStatus('error');
        }
        setIsEmailSending(false);
    };

    return (
        <div className="space-y-2">
            <InputTextbox idName="to" name="To" value={testEmailData.to} placeholder="Email to send to" onChange={handleTestEmailChange} />
            <InputTextbox
                idName="pieceTitle"
                name="Piece Title"
                value={testEmailData.pieceTitle}
                placeholder="Piece Title"
                onChange={handleTestEmailChange}
            />
            <InputTextbox
                idName="fullName"
                name="Full Name"
                value={testEmailData.fullName}
                placeholder="Full Name"
                onChange={handleTestEmailChange}
            />
            <InputTextbox
                idName="address"
                name="Address"
                value={testEmailData.address}
                placeholder="Address"
                onChange={handleTestEmailChange}
            />
            <InputTextbox
                idName="pricePaid"
                name="Price Paid"
                value={testEmailData.pricePaid.toString()}
                placeholder="Price Paid"
                onChange={handleTestEmailChange}
            />
            <div className="flex justify-center">
                <button
                    onClick={handleSendTestEmail}
                    disabled={isEmailSending}
                    className="flex w-fit items-center rounded-md border-none bg-secondary_dark px-4 py-2 font-lato uppercase text-white hover:bg-stone-400 hover:font-bold hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {isEmailSending ? 'Sending...' : 'Send Test Email'}
                </button>
            </div>
            <div className="mt-2 flex justify-center">
                {testEmailStatus === 'success' && <p className="text-green-500">Test email sent successfully!</p>}
                {testEmailStatus === 'error' && <p className="text-red-500">Failed to send test email.</p>}
            </div>
        </div>
    );
};

export default TestEmail;
