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
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1
  });

  useEffect(() => {
    fetchUpcomingServices();
  }, [pagination.page]);

  const fetchUpcomingServices = async () => {
    try {
      const response = await recordAPI.getUpcoming(pagination.page, pagination.limit);
      const services = response.data.data;
      setUpcomingServices(services);

      setPagination(prev => ({
        ...prev,
        totalPages: response.data.totalPages
      }));

      // Calculate stats (Note: This only calculates based on fetched page, 
      // ideally stats should come from a separate endpoint or the same endpoint's metadata)
      // For now, we'll use the 'total' from response for the total count

      setStats(prev => ({
        ...prev,
        total: response.data.total
      }));

      // We might need a separate call for "Due Today" and "Due This Week" if we want accurate global stats
      // independent of pagination. For now, let's keep it simple or assume the backend sends these.
      // Since the backend only sends paginated data, "Due Today" on the dashboard might be misleading 
      // if it only checks the current page. 
      // Let's stick to the requested "Total Upcoming" pagination feature for now.

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
          <div className="flex items-center justify-between mb-4 flex-col-mobile items-start-mobile gap-2">
            <h3 className="text-xl font-semibold">All Upcoming Services</h3>
            <span className="text-sm text-gray">Total: {stats.total}</span>
          </div>

          {loading ? (
            <div className="flex justify-center p-8">
              <div className="spinner"></div>
            </div>
          ) : upcomingServices.length === 0 ? (
            <div className="text-center p-8 text-gray">
              <Clock size={48} style={{ margin: '0 auto 1rem' }} />
              <p>No upcoming services scheduled</p>
            </div>
          ) : (
            <>
              <div className="grid gap-4 mb-4">
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
                      <div className="flex items-center justify-between flex-col-mobile items-start-mobile gap-2">
                        <div className="flex-1 w-full">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <h4 className="font-semibold">{service.customerId?.name}</h4>
                            <span className={`badge ${urgency.className}`}>{urgency.text}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm text-gray">
                            <p>📞 <a href={`tel:${service.customerId?.phone}`} className="text-primary hover:underline" onClick={(e) => e.stopPropagation()}>{service.customerId?.phone}</a></p>
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

              {/* Pagination Controls */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  <button
                    className="btn btn-secondary"
                    disabled={pagination.page === 1}
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  >
                    Previous
                  </button>
                  <span className="flex items-center px-4 text-sm">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <button
                    className="btn btn-secondary"
                    disabled={pagination.page === pagination.totalPages}
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
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
                          <p>📞 <a href={`tel:${service.customerId?.phone}`} className="text-primary hover:underline" onClick={(e) => e.stopPropagation()}>{service.customerId?.phone}</a></p>
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
