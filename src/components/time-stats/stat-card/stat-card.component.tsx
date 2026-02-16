import './stat-card.css';

interface StatCardProps {
  title: string;
  value: string;
  variant?: 'primary' | 'secondary' | 'success';
}

/**
 * Reusable stat card component for displaying metrics
 */
function StatCard({ title, value, variant = 'primary' }: StatCardProps) {
  return (
    <div className="stat-card">
      <h3>{title}</h3>
      <div className={`stat-value ${variant}`}>{value}</div>
    </div>
  );
}

export default StatCard;
