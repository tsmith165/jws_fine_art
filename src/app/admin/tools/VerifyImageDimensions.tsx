'use client';

import { CheckCircle2, LoaderCircle, ScanLine, StopCircle } from 'lucide-react';
import { useRef, useState } from 'react';
import { getPiecesToVerify, verifyImageDimensions } from './actions';

export default function VerifyImageDimensions() {
    const [running, setRunning] = useState(false);
    const [progress, setProgress] = useState({ current: 0, total: 0, title: '' });
    const [message, setMessage] = useState('');
    const stop = useRef(false);

    async function verify() {
        setRunning(true);
        setMessage('');
        stop.current = false;
        const result = await getPiecesToVerify();
        if (!result.success || !result.pieces) {
            setRunning(false);
            setMessage(result.error || 'Artwork metadata could not be loaded.');
            return;
        }
        let completed = 0;
        for (const [index, piece] of result.pieces.entries()) {
            if (stop.current) break;
            setProgress({ current: index + 1, total: result.pieces.length, title: piece.title });
            const check = await verifyImageDimensions(piece);
            if (!check.success) {
                setMessage(check.error || `Could not verify ${piece.title}.`);
                setRunning(false);
                return;
            }
            completed += 1;
        }
        setRunning(false);
        setMessage(stop.current ? `Stopped after ${completed} pieces.` : `Verified ${completed} artwork records.`);
    }

    return (
        <div className="owner-tool-action">
            <div className="owner-inline-form">
                <button className="owner-button" type="button" onClick={verify} disabled={running}>
                    {running ? <LoaderCircle className="owner-spin" size={16} /> : <ScanLine size={16} />}
                    {running ? `Verifying ${progress.current} of ${progress.total}` : 'Verify dimensions'}
                </button>
                {running ? (
                    <button className="owner-button" type="button" onClick={() => (stop.current = true)}>
                        <StopCircle size={16} /> Stop after this piece
                    </button>
                ) : null}
            </div>
            {running ? <p className="owner-tool-progress">Now checking {progress.title}</p> : null}
            {message ? (
                <p className="owner-tool-result" role="status">
                    <CheckCircle2 size={15} /> {message}
                </p>
            ) : null}
        </div>
    );
}
