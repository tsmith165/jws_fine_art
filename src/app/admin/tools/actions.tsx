'use server';

import { fetchPieces } from '@/app/actions';
import ExcelJS from 'exceljs';
import { Buffer } from 'buffer';
import { sendEmail } from '@/utils/emails/resend_utils';
import CheckoutSuccessEmail from '@/utils/emails/templates/checkoutSuccessEmail';
import { render } from '@react-email/render';
import React from 'react';

export async function exportPieces(): Promise<Buffer> {
    const pieces = await fetchPieces();

    if (pieces.length > 0) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Pieces');

        worksheet.columns = Object.keys(pieces[0]).map((key) => ({ header: key, key }));
        pieces.forEach((piece) => worksheet.addRow(piece));

        const uint8Array = await workbook.xlsx.writeBuffer();
        const buffer = Buffer.from(uint8Array);

        return buffer;
    } else {
        throw new Error('No pieces found to export');
    }
}

export async function sendTestCheckoutEmail(testEmailData: {
    to: string;
    pieceTitle: string;
    fullName: string;
    address: string;
    pricePaid: number;
}): Promise<void> {
    const { to, pieceTitle, fullName, address, pricePaid } = testEmailData;

    const checkoutSuccessEmailTemplate = React.createElement(CheckoutSuccessEmail, {
        piece_title: pieceTitle,
        full_name: fullName,
        address,
        price_paid: pricePaid,
    });
    const emailHtml = render(checkoutSuccessEmailTemplate);

    // Split the comma-separated email addresses into an array
    const recipients = to.split(',').map((email) => email.trim());

    await sendEmail({
        from: 'contact@jwsfineart.com',
        to: recipients,
        subject: 'Test Purchase Confirmation - JWS Fine Art Gallery',
        html: emailHtml,
    });
}
