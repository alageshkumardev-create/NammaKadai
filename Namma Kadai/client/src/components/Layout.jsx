import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Home, Users, LogOut, Menu, X } from 'lucide-react';

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/customers', icon: Users, label: 'Customers' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? '250px' : '0',
        backgroundColor: 'white',
        boxShadow: 'var(--shadow)',
        transition: 'width 0.3s',
        overflow: 'hidden',
        position: 'fixed',
        height: '100vh',
        zIndex: 40
      }}>
        <div style={{ padding: '1.5rem' }}>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold" style={{ color: 'var(--primary)' }}>
              RO Service
            </h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="btn-outline"
              style={{ padding: '0.5rem', display: 'none' }}
            >
              <X size={20} />
            </button>
          </div>

          <nav>
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
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
        </div>

        <div style={{
          position: 'absolute',
          bottom: 0,
          width: '100%',
          padding: '1.5rem',
          borderTop: '1px solid var(--border)'
        }}>
          <div style={{ marginBottom: '1rem' }}>
            <p className="font-medium">{user?.name}</p>
            <p className="text-sm text-gray">{user?.email}</p>
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
      </aside>

      {/* Main Content */}
      <div style={{
        marginLeft: sidebarOpen ? '250px' : '0',
        flex: 1,
        transition: 'margin-left 0.3s'
      }}>
        {/* Header */}
        <header style={{
          backgroundColor: 'white',
          boxShadow: 'var(--shadow)',
          padding: '1rem 1.5rem',
          position: 'sticky',
          top: 0,
          zIndex: 30
        }}>
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="btn btn-outline"
              style={{ padding: '0.5rem' }}
            >
              <Menu size={20} />
            </button>
            <h1 className="text-xl font-semibold">
              {navItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
            </h1>
            <div style={{ width: '40px' }}></div>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ padding: '1.5rem' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
