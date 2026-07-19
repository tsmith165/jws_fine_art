export function SectionHeading({ eyebrow, title, copy }: { eyebrow: string; title: string; copy?: string }) {
    return (
        <header className="lw-section-heading">
            <div className="lw-section-heading-copy">
                <span className="lw-eyebrow">{eyebrow}</span>
                <h2>{title}</h2>
                {copy && <p>{copy}</p>}
            </div>
        </header>
    );
}
