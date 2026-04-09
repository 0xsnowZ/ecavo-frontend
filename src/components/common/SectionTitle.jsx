export default function SectionTitle({ title, highlight, className = '' }) {
  return (
    <div className={`mb-6 ${className}`}>
      <h2 className="section-title text-2xl font-bold text-secondary">
        {title}{' '}
        {highlight && <span className="text-primary">{highlight}</span>}
      </h2>
    </div>
  );
}
