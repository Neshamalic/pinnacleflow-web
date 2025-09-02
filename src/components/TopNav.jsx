// src/components/TopNav.jsx
import { NavLink } from 'react-router-dom';

const tabs = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/tender-management', label: 'Tenders' },
  { to: '/purchase-order-tracking', label: 'Orders' },
  { to: '/import-management', label: 'Imports' },
  { to: '/forecasting', label: 'Forecasting' },
  { to: '/communications-log', label: 'Communications' },
];

export default function TopNav() {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="font-semibold">PinnacleFlow</div>
        <nav className="flex gap-4">
          {tabs.map(t => (
            <NavLink
              key={t.to}
              to={t.to}
              className={({ isActive }) =>
                `text-sm px-3 py-1 rounded-md ${
                  isActive ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`
              }
            >
              {t.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
