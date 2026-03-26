import './App.css';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Analytics } from '@vercel/analytics/react';
import { NavLink, Routes, Route } from 'react-router-dom';
import TimeToWork from './pages/TimeToWork';
import DaysToWork from './pages/DaysToWork';

function App() {

  return (
    <div className="app" data-testid="app-container">
      <SpeedInsights />
      <Analytics />
      <header className="app-header" data-testid="app-header">
        <div className="app-header-brand">
          <img className="app-header-logo" src="/logo.svg" alt="" aria-hidden="true" />
          <h1 className="app-header-wordmark" data-testid="app-header-title">Time to Work</h1>
        </div>
        <p className="app-header-tagline">Track your hours. Own your day.</p>
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
