import type { HTMLAttributes, ReactNode } from 'react';

type OwnerFormRowProps = HTMLAttributes<HTMLDivElement> & {
    columns?: 2 | 3;
};

/**
 * Groups related owner-console fields into one shared label/control/footer grid.
 * Each direct `.owner-field` child participates in the same three row tracks,
 * so helper or validation copy can never push a sibling control out of line.
 */
export function OwnerFormRow({ columns = 2, className = '', children, ...props }: OwnerFormRowProps) {
    const columnClass = columns === 3 ? 'is-three' : 'is-two';

    return (
        <div className={`owner-form-row ${columnClass} ${className}`.trim()} {...props}>
            {children}
        </div>
    );
}

export function OwnerFieldFooter({
    children,
    className = '',
    ...props
}: HTMLAttributes<HTMLElement> & {
    children: ReactNode;
}) {
    return (
        <small className={`owner-field-footer ${className}`.trim()} {...props}>
            {children}
        </small>
    );
}
