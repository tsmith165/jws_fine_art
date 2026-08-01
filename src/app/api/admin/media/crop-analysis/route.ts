import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { requireAdminRequest } from '@/utils/auth/requireAdminRequest';

export const runtime = 'nodejs';

const MAX_DOWNLOAD_BYTES = 32 * 1024 * 1024;
const MAX_ANALYSIS_EDGE = 1200;
const MAX_CROP_FRACTION = 0.2;

function allowedArtworkSource(value: string) {
    const parsed = new URL(value);
    const allowed =
        parsed.hostname === 'utfs.io' ||
        parsed.hostname.endsWith('.ufs.sh') ||
        parsed.hostname === 'jwsfineart.s3.us-west-1.amazonaws.com' ||
        parsed.hostname === 'jwsfineartpieces.s3.us-west-1.amazonaws.com';
    if (parsed.protocol !== 'https:' || !allowed || parsed.username || parsed.password) {
        throw new Error('This image is not hosted by an approved artwork provider.');
    }
    return parsed.toString();
}

function isUniformLightLine(
    pixels: Buffer,
    width: number,
    height: number,
    channels: number,
    axis: 'row' | 'column',
    index: number,
) {
    const count = axis === 'row' ? width : height;
    let light = 0;
    let neutral = 0;
    let lumaSum = 0;
    let lumaSquareSum = 0;
    for (let position = 0; position < count; position += 1) {
        const x = axis === 'row' ? position : index;
        const y = axis === 'row' ? index : position;
        const offset = (y * width + x) * channels;
        const r = pixels[offset] ?? 0;
        const g = pixels[offset + 1] ?? r;
        const b = pixels[offset + 2] ?? r;
        const alpha = channels === 4 ? (pixels[offset + 3] ?? 255) : 255;
        const luma = alpha < 16 ? 255 : 0.2126 * r + 0.7152 * g + 0.0722 * b;
        lumaSum += luma;
        lumaSquareSum += luma * luma;
        if (luma >= 226) light += 1;
        if (Math.max(r, g, b) - Math.min(r, g, b) <= 24) neutral += 1;
    }
    const mean = lumaSum / count;
    const variance = Math.max(0, lumaSquareSum / count - mean * mean);
    return mean >= 232 && Math.sqrt(variance) <= 18 && light / count >= 0.92 && neutral / count >= 0.88;
}

function scanInset(
    pixels: Buffer,
    width: number,
    height: number,
    channels: number,
    axis: 'row' | 'column',
    fromEnd: boolean,
) {
    const length = axis === 'row' ? height : width;
    const limit = Math.floor(length * MAX_CROP_FRACTION);
    let inset = 0;
    for (let step = 0; step < limit; step += 1) {
        const index = fromEnd ? length - step - 1 : step;
        if (!isUniformLightLine(pixels, width, height, channels, axis, index)) break;
        inset += 1;
    }
    return inset / length;
}

function roundedCrop(value: number) {
    return Math.round(Math.min(MAX_CROP_FRACTION, Math.max(0, value)) * 10_000) / 10_000;
}

export async function POST(request: NextRequest) {
    try {
        await requireAdminRequest(request);
        const body = (await request.json()) as { imageUrl?: unknown };
        if (typeof body.imageUrl !== 'string') throw new Error('Choose an artwork image to analyze.');
        const imageUrl = allowedArtworkSource(body.imageUrl);
        const response = await fetch(imageUrl, { cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(15_000) });
        if (!response.ok) throw new Error('The artwork image could not be downloaded.');
        const declaredLength = Number(response.headers.get('content-length') || 0);
        if (declaredLength > MAX_DOWNLOAD_BYTES) throw new Error('This image is too large to analyze.');
        const bytes = Buffer.from(await response.arrayBuffer());
        if (bytes.byteLength > MAX_DOWNLOAD_BYTES) throw new Error('This image is too large to analyze.');

        const { data, info } = await sharp(bytes)
            .rotate()
            .resize({ width: MAX_ANALYSIS_EDGE, height: MAX_ANALYSIS_EDGE, fit: 'inside', withoutEnlargement: true })
            .removeAlpha()
            .raw()
            .toBuffer({ resolveWithObject: true });
        const crop = {
            top: roundedCrop(scanInset(data, info.width, info.height, info.channels, 'row', false)),
            right: roundedCrop(scanInset(data, info.width, info.height, info.channels, 'column', true)),
            bottom: roundedCrop(scanInset(data, info.width, info.height, info.channels, 'row', true)),
            left: roundedCrop(scanInset(data, info.width, info.height, info.channels, 'column', false)),
        };
        const detected = Object.values(crop).some((value) => value >= 0.0025);
        return NextResponse.json({
            success: true,
            detected,
            crop: detected ? crop : { top: 0, right: 0, bottom: 0, left: 0 },
            analyzedWidth: info.width,
            analyzedHeight: info.height,
            message: detected
                ? 'A uniform light edge was detected. Review the suggested crop before saving.'
                : 'No uniform light edge was detected. The original presentation is recommended.',
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'The image could not be analyzed.' },
            { status: error instanceof SyntaxError ? 400 : 403 },
        );
    }
}
