'use client';

import { CheckCircle2, ImageDown, LoaderCircle } from 'lucide-react';
import { useState } from 'react';
import { getImagesMissingSmallImages } from './actions';

export default function GenerateSmallImages() {
    const [checking, setChecking] = useState(false);
    const [message, setMessage] = useState('');

    async function checkVariants() {
        setChecking(true);
        setMessage('');
        const result = await getImagesMissingSmallImages();
        setChecking(false);
        setMessage(
            result.success
                ? result.images?.length
                    ? `${result.images.length} images need presentation variants.`
                    : 'All originals are ready. Responsive variants are generated at delivery time.'
                : result.error || 'Image variants could not be checked.',
        );
    }

    return (
        <div className="owner-tool-action">
            <button className="owner-button" type="button" onClick={checkVariants} disabled={checking}>
                {checking ? <LoaderCircle className="owner-spin" size={16} /> : <ImageDown size={16} />}
                {checking ? 'Checking…' : 'Check variants'}
            </button>
            {message ? (
                <p className="owner-tool-result" role="status">
                    <CheckCircle2 size={15} /> {message}
                </p>
            ) : null}
        </div>
    );
}
