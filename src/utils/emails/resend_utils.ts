import { Resend, type CreateBatchEmailOptions } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
    throw new Error('RESEND_API_KEY environment variable is not set');
}

const resend = new Resend(resendApiKey);

export async function sendEmail({ from, to, subject, html }: { from: string; to: string | string[]; subject: string; html: string }) {
    const { data, error } = await resend.emails.send({
        from,
        to,
        subject,
        html,
    });
    if (error) throw new Error(error.message);
    return data;
}

export async function sendBatchEmails(messages: CreateBatchEmailOptions[]) {
    if (messages.length === 0 || messages.length > 100) throw new Error('Email batches must contain between 1 and 100 messages.');
    const { data, error } = await resend.batch.send(messages);
    if (error) throw new Error(error.message);
    return data.data;
}
