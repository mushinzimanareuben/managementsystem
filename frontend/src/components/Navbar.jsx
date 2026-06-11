import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, User, LogOut, CheckSquare, Menu, X } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef(null);

  // Close menu on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menu on route change
  const handleNavClick = () => setMenuOpen(false);

  return (
    <nav className="navbar" ref={navRef}>
      <div className="container flex justify-between align-center">
        <a href="/" className="nav-logo" onClick={handleNavClick}>
          <CheckSquare size={24} /> Smart Company
        </a>

        {/* Desktop Nav Links */}
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

        {/* Mobile Controls */}
        <div className="nav-mobile-controls flex align-center gap-1">
          <button onClick={toggleTheme} className="btn-icon" title="Toggle Dark/Light Mode">
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
          <button
            id="hamburger-btn"
            className={`hamburger-btn${menuOpen ? ' open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
          >
            <span className="hamburger-bar" />
            <span className="hamburger-bar" />
            <span className="hamburger-bar" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div className={`mobile-menu${menuOpen ? ' mobile-menu--open' : ''}`} aria-hidden={!menuOpen}>
        <div className="mobile-menu-inner">
          <a href="/" className="mobile-nav-link" onClick={handleNavClick}>Home</a>
          <a href="/about" className="mobile-nav-link" onClick={handleNavClick}>About</a>
          <a href="/services" className="mobile-nav-link" onClick={handleNavClick}>Services</a>
          <a href="/careers" className="mobile-nav-link" onClick={handleNavClick}>Careers</a>
          <div className="mobile-menu-divider" />
          {user ? (
            <>
              <a href="/dashboard" className="mobile-nav-link flex align-center gap-1" onClick={handleNavClick}>
                <User size={16} />
                {user.role === 'admin' ? 'Admin Panel' : 'Dashboard'}
              </a>
              <button
                onClick={() => { logout(); handleNavClick(); }}
                className="mobile-nav-link mobile-nav-link--danger flex align-center gap-1"
              >
                <LogOut size={16} /> Sign Out
              </button>
            </>
          ) : (
            <a href="/login" className="btn btn-primary" style={{ marginTop: '0.5rem' }} onClick={handleNavClick}>
              Login
            </a>
          )}
        </div>
      </div>
    </nav>
  );
}

