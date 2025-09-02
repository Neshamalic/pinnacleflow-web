// src/App.jsx
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './Routes';
import TopNav from './components/TopNav';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <TopNav />
        <main className="max-w-7xl mx-auto px-6 py-6">
          <AppRoutes />
        </main>
      </div>
    </BrowserRouter>
  );
}
