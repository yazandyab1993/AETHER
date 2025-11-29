import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, UserRole } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthPage = location.pathname === '/login';

  if (isAuthPage) {
    return <div className="min-h-screen bg-black text-white">{children}</div>;
  }

  const NavItem = ({ path, label, active }: { path: string; label: string; active?: boolean }) => (
    <button
      onClick={() => navigate(path)}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
        active 
          ? 'bg-white/10 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)] border border-white/10' 
          : 'text-gray-400 hover:text-white hover:bg-white/5'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-indigo-500/30">
      {/* Premium Gradient Background Mesh */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px]" />
      </div>

      {/* Navbar */}
      <nav className="relative z-50 border-b border-white/5 bg-black/20 backdrop-blur-xl sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
              <div className="h-8 w-8 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center mr-3 shadow-lg shadow-indigo-500/20">
                <span className="font-bold text-white text-lg">A</span>
              </div>
              <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                AETHER
              </span>
            </div>

            <div className="hidden md:flex items-center space-x-2">
              <NavItem path="/" label="Home" active={location.pathname === '/'} />
              {user && (
                <>
                  <NavItem path="/dashboard" label="Dashboard" active={location.pathname === '/dashboard'} />
                  <NavItem path="/generate" label="Generate" active={location.pathname === '/generate'} />
                  {user.role === UserRole.ADMIN && (
                    <NavItem path="/admin" label="Admin" active={location.pathname === '/admin'} />
                  )}
                </>
              )}
            </div>

            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <div className="hidden sm:flex flex-col items-end mr-2">
                    <span className="text-xs text-gray-400">Balance</span>
                    <span className="text-sm font-bold text-indigo-400">{user.credits} Credits</span>
                  </div>
                  <button 
                    onClick={onLogout}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className="px-5 py-2 rounded-full bg-white text-black text-sm font-bold hover:bg-gray-200 transition-colors"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow relative z-10 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>

      <footer className="relative z-10 border-t border-white/5 py-8 text-center text-gray-500 text-sm">
        <p>&copy; 2024 Aether AI. All content stored locally on VPS securely.</p>
      </footer>
    </div>
  );
};