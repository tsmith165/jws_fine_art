// src/app/qr/QRCodePage.tsx
'use client';

import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

const QRCodePage = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const url = 'https://www.jwsfineart.com';
    const size = 300;

    useEffect(() => {
        const generateQR = async () => {
            if (!canvasRef.current) return;

            try {
                // Generate QR code with correct options type
                await QRCode.toCanvas(canvasRef.current, url, {
                    width: size,
                    margin: 2,
                    color: {
                        dark: '#a8a29e', // Your secondary color
                        light: '#475451',
                    },
                    errorCorrectionLevel: 'H', // High error correction for logo overlay
                });

                // Get canvas context
                const ctx = canvasRef.current.getContext('2d');
                if (!ctx) return;

                // Create logo image with proper type
                const logo = document.createElement('img');
                logo.src = '/logo/JWS_ICON_260.png';

                // Add error handling for logo loading
                logo.onerror = () => {
                    console.error('Error loading logo from path:', logo.src);
                };

                logo.onload = () => {
                    const logoSize = size * 0.27; // Logo will be 25% of QR code size
                    const logoX = (size - logoSize) / 2;
                    const logoY = (size - logoSize) / 2;

                    // Create white background for logo
                    ctx.fillStyle = '#a8a29e';
                    ctx.fillRect(logoX - 4, logoY - 4, logoSize + 8, logoSize + 8);

                    // Draw logo
                    ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
                };
            } catch (err) {
                console.error('Error generating QR code:', err);
            }
        };

        generateQR();
    }, []);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-8">
            <canvas ref={canvasRef} width={size} height={size} className="rounded-lg shadow-lg" />
        </div>
    );
};

export default QRCodePage;
