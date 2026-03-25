import './App.css';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Analytics } from '@vercel/analytics/react';
import { NavLink, Routes, Route, useLocation } from 'react-router-dom';
import TimeToWork from './pages/TimeToWork';
import DaysToWork from './pages/DaysToWork';

const PAGE_TITLES: Record<string, string> = {
  '/': 'Days to Work',
  '/time-to-work': 'Time to Work',
};

function App() {
  const { pathname } = useLocation();
  const title = PAGE_TITLES[pathname] ?? 'Days to Work';

  return (
    <div className="app" data-testid="app-container">
      <SpeedInsights />
      <Analytics />
      <header className="app-header" data-testid="app-header">
        <h1 data-testid="app-header-title">{title}</h1>
        <nav className="page-nav" data-testid="page-nav" aria-label="Page navigation">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `page-nav-link${isActive ? ' active' : ''}`}
            data-testid="nav-days-to-work"
          >
            Days to Work
          </NavLink>
          <NavLink
            to="/time-to-work"
            className={({ isActive }) => `page-nav-link${isActive ? ' active' : ''}`}
            data-testid="nav-time-to-work"
          >
            Time to Work
          </NavLink>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<DaysToWork />} />
        <Route path="/time-to-work" element={<TimeToWork />} />
      </Routes>
    </div>
  );
}

export default App;
