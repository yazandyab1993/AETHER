import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { Generator } from './pages/Generator';
import { Admin } from './pages/Admin';
import { Card, Input, Button } from './components/UI';
import { User, UserRole } from './types';
import { getUsers, getFromStorage } from './services/mockBackend';
import { STORAGE_KEY_CURRENT_USER } from './constants';

function App() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Restore session
    const storedUser = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
    if (storedUser) {
        // We re-fetch from "DB" to ensure credits are up to date
        const dbUsers = getUsers();
        const fullUser = dbUsers.find(u => u.id === JSON.parse(storedUser).id);
        if(fullUser) setUser(fullUser);
    }
  }, []);

  const refreshUser = () => {
    if(!user) return;
    const dbUsers = getUsers();
    const fullUser = dbUsers.find(u => u.id === user.id);
    if(fullUser) setUser(fullUser);
  }

  const handleLogin = (u: User) => {
    setUser(u);
    localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(u));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
  };

  return (
    <Router>
      <Layout user={user} onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />} />
          
          <Route path="/dashboard" element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} />
          
          <Route path="/generate" element={user ? <Generator user={user} refreshUser={refreshUser} /> : <Navigate to="/login" />} />
          
          <Route path="/admin" element={
            user && user.role === UserRole.ADMIN ? <Admin currentUser={user} /> : <Navigate to="/dashboard" />
          } />
        </Routes>
      </Layout>
    </Router>
  );
}

// Simple Login Component inline for brevity in file count constraint
const Login = ({ onLogin }: { onLogin: (u: User) => void }) => {
  const [email, setEmail] = useState('user@example.com'); // Default for demo
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
      onLogin(user);
    } else {
      setError('Invalid credentials. Try user@example.com / password OR admin@example.com / admin');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md p-8 bg-black/40">
        <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
            <p className="text-gray-400">Sign in to access your generative suite.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Email</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Password</label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <Button className="w-full">Sign In</Button>
          <div className="text-xs text-center text-gray-500 mt-4">
            <p>Demo Users:</p>
            <p>user@example.com / password</p>
            <p>admin@example.com / admin</p>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default App;