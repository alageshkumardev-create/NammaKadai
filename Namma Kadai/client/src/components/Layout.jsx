import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Home, Users, LogOut, Menu, X } from 'lucide-react';

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/customers', icon: Users, label: 'Customers' },
  ];

  if (user?.role === 'admin') {
    navItems.push({ path: '/technicians', icon: Users, label: 'Technicians' });
  }

  const isActive = (path) => location.pathname === path;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>
      {/* Mobile Overlay Backdrop */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 35
          }}
        />
      )}

      {/* Sidebar */}
      <aside style={{
        width: '250px',
        backgroundColor: 'white',
        boxShadow: 'var(--shadow)',
        transition: 'transform 0.3s ease-in-out',
        transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        position: 'fixed',
        height: '100vh',
        zIndex: 40,
        left: 0,
        top: 0
      }}>
        <div style={{ padding: '1.5rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold" style={{ color: 'var(--primary)' }}>
              RO Service
            </h2>
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(false)}
                className="btn-outline"
                style={{ padding: '0.5rem', border: 'none' }}
              >
                <X size={20} />
              </button>
            )}
          </div>

          <nav style={{ flex: 1 }}>
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => isMobile && setSidebarOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.375rem',
                  marginBottom: '0.5rem',
                  backgroundColor: isActive(item.path) ? '#eff6ff' : 'transparent',
                  color: isActive(item.path) ? 'var(--primary)' : 'var(--text)',
                  fontWeight: isActive(item.path) ? '600' : '400',
                  textDecoration: 'none',
                  transition: 'all 0.2s'
                }}
              >
                <item.icon size={20} />
                {item.label}
              </Link>
            ))}
          </nav>

          <div style={{
            paddingTop: '1.5rem',
            borderTop: '1px solid var(--border)'
          }}>
            <div style={{ marginBottom: '1rem' }}>
              <p className="font-medium truncate">{user?.name}</p>
              <p className="text-sm text-gray truncate">{user?.email}</p>
              <span className="badge badge-info mt-2">{user?.role}</span>
            </div>
            <button
              onClick={handleLogout}
              className="btn btn-outline w-full"
              style={{ justifyContent: 'center' }}
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div style={{
        marginLeft: isMobile ? '0' : (sidebarOpen ? '250px' : '0'),
        width: '100%',
        transition: 'margin-left 0.3s ease-in-out',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <header style={{
          backgroundColor: 'white',
          boxShadow: 'var(--shadow)',
          padding: '1rem 1.5rem',
          position: 'sticky',
          top: 0,
          zIndex: 30,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="btn btn-outline"
              style={{ padding: '0.5rem', display: isMobile ? 'flex' : 'none' }}
            >
              <Menu size={20} />
            </button>
            <h1 className="text-xl font-semibold">
              {navItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
            </h1>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ padding: isMobile ? '1rem' : '1.5rem', flex: 1 }}>
          {children}
        </main>
      </div>
    </div>
  );
}
