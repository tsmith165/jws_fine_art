'use client';

import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { qrConfigs } from './qr-config';

interface QRCodeConfig {
    url: string;
    size: number;
    logoPath: string;
    logoSize: number;
    colors: {
        dark: string;
        light: string;
        background: string;
    };
}

const QRCodePage = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [activeConfig, setActiveConfig] = useState<'color' | 'blackAndWhite'>('color');
    const config = qrConfigs[activeConfig];

    useEffect(() => {
        const generateQR = async () => {
            if (!canvasRef.current) return;

            try {
                // Generate QR code with correct options type
                await QRCode.toCanvas(canvasRef.current, config.url, {
                    width: config.size,
                    margin: 2,
                    color: {
                        dark: config.colors.dark,
                        light: config.colors.light,
                    },
                    errorCorrectionLevel: 'H',
                });

                // Get canvas context
                const ctx = canvasRef.current.getContext('2d');
                if (!ctx) return;

                // Create logo image with proper type
                const logo = document.createElement('img');
                logo.src = config.logoPath;

                logo.onerror = () => {
                    console.error('Error loading logo from path:', config.logoPath);
                };

                logo.onload = () => {
                    const actualLogoSize = config.size * config.logoSize;
                    const logoX = (config.size - actualLogoSize) / 2;
                    const logoY = (config.size - actualLogoSize) / 2;

                    // Create background for logo
                    ctx.fillStyle = config.colors.background;
                    ctx.fillRect(logoX - 4, logoY - 4, actualLogoSize + 8, actualLogoSize + 8);

                    // Draw logo
                    ctx.drawImage(logo, logoX, logoY, actualLogoSize, actualLogoSize);
                };
            } catch (err) {
                console.error('Error generating QR code:', err);
            }
        };

        generateQR();
    }, [config]);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center space-y-6 p-8">
            <div className="flex space-x-4">
                <button
                    onClick={() => setActiveConfig('color')}
                    className={`rounded-lg px-4 py-2 font-lato transition-colors ${
                        activeConfig === 'color' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                    Color
                </button>
                <button
                    onClick={() => setActiveConfig('blackAndWhite')}
                    className={`rounded-lg px-4 py-2 font-lato transition-colors ${
                        activeConfig === 'blackAndWhite' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                    Black & White
                </button>
            </div>
            <canvas ref={canvasRef} width={config.size} height={config.size} className="rounded-lg shadow-lg" />
        </div>
    );
};

export default QRCodePage;
