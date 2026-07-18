export function planImportedFieldMerge<Field extends string>(options: {
    existing: Partial<Record<Field, unknown>>;
    imported: Record<Field, unknown>;
    fields: readonly Field[];
    ownerMutatedFields: readonly string[];
}): {
    patch: Partial<Record<Field, unknown>>;
    conflicts: Field[];
} {
    const ownerFields = new Set(options.ownerMutatedFields);
    const patch: Partial<Record<Field, unknown>> = {};
    const conflicts: Field[] = [];

    for (const field of options.fields) {
        if (ownerFields.has(field)) {
            if (!Object.is(options.existing[field], options.imported[field])) conflicts.push(field);
            continue;
        }
        patch[field] = options.imported[field];
    }

    return { patch, conflicts };
}
