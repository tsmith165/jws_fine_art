import { Resend, type CreateBatchEmailOptions, type CreateEmailOptions } from 'resend';

function resendClient() {
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) throw new Error('RESEND_API_KEY environment variable is not set');
    return new Resend(resendApiKey);
}

export async function sendEmail(message: CreateEmailOptions, options?: { idempotencyKey?: string }) {
    const { data, error } = await resendClient().emails.send(message, options);
    if (error) throw new Error(error.message);
    return data;
}

export async function sendBatchEmails(messages: CreateBatchEmailOptions[]) {
    if (messages.length === 0 || messages.length > 100) throw new Error('Email batches must contain between 1 and 100 messages.');
    const { data, error } = await resendClient().batch.send(messages);
    if (error) throw new Error(error.message);
    return data.data;
}
