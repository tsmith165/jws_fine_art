'use client';

import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { qrConfigs } from './qr-config';

const QRCodePage = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [activeConfig, setActiveConfig] = useState<'color' | 'blackAndWhite'>('color');
    const config = qrConfigs[activeConfig];

    useEffect(() => {
        const generateQR = async () => {
            if (!canvasRef.current) return;

            try {
                await QRCode.toCanvas(canvasRef.current, config.url, {
                    width: config.size,
                    margin: 2,
                    color: {
                        dark: config.colors.dark,
                        light: config.colors.light,
                    },
                    errorCorrectionLevel: 'H',
                });

                const ctx = canvasRef.current.getContext('2d');
                if (!ctx) return;

                const logo = document.createElement('img');
                logo.src = config.logoPath;

                logo.onerror = () => {
                    console.error('Error loading logo from path:', config.logoPath);
                };

                logo.onload = () => {
                    const actualLogoSize = config.size * config.logoSize;
                    const logoX = (config.size - actualLogoSize) / 2;
                    const logoY = (config.size - actualLogoSize) / 2;

                    ctx.fillStyle = config.colors.background;
                    ctx.fillRect(logoX - 4, logoY - 4, actualLogoSize + 8, actualLogoSize + 8);

                    ctx.drawImage(logo, logoX, logoY, actualLogoSize, actualLogoSize);
                };
            } catch (err) {
                console.error('Error generating QR code:', err);
            }
        };

        generateQR();
    }, [config]);

    return (
        <div className="lw-qr-tool">
            <div className="lw-qr-options" role="group" aria-label="QR code treatment">
                <button type="button" onClick={() => setActiveConfig('color')} aria-pressed={activeConfig === 'color'}>
                    Lit Wall
                </button>
                <button type="button" onClick={() => setActiveConfig('blackAndWhite')} aria-pressed={activeConfig === 'blackAndWhite'}>
                    Black & White
                </button>
            </div>
            <canvas ref={canvasRef} width={config.size} height={config.size} aria-label="QR code for jwsfineart.com" />
        </div>
    );
};

export default QRCodePage;
