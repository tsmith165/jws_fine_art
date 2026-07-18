export function SectionHeading({ eyebrow, title, copy }: { eyebrow: string; title: string; copy?: string }) {
    return (
        <header className="lw-section-heading">
            <span className="lw-eyebrow">{eyebrow}</span>
            <div>
                <h2>{title}</h2>
                {copy && <p>{copy}</p>}
            </div>
        </header>
    );
}
