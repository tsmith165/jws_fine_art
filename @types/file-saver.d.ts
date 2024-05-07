declare module 'file-saver' {
    export function saveAs(data: Blob, filename?: string, options?: SaveAsOptions): void;

    export interface SaveAsOptions {
        autoBom?: boolean;
    }
}
