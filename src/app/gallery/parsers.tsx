export type ParsedParams = {
    piece: string;
};

export function parsePieceParam(value: string | string[] | undefined) {
    if (Array.isArray(value)) {
        return value[0] ?? '';
    }

    return value ?? '';
}
