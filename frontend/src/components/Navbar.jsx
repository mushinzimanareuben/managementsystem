import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Briefcase, User, LogOut, CheckSquare } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="navbar">
      <div className="container flex justify-between align-center">
        <a href="/" className="nav-logo">
          <CheckSquare size={24} /> Smart Company
        </a>

        <div className="nav-links flex align-center">
          <a href="/" className="nav-link">Home</a>
          <a href="/about" className="nav-link">About</a>
          <a href="/services" className="nav-link">Services</a>
          <a href="/careers" className="nav-link">Careers</a>

          {user ? (
            <>
              <a href="/dashboard" className="nav-link flex align-center gap-1">
                <User size={16} /> 
                {user.role === 'admin' ? 'Admin Panel' : 'Dashboard'}
              </a>
              <button onClick={logout} className="btn-icon" title="Sign Out">
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <a href="/login" className="btn btn-primary" style={{ padding: '0.4rem 1.25rem' }}>Login</a>
          )}

          {/* Theme Toggle Button */}
          <button onClick={toggleTheme} className="btn-icon" title="Toggle Dark/Light Mode">
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
        </div>
      </div>
    </nav>
  );
}
