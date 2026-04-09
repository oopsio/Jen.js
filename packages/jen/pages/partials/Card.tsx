export default function Card({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div
      style={{
        border: '1px solid #ccc',
        borderRadius: '8px',
        padding: '16px',
        margin: '16px 0',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      }}
    >
      <h3 style={{ margin: '0 0 8px 0' }}>{title}</h3>
      <p style={{ margin: 0, color: '#555' }}>{description}</p>
    </div>
  );
}
