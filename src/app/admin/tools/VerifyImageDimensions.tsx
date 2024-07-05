import React, { useState, useRef, useCallback } from 'react';
import { getPiecesToVerify, verifyImageDimensions } from './actions';
import { IoIosSpeedometer } from 'react-icons/io';
import { PiecesWithImages } from '@/db/schema';

const VerifyImageDimensions: React.FC = () => {
    const [isVerifying, setIsVerifying] = useState(false);
    const [status, setStatus] = useState<'success' | 'error' | null>(null);
    const [currentPiece, setCurrentPiece] = useState<PiecesWithImages | null>(null);
    const [progress, setProgress] = useState({ current: 0, total: 0 });
    const [results, setResults] = useState<any[]>([]);
    const [verifyTimeout, setVerifyTimeout] = useState(1000);
    const verifyTimeoutRef = useRef(verifyTimeout);
    const [showSlider, setShowSlider] = useState(false);
    const stopVerificationRef = useRef(false);

    const handleVerifyImageDimensions = useCallback(async () => {
        setIsVerifying(true);
        setStatus(null);
        setResults([]);
        stopVerificationRef.current = false;

        try {
            const piecesResult = await getPiecesToVerify();
            if (!piecesResult.success || !piecesResult.pieces) {
                throw new Error(piecesResult.error || 'Failed to get pieces to verify');
            }

            const pieces = piecesResult.pieces;
            setProgress({ current: 0, total: pieces.length });

            for (let i = 0; i < pieces.length; i++) {
                if (stopVerificationRef.current) break;
                console.log(`Verifying piece ${i + 1} of ${pieces.length} with timeout ${verifyTimeoutRef.current}ms`);

                const piece = pieces[i];
                setCurrentPiece(piece);
                setProgress((prev) => ({ ...prev, current: i + 1 }));

                const result = await verifyImageDimensions(piece);
                setResults((prev) => [...prev, result]);

                await new Promise((resolve) => setTimeout(resolve, verifyTimeoutRef.current));
            }

            setStatus('success');
        } catch (error) {
            console.error('Failed to verify image dimensions:', error);
            setStatus('error');
        }

        setIsVerifying(false);
        setCurrentPiece(null);
    }, []);

    const handleStopVerification = () => {
        stopVerificationRef.current = true;
    };

    const handleTimeoutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTimeout = parseInt(e.target.value, 10);
        setVerifyTimeout(newTimeout);
        verifyTimeoutRef.current = newTimeout; // Update the ref value
    };

    return (
        <div className="flex flex-col items-center justify-center space-y-4">
            <div className="flex items-center space-x-4">
                <div className="flex space-x-2">
                    <button
                        onClick={handleVerifyImageDimensions}
                        disabled={isVerifying}
                        className="flex w-fit items-center rounded-md border-none bg-secondary_dark px-4 py-2 font-lato uppercase text-white hover:bg-stone-400 hover:font-bold hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isVerifying ? 'Verifying...' : 'Verify Image Dimensions'}
                    </button>
                    {isVerifying && (
                        <button
                            onClick={handleStopVerification}
                            className="flex w-fit items-center rounded-md border-none bg-red-600 px-4 py-2 font-lato uppercase text-white hover:bg-red-700 hover:font-bold"
                        >
                            Stop
                        </button>
                    )}
                </div>
                <div
                    className="group relative flex items-center"
                    onMouseEnter={() => setShowSlider(true)}
                    onMouseLeave={() => setShowSlider(false)}
                >
                    <IoIosSpeedometer className="h-6 w-6 cursor-pointer fill-stone-900" />
                    {showSlider && (
                        <div className="flex items-center space-x-2 p-2">
                            <input
                                type="range"
                                min={250}
                                max={10000}
                                step={100}
                                value={verifyTimeout}
                                onChange={handleTimeoutChange}
                                className="w-24 cursor-pointer appearance-none rounded-lg bg-stone-600 [&::-webkit-slider-runnable-track]:h-2 [&::-webkit-slider-runnable-track]:rounded-lg [&::-webkit-slider-runnable-track]:bg-stone-900 [&::-webkit-slider-thumb]:mt-[-4px] [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
                            />
                            <span className="w-16 text-center text-stone-900">{(verifyTimeout / 1000).toFixed(2)}s</span>
                        </div>
                    )}
                </div>
            </div>
            {isVerifying && currentPiece && (
                <div className="text-center text-stone-900">
                    <p className="text-stone-900">Verifying: {currentPiece.title}</p>
                    <p className="text-stone-900">
                        Progress: {progress.current} of {progress.total}
                    </p>
                </div>
            )}
            {status === 'success' && (
                <p className="bg-stone-900 p-2 text-center text-green-500">
                    Image dimensions verified successfully! Total pieces processed: {results.length}
                </p>
            )}
            {status === 'error' && <p className="text-center text-red-500">Failed to verify image dimensions.</p>}
            {currentPiece && (
                <div className="mt-4 text-stone-900">
                    <p>
                        <strong className="font-bold text-stone-900">{currentPiece.title}</strong>
                    </p>
                    {currentPiece.piece_type && <p className="text-stone-900">Type: {currentPiece.piece_type}</p>}
                    {currentPiece.width && currentPiece.height && (
                        <p className="text-stone-900">
                            Dimensions: {currentPiece.width}" x {currentPiece.height}"
                        </p>
                    )}
                    {currentPiece.small_width && currentPiece.small_height && (
                        <p className="text-stone-900">
                            Small Dimensions: {currentPiece.small_width}" x {currentPiece.small_height}"
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default VerifyImageDimensions;
