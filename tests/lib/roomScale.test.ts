import { describe, expect, it } from 'vitest';
import { getLivingRoomPlacement, LIVING_ROOM_SCALE } from '../../src/lib/roomScale';

describe('getLivingRoomPlacement', () => {
    it('reproduces the photographed 30 × 24 inch calibration reference', () => {
        const placement = getLivingRoomPlacement(30, 24);

        expect(placement.widthPercent).toBeCloseTo(25.18, 1);
        expect(placement.heightPercent).toBeCloseTo(30.27, 1);
        expect(placement.centerXPercent).toBe(50);
        expect(placement.centerYPercent).toBe(45.6);
        expect(placement.fitsClearWall).toBe(true);
    });

    it('keeps portrait and landscape dimensions proportional', () => {
        const landscape = getLivingRoomPlacement(24, 12);
        const portrait = getLivingRoomPlacement(12, 24);

        expect(landscape.widthPercent).toBeCloseTo(portrait.widthPercent * 2, 5);
        expect(portrait.heightPercent).toBeCloseTo(landscape.heightPercent * 2, 5);
    });

    it('flags artwork that exceeds the photographed clear wall area without shrinking it', () => {
        const oversized = getLivingRoomPlacement(LIVING_ROOM_SCALE.clearWall.widthInches + 1, LIVING_ROOM_SCALE.clearWall.heightInches);

        expect(oversized.fitsClearWall).toBe(false);
        expect(oversized.widthPercent).toBeGreaterThan(80);
    });
});
