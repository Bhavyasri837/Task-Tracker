import useAuth from '../hooks/useAuth';
import useTheme from '../hooks/useTheme';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="navbar">
      <div className="navbar-brand">Task Tracker</div>
      <div className="navbar-actions">
        <button
          type="button"
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label="Toggle dark mode"
        >
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
        {user && (
          <>
            <span className="navbar-user">Hi, {user.name}</span>
            <button type="button" className="btn btn-secondary" onClick={logout}>
              Logout
            </button>
          </>
        )}
      </div>
    </header>
  );
}
