import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { customerAPI, uploadAPI, recordAPI } from '../api/client';
import { ArrowLeft, Phone, Mail, MapPin, Wrench, Calendar, Image as ImageIcon, X, Plus, Minus, Edit, Trash2, Save } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../hooks/useAuth';

export default function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [customer, setCustomer] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Service Form Data
  const [serviceFormData, setServiceFormData] = useState({
    serviceDate: new Date().toISOString().split('T')[0],
    technician: '',
    partsReplaced: [''],
    priorityParts: [{ part: '', care: '' }],
    nextServiceDate: '',
    notes: '',
    images: []
  });
  const [editingRecord, setEditingRecord] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);

  // Customer Form Data (for editing)
  const [customerFormData, setCustomerFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    model: '',
    installedOn: '',
    notes: ''
  });

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
      setError('Failed to load customer data');
    } finally {
      setLoading(false);
    }
  };

  // --- Customer Actions ---

  const handleEditCustomerClick = () => {
    setCustomerFormData({
      name: customer.name,
      phone: customer.phone,
      email: customer.email || '',
      address: customer.address || '',
      model: customer.model,
      installedOn: customer.installedOn ? new Date(customer.installedOn).toISOString().split('T')[0] : '',
      notes: customer.notes || ''
    });
    setShowCustomerModal(true);
  };

  const handleUpdateCustomer = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await customerAPI.update(id, customerFormData);
      setSuccess('Customer updated successfully');
      setShowCustomerModal(false);
      fetchCustomerData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error updating customer:', error);
      setError('Failed to update customer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCustomer = async () => {
    if (!window.confirm('Are you sure you want to delete this customer? This will also delete all their service records. This action cannot be undone.')) {
      return;
    }
    try {
      await customerAPI.delete(id);
      navigate('/customers');
    } catch (error) {
      console.error('Error deleting customer:', error);
      setError('Failed to delete customer');
    }
  };

  // --- Service Record Actions ---

  const handleEditRecordClick = (record) => {
    setEditingRecord(record);
    setServiceFormData({
      serviceDate: new Date(record.serviceDate).toISOString().split('T')[0],
      technician: record.technician || '',
      partsReplaced: record.partsReplaced.length > 0 ? record.partsReplaced : [''],
      priorityParts: record.priorityParts.length > 0 ? record.priorityParts : [{ part: '', care: '' }],
      nextServiceDate: new Date(record.nextServiceDate).toISOString().split('T')[0],
      notes: record.notes || '',
      images: record.images || []
    });
    setShowServiceModal(true);
  };

  const handleDeleteRecord = async (recordId) => {
    if (!window.confirm('Are you sure you want to delete this service record?')) {
      return;
    }
    try {
      await recordAPI.delete(recordId);
      setSuccess('Service record deleted');
      fetchCustomerData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error deleting record:', error);
      setError('Failed to delete service record');
    }
  };

  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!serviceFormData.nextServiceDate) {
      setError('Next service date is required');
      return;
    }

    try {
      setSubmitting(true);

      // Upload new images
      const newImageUrls = [];
      if (imageFiles.length > 0) {
        for (const file of imageFiles) {
          const uploadRes = await uploadAPI.uploadImage(file);
          newImageUrls.push(uploadRes.data.url);
        }
      }

      // Combine existing images (if editing) with new ones
      const finalImages = editingRecord
        ? [...(serviceFormData.images || []), ...newImageUrls]
        : newImageUrls;

      const serviceData = {
        serviceDate: serviceFormData.serviceDate,
        nextServiceDate: serviceFormData.nextServiceDate,
        partsReplaced: serviceFormData.partsReplaced.filter(p => p.trim()),
        priorityParts: serviceFormData.priorityParts.filter(p => p.part.trim() || p.care.trim()),
        images: finalImages
      };

      if (serviceFormData.technician && serviceFormData.technician.trim()) {
        serviceData.technician = serviceFormData.technician.trim();
      }
      if (serviceFormData.notes && serviceFormData.notes.trim()) {
        serviceData.notes = serviceFormData.notes.trim();
      }

      if (editingRecord) {
        await recordAPI.update(editingRecord._id, serviceData);
        setSuccess('Service record updated');
      } else {
        await customerAPI.createRecord(id, serviceData);
        setSuccess('Service record created');
      }

      // Reset
      resetServiceForm();
      setShowServiceModal(false);
      fetchCustomerData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error saving service record:', error);
      setError('Failed to save service record');
    } finally {
      setSubmitting(false);
    }
  };

  const resetServiceForm = () => {
    setServiceFormData({
      serviceDate: new Date().toISOString().split('T')[0],
      technician: '',
      partsReplaced: [''],
      priorityParts: [{ part: '', care: '' }],
      nextServiceDate: '',
      notes: '',
      images: []
    });
    setEditingRecord(null);
    setImageFiles([]);
  };

  // --- Form Helpers ---

  const handleServiceInputChange = (e) => {
    const { name, value } = e.target;
    setServiceFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCustomerInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePartChange = (index, value) => {
    const newParts = [...serviceFormData.partsReplaced];
    newParts[index] = value;
    setServiceFormData(prev => ({ ...prev, partsReplaced: newParts }));
  };

  const addPart = () => {
    setServiceFormData(prev => ({
      ...prev,
      partsReplaced: [...prev.partsReplaced, '']
    }));
  };

  const removePart = (index) => {
    setServiceFormData(prev => ({
      ...prev,
      partsReplaced: prev.partsReplaced.filter((_, i) => i !== index)
    }));
  };

  const handlePriorityPartChange = (index, field, value) => {
    const newPriorityParts = [...serviceFormData.priorityParts];
    newPriorityParts[index][field] = value;
    setServiceFormData(prev => ({ ...prev, priorityParts: newPriorityParts }));
  };

  const addPriorityPart = () => {
    setServiceFormData(prev => ({
      ...prev,
      priorityParts: [...prev.priorityParts, { part: '', care: '' }]
    }));
  };

  const removePriorityPart = (index) => {
    setServiceFormData(prev => ({
      ...prev,
      priorityParts: prev.priorityParts.filter((_, i) => i !== index)
    }));
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + imageFiles.length > 5) {
      setError('Maximum 5 images allowed');
      return;
    }
    setImageFiles(prev => [...prev, ...files]);
  };

  const removeNewImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index) => {
    setServiceFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
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

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
            {success}
          </div>
        )}

        {/* Customer Info */}
        <div className="card mb-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold">{customer.name}</h2>
            <div className="flex gap-3">
              <button
                onClick={handleEditCustomerClick}
                className="p-2  mr-2 bg-white rounded-full shadow-sm hover:bg-gray-50 text-gray-600 border border-gray-200 btn-success"
                title="Edit Customer"
              >
                <Edit size={18} />
              </button>
              {(user?.role === 'admin' || customer.technicianId === user?.id) && (
                <button
                  onClick={handleDeleteCustomer}
                  className="p-2 bg-white rounded-full shadow-sm hover:bg-red-50 text-red-600 border border-gray-200 btn-danger"
                  title="Delete Customer"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-gray">
              {/* <Phone size={18} />
              <span>{customer.phone}</span> */}
              <p>📞 <a href={`tel:${customer.phone}`} className="text-primary hover:underline" onClick={(e) => e.stopPropagation()}>{customer.phone}</a></p>
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
        </div>

        {/* Service Records */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Service History</h3>
            <button
              className="btn btn-primary"
              onClick={() => {
                resetServiceForm();
                setShowServiceModal(true);
              }}
            >
              <Plus size={18} className="mr-2" />
              Add Service Record
            </button>
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
                    borderLeft: '4px solid var(--primary)',
                    position: 'relative'
                  }}
                >
                  <div className="absolute top-4 right-4 flex gap-3 flex-end">
                    <button
                      onClick={() => handleEditRecordClick(record)}
                      className="p-2 bg-white mr-2 rounded-full shadow-sm hover:bg-gray-50 text-gray-600 border border-gray-200 btn-success transition-colors"
                      title="Edit Record"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteRecord(record._id)}
                      className="p-2 bg-white rounded-full shadow-sm hover:bg-red-50 text-red-600 border border-gray-200 btn-danger transition-colors"
                      title="Delete Record"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="flex items-start justify-between mb-2 pr-16">
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

                  {record.images && record.images.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium mb-2">Service Images:</p>
                      <div className="flex gap-2 flex-wrap">
                        {record.images.map((image, idx) => (
                          <a key={idx} href={image} target="_blank" rel="noopener noreferrer">
                            <img
                              src={image}
                              alt={`Service ${idx + 1}`}
                              style={{
                                width: '80px',
                                height: '80px',
                                objectFit: 'cover',
                                borderRadius: '0.375rem',
                                border: '1px solid var(--border)'
                              }}
                            />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Service Record Modal (Create/Edit) */}
      {showServiceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">{editingRecord ? 'Edit Service Record' : 'Add Service Record'}</h3>
              <button onClick={() => setShowServiceModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleServiceSubmit}>
              <div className="grid gap-4">
                {/* Service Date */}
                <div>
                  <label className="label">Service Date</label>
                  <input
                    type="date"
                    name="serviceDate"
                    value={serviceFormData.serviceDate}
                    onChange={handleServiceInputChange}
                    className="input"
                  />
                </div>

                {/* Technician */}
                <div>
                  <label className="label">Technician Name</label>
                  <input
                    type="text"
                    name="technician"
                    value={serviceFormData.technician}
                    onChange={handleServiceInputChange}
                    className="input"
                    placeholder="Technician name (optional)"
                  />
                </div>

                {/* Parts Replaced */}
                <div>
                  <label className="label mb-2">Parts Replaced</label>
                  {serviceFormData.partsReplaced.map((part, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={part}
                        onChange={(e) => handlePartChange(index, e.target.value)}
                        className="input flex-1"
                        placeholder="Part name"
                      />
                      <button
                        type="button"
                        onClick={() => removePart(index)}
                        className="btn btn-outline p-2"
                      >
                        <Minus size={18} />
                      </button>
                    </div>
                  ))}
                  <button type="button" onClick={addPart} className="btn btn-outline w-full mt-2">
                    <Plus size={18} className="mr-2" /> Add Part
                  </button>
                </div>

                {/* Priority Parts */}
                <div>
                  <label className="label mb-2">Priority Parts</label>
                  {serviceFormData.priorityParts.map((priorityPart, index) => (
                    <div key={index} className="mb-4 p-3 border rounded-md">
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={priorityPart.part}
                          onChange={(e) => handlePriorityPartChange(index, 'part', e.target.value)}
                          className="input flex-1"
                          placeholder="Part name"
                        />
                        <button
                          type="button"
                          onClick={() => removePriorityPart(index)}
                          className="btn btn-outline p-2"
                        >
                          <Minus size={18} />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={priorityPart.care}
                        onChange={(e) => handlePriorityPartChange(index, 'care', e.target.value)}
                        className="input w-full"
                        placeholder="Care instructions"
                      />
                    </div>
                  ))}
                  <button type="button" onClick={addPriorityPart} className="btn btn-outline w-full">
                    <Plus size={18} className="mr-2" /> Add Priority Part
                  </button>
                </div>

                {/* Next Service Date */}
                <div>
                  <label className="label">Next Service Date <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    name="nextServiceDate"
                    value={serviceFormData.nextServiceDate}
                    onChange={handleServiceInputChange}
                    className="input"
                    required
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="label">Notes</label>
                  <textarea
                    name="notes"
                    value={serviceFormData.notes}
                    onChange={handleServiceInputChange}
                    className="input"
                    rows="4"
                  />
                </div>

                {/* Images */}
                <div>
                  <label className="label mb-2">Images (Max 5)</label>

                  {/* Existing Images (Edit Mode) */}
                  {editingRecord && serviceFormData.images && serviceFormData.images.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm text-gray mb-2">Current Images:</p>
                      <div className="flex gap-2 flex-wrap">
                        {serviceFormData.images.map((img, idx) => (
                          <div key={idx} className="relative w-20 h-20">
                            <img src={img} alt="Service" className="w-full h-full object-cover rounded" />
                            <button
                              type="button"
                              onClick={() => removeExistingImage(idx)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageSelect}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="btn btn-outline w-full justify-center cursor-pointer">
                    <ImageIcon size={18} className="mr-2" /> Select New Images
                  </label>

                  {/* New Image Previews */}
                  {imageFiles.length > 0 && (
                    <div className="flex gap-2 flex-wrap mt-3">
                      {imageFiles.map((file, idx) => (
                        <div key={idx} className="relative w-20 h-20">
                          <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover rounded" />
                          <button
                            type="button"
                            onClick={() => removeNewImage(idx)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-center gap-3 mt-6">
                <button type="button" onClick={() => setShowServiceModal(false)} className=" mr-4 btn btn-outline flex-1">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary flex-1" disabled={submitting}>
                  {submitting ? 'Saving...' : (editingRecord ? 'Update Record' : 'Create Record')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Edit Modal */}
      {showCustomerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Edit Customer</h3>
              <button onClick={() => setShowCustomerModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleUpdateCustomer}>
              <div className="space-y-4">
                <div>
                  <label className="label">Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="name"
                    value={customerFormData.name}
                    onChange={handleCustomerInputChange}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="label">Phone <span className="text-red-500">*</span></label>
                  <input
                    type="tel"
                    name="phone"
                    value={customerFormData.phone}
                    onChange={handleCustomerInputChange}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={customerFormData.email}
                    onChange={handleCustomerInputChange}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">RO Model <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="model"
                    value={customerFormData.model}
                    onChange={handleCustomerInputChange}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="label">Installation Date</label>
                  <input
                    type="date"
                    name="installedOn"
                    value={customerFormData.installedOn}
                    onChange={handleCustomerInputChange}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Address</label>
                  <textarea
                    name="address"
                    value={customerFormData.address}
                    onChange={handleCustomerInputChange}
                    className="input"
                    rows="3"
                  />
                </div>
                <div>
                  <label className="label">Notes</label>
                  <textarea
                    name="notes"
                    value={customerFormData.notes}
                    onChange={handleCustomerInputChange}
                    className="input"
                    rows="3"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setShowCustomerModal(false)} className="btn btn-outline flex-1">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary flex-1" disabled={submitting}>
                  <Save size={18} className="mr-2" />
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
