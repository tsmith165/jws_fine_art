// File: /src/app/admin/tools/tools.tsx

'use client';

import { useState } from 'react';
import { saveAs } from 'file-saver';
import ExcelJS from 'exceljs';

import { sendTestCheckoutEmail } from '@/app/admin/tools/actions';

import { fetchPieces } from '@/app/actions';

const Tools: React.FC = () => {
    const [testEmailData, setTestEmailData] = useState({
        to: '',
        pieceTitle: '',
        fullName: '',
        address: '',
        pricePaid: 0,
    });
    const [testEmailStatus, setTestEmailStatus] = useState<'success' | 'error' | null>(null);
    const [isEmailSending, setIsEmailSending] = useState(false);

    const exportPiecesAsXLSX = async () => {
        try {
            const pieces = await fetchPieces();

            if (pieces.length > 0) {
                const workbook = new ExcelJS.Workbook();
                const worksheet = workbook.addWorksheet('Pieces');

                worksheet.columns = Object.keys(pieces[0]).map((key) => ({ header: key, key }));
                pieces.forEach((piece) => worksheet.addRow(piece));

                const buffer = await workbook.xlsx.writeBuffer();
                const data = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                saveAs(data, 'pieces.xlsx');
                console.log('Successfully exported pieces as XLSX');
            } else {
                console.log('No pieces found to export');
            }
        } catch (error) {
            console.error('Failed to export pieces:', error);
        }
    };

    const handleTestEmailChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setTestEmailData((prevData) => ({
            ...prevData,
            [e.target.name]: e.target.name === 'pricePaid' ? parseFloat(e.target.value) : e.target.value,
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
        <div className="flex w-full max-w-xl flex-col space-y-4">
            <div className="rounded-md border-2 border-primary_dark">
                <div className="rounded-t-md bg-secondary p-4 font-lato text-lg text-primary">Data Backup</div>
                <div className="flex items-center justify-center rounded-b-md bg-primary p-2">
                    <button
                        className="text-dark cursor-pointer rounded-md border-none bg-secondary_dark px-2 py-5 font-lato uppercase text-white hover:bg-primary_dark"
                        onClick={exportPiecesAsXLSX}
                    >
                        Export Pieces as XLSX
                    </button>
                </div>
            </div>
            <div className="space rounded-md border-2 border-primary_dark">
                <div className="rounded-t-md bg-secondary p-4 font-lato text-lg text-primary">Test Checkout Email</div>
                <div className="space-y-2 rounded-b-md bg-primary p-4">
                    <div className="h-fit space-y-2">
                        <input
                            type="email"
                            name="to"
                            value={testEmailData.to}
                            onChange={handleTestEmailChange}
                            placeholder="Email to send to"
                            className="w-full rounded-md border-none bg-secondary_dark px-4 py-2 font-lato text-white"
                        />
                        <input
                            type="text"
                            name="pieceTitle"
                            value={testEmailData.pieceTitle}
                            onChange={handleTestEmailChange}
                            placeholder="Piece Title"
                            className="w-full rounded-md border-none bg-secondary_dark px-4 py-2 font-lato text-white"
                        />
                        <input
                            type="text"
                            name="fullName"
                            value={testEmailData.fullName}
                            onChange={handleTestEmailChange}
                            placeholder="Full Name"
                            className="w-full rounded-md border-none bg-secondary_dark px-4 py-2 font-lato text-white"
                        />
                        <input
                            name="address"
                            value={testEmailData.address}
                            onChange={handleTestEmailChange}
                            placeholder="Address"
                            className="w-full rounded-md border-none bg-secondary_dark px-4 py-2 font-lato text-white"
                        />
                        <input
                            type="number"
                            name="pricePaid"
                            value={testEmailData.pricePaid}
                            onChange={handleTestEmailChange}
                            placeholder="Price Paid"
                            className="w-full rounded-md border-none bg-secondary_dark px-4 py-2 font-lato text-white"
                        />
                    </div>
                    <div className="mx-auto flex w-full flex-row items-center justify-center">
                        <button
                            onClick={handleSendTestEmail}
                            disabled={isEmailSending}
                            className="flex w-fit items-center rounded-md border-none bg-secondary_dark px-4 py-2 font-lato uppercase text-white hover:bg-stone-400 hover:font-bold hover:text-primary"
                        >
                            {isEmailSending ? (
                                <div className="flex h-8 w-8 animate-spin items-center justify-center rounded-full bg-gradient-to-r from-primary via-primary_dark to-secondary">
                                    <div className="h-7 w-7 rounded-full bg-secondary_dark opacity-75"></div>
                                </div>
                            ) : (
                                'Send Test Email'
                            )}
                        </button>
                    </div>
                    <div className="mt-2 flex justify-center">
                        {testEmailStatus === 'success' && <p className="text-green-500">Test email sent successfully!</p>}
                        {testEmailStatus === 'error' && <p className="text-red-500">Failed to send test email.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Tools;
