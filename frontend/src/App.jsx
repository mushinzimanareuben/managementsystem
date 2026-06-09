import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Careers from './pages/Careers';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';

function MainApp() {
  const { user, loading } = useAuth();
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  // Monitor browser back/forward buttons
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center align-center" style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
        <h3>Initializing SCMS Workspace...</h3>
      </div>
    );
  }

  // Routing Logic
  let pageComponent;
  let showHeaderFooter = true;

  switch (currentPath) {
    case '/':
    case '/home':
      pageComponent = <Home />;
      break;
    case '/about':
      pageComponent = <About />;
      break;
    case '/services':
      pageComponent = <Services />;
      break;
    case '/careers':
      pageComponent = <Careers />;
      break;
    case '/login':
      pageComponent = <Login />;
      break;
    case '/dashboard':
      if (!user) {
        window.location.href = '/login';
        return null;
      }
      
      if (user.role === 'admin') {
        pageComponent = <AdminDashboard />;
        showHeaderFooter = false; // Admin Dashboard has full custom sidebar
      } else {
        pageComponent = <EmployeeDashboard />;
      }
      break;
    default:
      pageComponent = (
        <div className="container text-center" style={{ padding: '8rem 2rem' }}>
          <h2>404 - Page Not Found</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>The requested resource does not exist.</p>
          <a href="/" className="btn btn-primary" style={{ marginTop: '2rem' }}>Return Home</a>
        </div>
      );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {showHeaderFooter && <Navbar />}
      <main style={{ flex: 1 }}>
        {pageComponent}
      </main>
      {showHeaderFooter && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ThemeProvider>
  );
}
