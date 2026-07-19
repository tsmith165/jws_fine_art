import path from 'node:path';
import process from 'node:process';

export type ConvexTarget =
    | { kind: 'development'; args: string[]; label: 'development' }
    | { kind: 'production'; args: ['--prod']; label: 'production' }
    | { kind: 'deployment'; args: ['--deployment', string]; label: string };

export function readArgument(name: string, argv = process.argv.slice(2)): string | undefined {
    return argv.find((argument) => argument.startsWith(`${name}=`))?.slice(name.length + 1);
}

export function parseConvexTarget(argv = process.argv.slice(2)): ConvexTarget {
    const production = argv.includes('--prod');
    const deployment = readArgument('--deployment', argv);
    if (production && deployment) throw new Error('Pass either --prod or --deployment=<name>, not both.');
    if (production) return { kind: 'production', args: ['--prod'], label: 'production' };
    if (deployment) return { kind: 'deployment', args: ['--deployment', deployment], label: `deployment:${deployment}` };
    return { kind: 'development', args: [], label: 'development' };
}

export function requireDestructiveTargetConfirmation(target: ConvexTarget, argv = process.argv.slice(2)): void {
    if (target.kind === 'development') return;
    const confirmation = readArgument('--confirm-target', argv);
    if (confirmation !== target.label) {
        throw new Error(`Refusing to write to ${target.label}. Pass --confirm-target=${target.label}.`);
    }
}

export function defaultBackupPath(target: ConvexTarget, now = new Date()): string {
    const root = process.env.JWS_CONVEX_BACKUP_ROOT || path.resolve(process.cwd(), '..', 'jws-fine-art-convex-backups');
    const timestamp = now.toISOString().replaceAll(':', '-').replaceAll('.', '-');
    return path.join(root, `${timestamp}-${target.label.replaceAll(':', '-')}.zip`);
}

export function convexArgs(args: string[], target: ConvexTarget): string[] {
    return [...args, ...target.args];
}
