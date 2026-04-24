export default function Section({ title, subtitle, children, id }) {
    return (
        <div className="card" id={id}>
            <div className="card-header" style={{ cursor: 'default' }}>
                <div>
                    <h2>{title}</h2>
                    {subtitle && <p className="card-subtitle">{subtitle}</p>}
                </div>
            </div>
            <div className="card-body">{children}</div>
        </div>
    );
}
