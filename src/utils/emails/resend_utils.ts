import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
    throw new Error('RESEND_API_KEY environment variable is not set');
}

const resend = new Resend(resendApiKey);

export async function sendEmail({ from, to, subject, html }: { from: string; to: string | string[]; subject: string; html: string }) {
    try {
        console.log('Sending email...');
        await resend.emails.send({
            from,
            to,
            subject,
            html,
        });
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
}
