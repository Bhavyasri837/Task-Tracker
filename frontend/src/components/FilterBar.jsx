const STATUS_OPTIONS = ['Todo', 'In Progress', 'Done'];
const PRIORITY_OPTIONS = ['Low', 'Medium', 'High'];

export default function FilterBar({ filters, onChange, onCreateClick }) {
  const handleChange = (field) => (e) => {
    onChange({ ...filters, [field]: e.target.value, page: 1 });
  };

  return (
    <section className="filter-bar" aria-label="Search and filters">
      <input
        type="text"
        placeholder="Search tasks by title..."
        value={filters.search}
        onChange={handleChange('search')}
        className="filter-input search-input"
        aria-label="Search tasks by title"
      />

      <select
        value={filters.status}
        onChange={handleChange('status')}
        className="filter-input"
        aria-label="Filter by status"
      >
        <option value="">All statuses</option>
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      <select
        value={filters.priority}
        onChange={handleChange('priority')}
        className="filter-input"
        aria-label="Filter by priority"
      >
        <option value="">All priorities</option>
        {PRIORITY_OPTIONS.map((p) => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>

      <select
        value={filters.sortBy}
        onChange={handleChange('sortBy')}
        className="filter-input"
        aria-label="Sort tasks"
      >
        <option value="">Sort: Newest first</option>
        <option value="dueDate">Sort: Due date</option>
        <option value="priority">Sort: Priority</option>
      </select>

      <select
        value={filters.order}
        onChange={handleChange('order')}
        className="filter-input"
        aria-label="Sort order"
        disabled={!filters.sortBy}
      >
        <option value="asc">Ascending</option>
        <option value="desc">Descending</option>
      </select>

      <button type="button" className="btn btn-primary" onClick={onCreateClick}>
        + New Task
      </button>
    </section>
  );
}
