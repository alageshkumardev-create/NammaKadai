import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { notificationAPI } from '../api/client';
import { Bell, RefreshCw, CheckCircle, XCircle, Clock, Phone, Calendar, Mail } from 'lucide-react';
import { format } from 'date-fns';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [triggerMessage, setTriggerMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchNotifications();
  }, [currentPage]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationAPI.getAll(currentPage, 20);
      setNotifications(response.data.data);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerNotifications = async () => {
    try {
      setTriggering(true);
      setTriggerMessage('');
      const response = await notificationAPI.trigger();
      setTriggerMessage(`✅ ${response.data.message} - ${response.data.count} notifications processed`);
      setTimeout(() => {
        fetchNotifications();
      }, 1000);
    } catch (error) {
      console.error('Error triggering notifications:', error);
      setTriggerMessage(`❌ Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setTriggering(false);
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'sent') {
      return (
        <span className="badge badge-success">
          <CheckCircle size={14} />
          Sent
        </span>
      );
    }
    if (status === 'failed') {
      return (
        <span className="badge badge-danger">
          <XCircle size={14} />
          Failed
        </span>
      );
    }
    return (
      <span className="badge badge-warning">
        <Clock size={14} />
        Pending
      </span>
    );
  };

  return (
    <Layout>
      <div className="container">
        <div className="page-header">
          <div>
            <h2 className="text-2xl font-bold mb-2">Notifications</h2>
            <p className="text-gray">Service reminders sent to admin and customers</p>
          </div>
          <div className="action-buttons">
            <button
              onClick={fetchNotifications}
              className="btn btn-outline"
              disabled={loading}
            >
              <RefreshCw size={18} />
              Refresh
            </button>
            <button
              onClick={handleTriggerNotifications}
              className="btn btn-primary"
              disabled={triggering}
            >
              <Bell size={18} />
              {triggering ? 'Triggering...' : 'Trigger Notifications'}
            </button>
          </div>
        </div>

        {triggerMessage && (
          <div className={`alert ${triggerMessage.startsWith('✅') ? 'alert-success' : 'alert-error'}`}>
            {triggerMessage}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center p-8">
            <div className="spinner"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="empty-state">
            <Bell size={48} />
            <p>No notifications yet</p>
            <p className="text-sm">Notifications will appear here when services are due</p>
          </div>
        ) : (
          <div className="notification-grid">
            {notifications.map((notification) => (
              <div key={notification._id} className="notification-card">
                <div className="card-header">
                  <div className="card-title">
                    <Bell size={16} />
                    <span>{notification.customerId?.name || 'Unknown'}</span>
                  </div>
                  {getStatusBadge(notification.status)}
                </div>

                <div className="card-details">
                  <div className="detail-item">
                    <Phone size={14} />
                    <span>{notification.customerId?.phone || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <Calendar size={14} />
                    <span>
                      {notification.serviceRecordId?.nextServiceDate
                        ? format(new Date(notification.serviceRecordId.nextServiceDate), 'MMM dd, yyyy')
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <Clock size={14} />
                    <span>{format(new Date(notification.sentAt || notification.createdAt), 'MMM dd, hh:mm a')}</span>
                  </div>
                </div>

                <div className="card-message">
                  {notification.message.split('\n').slice(0, 3).join(' ').substring(0, 120)}
                  {notification.message.length > 120 && '...'}
                </div>

                {notification.to && (
                  <div className="card-footer">
                    <Mail size={12} />
                    <span>{notification.to.substring(0, 60)}{notification.to.length > 60 && '...'}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="btn btn-outline"
            >
              Previous
            </button>
            <span className="pagination-info">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="btn btn-outline"
            >
              Next
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.5rem;
        }

        .action-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .alert {
          padding: 0.75rem 1rem;
          border-radius: 0.5rem;
          margin-bottom: 1.5rem;
          font-size: 0.9rem;
        }

        .alert-success {
          background: #d1fae5;
          color: #065f46;
        }

        .alert-error {
          background: #fee2e2;
          color: #991b1b;
        }

        .empty-state {
          text-align: center;
          padding: 3rem 1rem;
          color: var(--text-secondary);
        }

        .empty-state svg {
          margin: 0 auto 1rem;
          opacity: 0.5;
        }

        .notification-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .notification-card {
          background: var(--card-bg);
          border: 1px solid var(--border);
          border-radius: 0.5rem;
          padding: 1rem;
          transition: all 0.2s;
        }

        .notification-card:hover {
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid var(--border);
        }

        .card-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
          font-size: 0.95rem;
        }

        .card-details {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .card-message {
          background: var(--bg-secondary);
          padding: 0.75rem;
          border-radius: 0.375rem;
          font-size: 0.85rem;
          line-height: 1.5;
          color: var(--text-secondary);
          margin-bottom: 0.75rem;
          min-height: 3rem;
        }

        .card-footer {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          padding-top: 0.75rem;
          border-top: 1px solid var(--border);
          color: var(--text-tertiary);
        }

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 1rem;
          margin-top: 2rem;
        }

        .pagination-info {
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .page-header {
            flex-direction: column;
            gap: 1rem;
          }

          .action-buttons {
            width: 100%;
            flex-direction: column;
          }

          .action-buttons button {
            width: 100%;
          }

          .notification-grid {
            grid-template-columns: 1fr;
          }

          .notification-card {
            padding: 0.875rem;
          }

          .card-title {
            font-size: 0.9rem;
          }

          .detail-item {
            font-size: 0.8rem;
          }

          .card-message {
            font-size: 0.8rem;
            padding: 0.625rem;
          }
        }

        @media (max-width: 480px) {
          .card-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }

          .pagination {
            flex-direction: column;
            gap: 0.5rem;
          }

          .pagination button {
            width: 100%;
          }
        }
      `}</style>
    </Layout>
  );
}
