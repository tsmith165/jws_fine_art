import { parseAsString } from 'nuqs/server';

// Create parser for piece ID
export const pieceParser = parseAsString.withDefault('');

// Type for parsed parameters
export type ParsedParams = {
    piece: NonNullable<ReturnType<typeof pieceParser.parseServerSide>>;
};
