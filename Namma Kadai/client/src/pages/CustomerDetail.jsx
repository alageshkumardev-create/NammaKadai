import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { customerAPI } from '../api/client';
import { ArrowLeft, Phone, Mail, MapPin, Wrench, Calendar, Image as ImageIcon, X, Plus, Minus } from 'lucide-react';
import { format } from 'date-fns';

export default function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    serviceDate: new Date().toISOString().split('T')[0],
    technician: '',
    partsReplaced: [''],
    priorityParts: [{ part: '', care: '' }],
    nextServiceDate: '',
    notes: '',
    images: []
  });
  const [imageFiles, setImageFiles] = useState([]);

  useEffect(() => {
    fetchCustomerData();
  }, [id]);

  const fetchCustomerData = async () => {
    try {
      setLoading(true);
      const [customerRes, recordsRes] = await Promise.all([
        customerAPI.getById(id),
        customerAPI.getRecords(id)
      ]);
      setCustomer(customerRes.data.data);
      setRecords(recordsRes.data.data);
    } catch (error) {
      console.error('Error fetching customer data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePartChange = (index, value) => {
    const newParts = [...formData.partsReplaced];
    newParts[index] = value;
    setFormData(prev => ({ ...prev, partsReplaced: newParts }));
  };

  const addPart = () => {
    setFormData(prev => ({
      ...prev,
      partsReplaced: [...prev.partsReplaced, '']
    }));
  };

  const removePart = (index) => {
    setFormData(prev => ({
      ...prev,
      partsReplaced: prev.partsReplaced.filter((_, i) => i !== index)
    }));
  };

  const handlePriorityPartChange = (index, field, value) => {
    const newPriorityParts = [...formData.priorityParts];
    newPriorityParts[index][field] = value;
    setFormData(prev => ({ ...prev, priorityParts: newPriorityParts }));
  };

  const addPriorityPart = () => {
    setFormData(prev => ({
      ...prev,
      priorityParts: [...prev.priorityParts, { part: '', care: '' }]
    }));
  };

  const removePriorityPart = (index) => {
    setFormData(prev => ({
      ...prev,
      priorityParts: prev.priorityParts.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.nextServiceDate) {
      setError('Next service date is required');
      return;
    }

    try {
      setSubmitting(true);

      // Filter out empty parts
      const serviceData = {
        serviceDate: formData.serviceDate,
        nextServiceDate: formData.nextServiceDate,
        partsReplaced: formData.partsReplaced.filter(p => p.trim()),
        priorityParts: formData.priorityParts.filter(p => p.part.trim() || p.care.trim())
      };

      if (formData.technician && formData.technician.trim()) {
        serviceData.technician = formData.technician.trim();
      }
      if (formData.notes && formData.notes.trim()) {
        serviceData.notes = formData.notes.trim();
      }

      await customerAPI.createRecord(id, serviceData);

      // Reset form and close modal
      setFormData({
        serviceDate: new Date().toISOString().split('T')[0],
        technician: '',
        partsReplaced: [''],
        priorityParts: [{ part: '', care: '' }],
        nextServiceDate: '',
        notes: ''
      });
      setShowModal(false);

      // Refresh records
      fetchCustomerData();
    } catch (error) {
      console.error('Error creating service record:', error);
      setError(error.response?.data?.message || error.response?.data?.errors?.[0]?.msg || 'Failed to create service record');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center p-8">
          <div className="spinner"></div>
        </div>
      </Layout>
    );
  }

  if (!customer) {
    return (
      <Layout>
        <div className="card text-center p-8">
          <p>Customer not found</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container">
        {/* Back Button */}
        <button
          onClick={() => navigate('/customers')}
          className="btn btn-outline mb-6"
        >
          <ArrowLeft size={18} />
          Back to Customers
        </button>

        {/* Customer Info */}
        <div className="card mb-6">
          <h2 className="text-2xl font-bold mb-4">{customer.name}</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-gray">
              <Phone size={18} />
              <span>{customer.phone}</span>
            </div>
            {customer.email && (
              <div className="flex items-center gap-2 text-gray">
                <Mail size={18} />
                <span>{customer.email}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-gray">
              <Wrench size={18} />
              <span>{customer.model}</span>
            </div>
            <div className="flex items-center gap-2 text-gray">
              <Calendar size={18} />
              <span>Installed: {format(new Date(customer.installedOn), 'MMM dd, yyyy')}</span>
            </div>
            {customer.address && (
              <div className="flex items-start gap-2 text-gray" style={{ gridColumn: '1 / -1' }}>
                <MapPin size={18} style={{ marginTop: '2px' }} />
                <span>{customer.address}</span>
              </div>
            )}
          </div>
          {customer.notes && (
            <div className="mt-4 p-3" style={{ backgroundColor: '#fef3c7', borderRadius: '0.375rem' }}>
              <p className="text-sm"><strong>Notes:</strong> {customer.notes}</p>
            </div>
          )}
          {customer.images && customer.images.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <ImageIcon size={18} />
                Images
              </h4>
              <div className="flex gap-2">
                {customer.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Customer ${idx + 1}`}
                    style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '0.375rem' }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Service Records */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Service History</h3>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>Add Service Record</button>
          </div>

          {records.length === 0 ? (
            <div className="text-center p-8 text-gray">
              <p>No service records yet</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {records.map((record) => (
                <div
                  key={record._id}
                  style={{
                    padding: '1rem',
                    border: '1px solid var(--border)',
                    borderRadius: '0.5rem',
                    borderLeft: '4px solid var(--primary)'
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium">
                        Service Date: {format(new Date(record.serviceDate), 'MMM dd, yyyy')}
                      </p>
                      <p className="text-sm text-gray">
                        Next Service: {format(new Date(record.nextServiceDate), 'MMM dd, yyyy')}
                      </p>
                    </div>
                    {record.notified && (
                      <span className="badge badge-success">Notified</span>
                    )}
                  </div>

                  {record.technician && (
                    <p className="text-sm text-gray mb-2">👨‍🔧 Technician: {record.technician}</p>
                  )}

                  {record.partsReplaced && record.partsReplaced.length > 0 && (
                    <div className="mb-2">
                      <p className="text-sm font-medium">Parts Replaced:</p>
                      <div className="flex gap-2 mt-1 flex-wrap">
                        {record.partsReplaced.map((part, idx) => (
                          <span key={idx} className="badge badge-info">{part}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {record.priorityParts && record.priorityParts.length > 0 && (
                    <div className="mb-2">
                      <p className="text-sm font-medium">Priority Parts:</p>
                      {record.priorityParts.map((part, idx) => (
                        <div key={idx} className="text-sm text-gray mt-1">
                          • {part.part}: {part.care}
                        </div>
                      ))}
                    </div>
                  )}

                  {record.notes && (
                    <p className="text-sm text-gray mt-2">📝 {record.notes}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Service Record Modal */}
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
              maxWidth: '700px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Add Service Record</h3>
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
                {/* Service Date */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Service Date
                  </label>
                  <input
                    type="date"
                    name="serviceDate"
                    value={formData.serviceDate}
                    onChange={handleInputChange}
                    className="input"
                  />
                </div>

                {/* Technician */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Technician Name
                  </label>
                  <input
                    type="text"
                    name="technician"
                    value={formData.technician}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="Technician name (optional)"
                  />
                </div>

                {/* Parts Replaced */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Parts Replaced
                  </label>
                  {formData.partsReplaced.map((part, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={part}
                        onChange={(e) => handlePartChange(index, e.target.value)}
                        className="input"
                        placeholder="Part name"
                        style={{ flex: 1 }}
                      />
                      {formData.partsReplaced.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePart(index)}
                          className="btn btn-outline"
                          style={{ padding: '0.5rem' }}
                        >
                          <Minus size={18} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addPart}
                    className="btn btn-outline"
                    style={{ width: '100%', marginTop: '0.5rem' }}
                  >
                    <Plus size={18} style={{ marginRight: '0.5rem' }} />
                    Add Part
                  </button>
                </div>

                {/* Priority Parts */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Priority Parts (Parts needing attention)
                  </label>
                  {formData.priorityParts.map((priorityPart, index) => (
                    <div key={index} style={{ marginBottom: '1rem' }}>
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={priorityPart.part}
                          onChange={(e) => handlePriorityPartChange(index, 'part', e.target.value)}
                          className="input"
                          placeholder="Part name"
                          style={{ flex: 1 }}
                        />
                        {formData.priorityParts.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removePriorityPart(index)}
                            className="btn btn-outline"
                            style={{ padding: '0.5rem' }}
                          >
                            <Minus size={18} />
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={priorityPart.care}
                        onChange={(e) => handlePriorityPartChange(index, 'care', e.target.value)}
                        className="input"
                        placeholder="Care instructions"
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addPriorityPart}
                    className="btn btn-outline"
                    style={{ width: '100%' }}
                  >
                    <Plus size={18} style={{ marginRight: '0.5rem' }} />
                    Add Priority Part
                  </button>
                </div>

                {/* Next Service Date */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Next Service Date <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input
                    type="date"
                    name="nextServiceDate"
                    value={formData.nextServiceDate}
                    onChange={handleInputChange}
                    className="input"
                    required
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
                    placeholder="Service notes, observations, recommendations..."
                    rows="4"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-outline"
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
                  {submitting ? 'Creating...' : 'Create Service Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
