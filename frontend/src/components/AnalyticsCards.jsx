export default function AnalyticsCards({ analytics }) {
  if (!analytics) return null;

  const { totalTasks, completedTasks, pendingTasks, completionPercentage } = analytics;

  const cards = [
    { label: 'Total Tasks', value: totalTasks },
    { label: 'Completed', value: completedTasks },
    { label: 'Pending', value: pendingTasks },
    { label: 'Completion', value: `${completionPercentage}%` }
  ];

  return (
    <section className="analytics-cards" aria-label="Task analytics">
      {cards.map((card) => (
        <div className="stat-card" key={card.label}>
          <span className="stat-value">{card.value}</span>
          <span className="stat-label">{card.label}</span>
        </div>
      ))}
    </section>
  );
}
