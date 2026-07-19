import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
    convexArgs,
    defaultBackupPath,
    parseConvexTarget,
    requireDestructiveTargetConfirmation,
} from '../../scripts/release/convex-target';

describe('Convex release target controls', () => {
    it('defaults to development and forwards explicit targets', () => {
        expect(parseConvexTarget([])).toEqual({ kind: 'development', args: [], label: 'development' });
        expect(parseConvexTarget(['--prod'])).toEqual({ kind: 'production', args: ['--prod'], label: 'production' });
        expect(convexArgs(['run', 'release:audit'], parseConvexTarget(['--deployment=staging']))).toEqual([
            'run',
            'release:audit',
            '--deployment',
            'staging',
        ]);
    });

    it('requires the exact non-development target confirmation', () => {
        const production = parseConvexTarget(['--prod']);
        expect(() => requireDestructiveTargetConfirmation(production, [])).toThrow('Refusing to write');
        expect(() => requireDestructiveTargetConfirmation(production, ['--confirm-target=production'])).not.toThrow();
    });

    it('writes backups outside the repository by default', () => {
        delete process.env.JWS_CONVEX_BACKUP_ROOT;
        const backup = defaultBackupPath(parseConvexTarget([]), new Date('2026-07-18T12:00:00.000Z'));
        expect(backup).toContain(path.join('jws-fine-art-convex-backups', '2026-07-18T12-00-00-000Z-development.zip'));
    });
});
