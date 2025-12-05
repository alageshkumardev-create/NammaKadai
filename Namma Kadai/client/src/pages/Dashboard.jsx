import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { recordAPI } from '../api/client';
import { Calendar, AlertCircle, CheckCircle, Clock, X } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const [upcomingServices, setUpcomingServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    dueToday: 0,
    dueThisWeek: 0,
    total: 0
  });
  const [showModal, setShowModal] = useState(false);
  const [modalFilter, setModalFilter] = useState('all');
  const [modalTitle, setModalTitle] = useState('');

  useEffect(() => {
    fetchUpcomingServices();
  }, []);

  const fetchUpcomingServices = async () => {
    try {
      const response = await recordAPI.getUpcoming(7);
      const services = response.data.data;
      setUpcomingServices(services);

      // Calculate stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const dueToday = services.filter(s => {
        const serviceDate = new Date(s.nextServiceDate);
        serviceDate.setHours(0, 0, 0, 0);
        return serviceDate.getTime() === today.getTime();
      }).length;

      setStats({
        dueToday,
        dueThisWeek: services.length,
        total: services.length
      });
    } catch (error) {
      console.error('Error fetching upcoming services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (filter, title) => {
    setModalFilter(filter);
    setModalTitle(title);
    setShowModal(true);
  };

  const getFilteredServices = () => {
    if (modalFilter === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return upcomingServices.filter(s => {
        const serviceDate = new Date(s.nextServiceDate);
        serviceDate.setHours(0, 0, 0, 0);
        return serviceDate.getTime() === today.getTime();
      });
    }
    return upcomingServices;
  };

  const StatCard = ({ icon: Icon, label, value, color, onClick }) => (
    <div
      className="card"
      onClick={onClick}
      style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray text-sm mb-1">{label}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
        <div style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: `${color}20`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Icon size={30} color={color} />
        </div>
      </div>
    </div>
  );

  const getDaysUntil = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const serviceDate = new Date(date);
    serviceDate.setHours(0, 0, 0, 0);
    const diff = Math.ceil((serviceDate - today) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getUrgencyBadge = (daysUntil) => {
    if (daysUntil === 0) return { text: 'Due Today', className: 'badge-danger' };
    if (daysUntil === 1) return { text: 'Due Tomorrow', className: 'badge-warning' };
    if (daysUntil <= 3) return { text: `${daysUntil} days`, className: 'badge-warning' };
    return { text: `${daysUntil} days`, className: 'badge-info' };
  };

  return (
    <Layout>
      <div className="container">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Welcome Back!</h2>
          <p className="text-gray">Here's what's happening with your RO services today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 mb-6">
          <StatCard
            icon={AlertCircle}
            label="Due Today"
            value={stats.dueToday}
            color="#ef4444"
            onClick={() => handleCardClick('today', 'Services Due Today')}
          />
          <StatCard
            icon={Calendar}
            label="Due This Week"
            value={stats.dueThisWeek}
            color="#f59e0b"
            onClick={() => handleCardClick('week', 'Services Due This Week')}
          />
          <StatCard
            icon={CheckCircle}
            label="Total Upcoming"
            value={stats.total}
            color="#10b981"
            onClick={() => handleCardClick('all', 'All Upcoming Services')}
          />
        </div>

        {/* Upcoming Services */}
        <div className="card">
          <h3 className="text-xl font-semibold mb-4">Upcoming Services (Next 7 Days)</h3>

          {loading ? (
            <div className="flex justify-center p-8">
              <div className="spinner"></div>
            </div>
          ) : upcomingServices.length === 0 ? (
            <div className="text-center p-8 text-gray">
              <Clock size={48} style={{ margin: '0 auto 1rem' }} />
              <p>No services scheduled for the next 7 days</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {upcomingServices.map((service) => {
                const daysUntil = getDaysUntil(service.nextServiceDate);
                const urgency = getUrgencyBadge(daysUntil);

                return (
                  <div
                    key={service._id}
                    style={{
                      padding: '1rem',
                      border: '1px solid var(--border)',
                      borderRadius: '0.5rem',
                      transition: 'all 0.2s',
                      cursor: 'pointer'
                    }}
                    onClick={() => navigate(`/customers/${service.customerId._id}`)}
                    onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--shadow)'}
                    onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{service.customerId?.name}</h4>
                          <span className={`badge ${urgency.className}`}>{urgency.text}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm text-gray">
                          <p>📞 {service.customerId?.phone}</p>
                          <p>🔧 {service.customerId?.model}</p>
                          <p>📅 {format(new Date(service.nextServiceDate), 'MMM dd, yyyy')}</p>
                          {service.customerId?.address && (
                            <p>📍 {service.customerId.address.substring(0, 30)}...</p>
                          )}
                        </div>
                        {service.priorityParts?.length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm font-medium">Priority Parts:</p>
                            <div className="flex gap-2 mt-1">
                              {service.priorityParts.map((part, idx) => (
                                <span key={idx} className="badge badge-warning text-xs">
                                  {part.part}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Detail Modal */}
        {showModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '1rem'
            }}
            onClick={() => setShowModal(false)}
          >
            <div
              className="card"
              style={{
                maxWidth: '800px',
                width: '100%',
                maxHeight: '80vh',
                overflowY: 'auto'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">{modalTitle}</h3>
                <button
                  onClick={() => setShowModal(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.5rem'
                  }}
                >
                  <X size={24} />
                </button>
              </div>

              {getFilteredServices().length === 0 ? (
                <div className="text-center p-8 text-gray">
                  <Clock size={48} style={{ margin: '0 auto 1rem' }} />
                  <p>No services found for this filter</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {getFilteredServices().map((service) => {
                    const daysUntil = getDaysUntil(service.nextServiceDate);
                    const urgency = getUrgencyBadge(daysUntil);

                    return (
                      <div
                        key={service._id}
                        style={{
                          padding: '1rem',
                          border: '1px solid var(--border)',
                          borderRadius: '0.5rem',
                          cursor: 'pointer'
                        }}
                        onClick={() => {
                          setShowModal(false);
                          navigate(`/customers/${service.customerId._id}`);
                        }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{service.customerId?.name}</h4>
                          <span className={`badge ${urgency.className}`}>{urgency.text}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm text-gray">
                          <p>📞 {service.customerId?.phone}</p>
                          <p>🔧 {service.customerId?.model}</p>
                          <p>📅 {format(new Date(service.nextServiceDate), 'MMM dd, yyyy')}</p>
                          <p>📍 {service.customerId?.address || 'No address'}</p>
                        </div>
                        {service.priorityParts && service.priorityParts.length > 0 && (
                          <div className="mt-2 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
                            <p className="text-sm font-medium mb-1">Priority Parts:</p>
                            {service.priorityParts.map((part, idx) => (
                              <p key={idx} className="text-sm text-gray">
                                • {part.part}: {part.care}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
