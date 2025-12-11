import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { customerAPI } from '../api/client';
import { Search, Plus, Phone, Mail, Wrench, X, Edit, Trash2, Save } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../hooks/useAuth';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    model: '',
    installedOn: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchCustomers();
  }, [page, search]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await customerAPI.getAll({ page, limit: 10, search });
      setCustomers(response.data.data);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditClick = (e, customer) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation();
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      phone: customer.phone,
      email: customer.email || '',
      address: customer.address || '',
      model: customer.model,
      installedOn: customer.installedOn ? new Date(customer.installedOn).toISOString().split('T')[0] : '',
      notes: customer.notes || ''
    });
    setShowModal(true);
  };

  const handleDeleteClick = async (e, id) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation();

    if (!window.confirm('Are you sure you want to delete this customer? This will also delete all their service records. This action cannot be undone.')) {
      return;
    }

    try {
      await customerAPI.delete(id);
      setSuccess('Customer deleted successfully');
      fetchCustomers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error deleting customer:', error);
      setError('Failed to delete customer');
      setTimeout(() => setError(''), 3000);
    }
  };

  const openAddModal = () => {
    setEditingCustomer(null);
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
      model: '',
      installedOn: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.name || !formData.phone || !formData.model) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);

      const customerData = {
        name: formData.name,
        phone: formData.phone,
        model: formData.model,
        installedOn: formData.installedOn
      };

      if (formData.email && formData.email.trim()) customerData.email = formData.email.trim();
      if (formData.address && formData.address.trim()) customerData.address = formData.address.trim();
      if (formData.notes && formData.notes.trim()) customerData.notes = formData.notes.trim();

      if (editingCustomer) {
        await customerAPI.update(editingCustomer._id, customerData);
        setSuccess('Customer updated successfully');
      } else {
        await customerAPI.create(customerData);
        setSuccess('Customer created successfully');
      }

      setShowModal(false);
      fetchCustomers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error saving customer:', error);
      setError(error.response?.data?.message || 'Failed to save customer');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="container">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-col-mobile items-start-mobile gap-4">
          <div>
            <h2 className="text-2xl font-bold">Customers</h2>
            <p className="text-gray">Manage your RO service customers</p>
          </div>
          <button className="btn btn-primary w-full md:w-auto" onClick={openAddModal}>
            <Plus size={18} />
            Add Customer
          </button>
        </div>

        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
            {success}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {/* Search */}
        <div className="card mb-6">
          <div style={{ position: 'relative' }}>
            <Search
              size={20}
              style={{
                position: 'absolute',
                left: '0.875rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-light)'
              }}
            />
            <input
              type="text"
              className="input"
              placeholder="Search by name, phone, or model..."
              value={search}
              onChange={handleSearch}
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>
        </div>

        {/* Customers List */}
        {loading ? (
          <div className="flex justify-center p-8">
            <div className="spinner"></div>
          </div>
        ) : customers.length === 0 ? (
          <div className="card text-center p-8 text-gray">
            <p>No customers found</p>
          </div>
        ) : (
          <>
            <div className="grid gap-4">
              {customers.map((customer) => (
                <Link
                  key={customer._id}
                  to={`/customers/${customer._id}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div
                    className="card relative group"
                    style={{ transition: 'all 0.2s', cursor: 'pointer' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = 'var(--shadow)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    {/* <div className='relative w-full'> */}
                    <div className="absolute top-4 right-4 flex flex-end gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => handleEditClick(e, customer)}
                        className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 text-gray-600 border border-gray-200 btn-success"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      {(user?.role === 'admin' || customer.technicianId === user?.id) && (
                        <button
                          onClick={(e) => handleDeleteClick(e, customer._id)}
                          className="p-2 bg-white rounded-full shadow-sm hover:bg-red-50 text-red-600 border border-gray-200 btn-danger"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                    {/* </div> */}

                    <div className="flex items-start justify-between flex-col-mobile">
                      <div className="flex-1 pr-16">
                        <h3 className="font-semibold text-lg mb-2">{customer.name}</h3>
                        <div className="grid grid-cols-2 gap-2 text-sm text-gray">
                          <div className="flex items-center gap-2">
                            {/* <Phone size={16} />
                            {customer.phone} */}
                            <p>📞 <a href={`tel:${customer.phone}`} className="text-primary hover:underline" onClick={(e) => e.stopPropagation()}>{customer.phone}</a></p>

                          </div>

                          {customer.email && (
                            <div className="flex items-center gap-2">
                              <Mail size={16} />
                              {customer.email}
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Wrench size={16} />
                            {customer.model}
                          </div>
                          <div>
                            📅 Installed: {format(new Date(customer.installedOn), 'MMM dd, yyyy')}
                          </div>
                        </div>
                        {customer.address && (
                          <p className="text-sm text-gray mt-2">📍 {customer.address}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <button
                  className="btn btn-outline"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </button>
                <span className="flex items-center px-4">
                  Page {page} of {totalPages}
                </span>
                <button
                  className="btn btn-outline"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add/Edit Customer Modal */}
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
              maxWidth: '600px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">{editingCustomer ? 'Edit Customer' : 'Add New Customer'}</h3>
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

            {error && (
              <div
                style={{
                  padding: '0.75rem',
                  backgroundColor: '#fee2e2',
                  color: '#dc2626',
                  borderRadius: '0.375rem',
                  marginBottom: '1rem'
                }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gap: '1rem' }}>
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Name <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="Customer name"
                    required
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Phone <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="Phone number"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="Email address (optional)"
                  />
                </div>

                {/* RO Model */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    RO Model <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="model"
                    value={formData.model}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="RO model name"
                    required
                  />
                </div>

                {/* Installation Date */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Installation Date
                  </label>
                  <input
                    type="date"
                    name="installedOn"
                    value={formData.installedOn}
                    onChange={handleInputChange}
                    className="input"
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Address
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="Customer address"
                    rows="2"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="Additional notes"
                    rows="3"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 mt-6  flex-center">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-outline mr-4"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                  style={{ flex: 1 }}
                >
                  <Save size={18} className="mr-2" />
                  {submitting ? 'Saving...' : (editingCustomer ? 'Update Customer' : 'Create Customer')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
