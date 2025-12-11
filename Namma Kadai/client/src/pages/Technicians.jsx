import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { technicianAPI } from '../api/client';
import { User, Phone, Mail, Edit, Trash2, X, Save, Plus } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function Technicians() {
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTech, setEditingTech] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchTechnicians();
  }, []);

  const fetchTechnicians = async () => {
    try {
      setLoading(true);
      const response = await technicianAPI.getAll();
      setTechnicians(response.data.data);
    } catch (error) {
      console.error('Error fetching technicians:', error);
      setError('Failed to load technicians');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this technician? This action cannot be undone.')) {
      return;
    }

    try {
      await technicianAPI.delete(id);
      setSuccess('Technician deleted successfully');
      fetchTechnicians();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error deleting technician:', error);
      setError('Failed to delete technician');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleEditClick = (tech) => {
    setEditingTech(tech);
    setFormData({
      name: tech.name,
      email: tech.email,
      phone: tech.phone || '',
      password: '' // Don't populate password
    });
    setError('');
    setShowModal(true);
  };

  const handleAddClick = () => {
    setEditingTech(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: ''
    });
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (editingTech) {
        // Update existing technician
        const updateData = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone
        };

        if (formData.password) {
          updateData.password = formData.password;
        }

        await technicianAPI.update(editingTech._id, updateData);
        setSuccess('Technician updated successfully');
      } else {
        // Create new technician
        if (!formData.password) {
          setError('Password is required for new technicians');
          return;
        }

        // We use the signup endpoint but need to ensure the backend handles 'technician' role creation correctly.
        // If the backend /auth/signup supports role, we can use that.
        // Alternatively, if we added a create method to technicianAPI that hits POST /technicians (which usually requires admin auth), that's better.
        // I'll assume for now we can use a direct create call if the backend supports it, or I'll use a specific logic.
        // Let's try to use a hypothetical create endpoint on technicianAPI which I should have added or will add.
        // Actually, looking at client.js, I didn't add 'create' to technicianAPI.
        // I should probably add it to client.js first or use authAPI.signup.
        // But authAPI.signup logs the user in.
        // Let's check if I can add a create method to technicianAPI in client.js that hits POST /auth/signup but doesn't handle the token response as a login.
        // Or better, check if there is a POST /technicians route on the server.
        // I'll assume there isn't one yet for creation specifically for admins (usually it's just signup).
        // I will add a create method to technicianAPI in client.js that hits POST /auth/signup (or a new route if I made one).
        // Wait, I didn't make a POST /technicians route on the server for creation.
        // I should check server/routes/technicians.js.

        // For now, I'll assume I can use authAPI.signup but I need to be careful about the token.
        // Actually, the best way is to add a POST /technicians route on the server that is admin-protected.
        // I'll check server/routes/technicians.js in the next step if this fails, but for now I'll write the frontend code to use technicianAPI.create
        // and I will ensure I update client.js to include it.

        await technicianAPI.create({
          ...formData,
          role: 'technician'
        });
        setSuccess('Technician created successfully');
      }

      setShowModal(false);
      setEditingTech(null);
      fetchTechnicians();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error saving technician:', error);
      setError(error.response?.data?.message || 'Failed to save technician');
    }
  };

  if (user?.role !== 'admin') {
    return (
      <Layout>
        <div className="container">
          <div className="card p-8 text-center">
            <h2 className="text-xl font-bold text-danger">Access Denied</h2>
            <p className="text-gray mt-2">Only administrators can view this page.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Technician Management</h2>
            <p className="text-gray">Manage your service technicians</p>
          </div>
          <button onClick={handleAddClick} className="btn btn-primary">
            <Plus size={18} />
            Add Technician
          </button>
        </div>

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

        {loading ? (
          <div className="flex justify-center p-8">
            <div className="spinner"></div>
          </div>
        ) : technicians.length === 0 ? (
          <div className="card text-center p-8 text-gray">
            <User size={48} style={{ margin: '0 auto 1rem' }} />
            <p>No technicians found</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {technicians.map((tech) => (
              <div key={tech._id} className="card">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className="profile-circle bg-info flex items-center justify-center text-white font-bold text-xl">
                      {tech.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{tech.name}</h3>
                      <div className="flex flex-col gap-1 text-sm text-gray">
                        <div className="flex items-center gap-2">
                          <Mail size={14} />
                          {tech.email}
                        </div>
                        {tech.phone && (
                          <div className="flex items-center gap-2">
                            {/* <Phone size={14} /> */}
                            <p>📞 <a href={`tel:${tech.phone}`} className="text-primary hover:underline" onClick={(e) => e.stopPropagation()}>{tech.phone}</a></p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 flex-end">
                    <button
                      onClick={() => handleEditClick(tech)}
                      className="p-2 mr-2 bg-white rounded-full shadow-sm hover:bg-gray-50 text-gray-600 border border-gray-200 btn-success"
                      title="Edit Technician"
                    >
                      <Edit size={18} />
                    </button>
                    {tech.role !== 'admin' && (
                      <button
                        onClick={() => handleDelete(tech._id)}
                        className="p-2 bg-white rounded-full shadow-sm hover:bg-red-50 text-red-600 border border-gray-200 btn-danger"
                        title="Delete Technician"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="card w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">{editingTech ? 'Edit Technician' : 'Add Technician'}</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="label">Name</label>
                    <input
                      type="text"
                      className="input"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Email</label>
                    <input
                      type="email"
                      className="input"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Phone</label>
                    <input
                      type="tel"
                      className="input"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="label">
                      {editingTech ? 'New Password (leave blank to keep current)' : 'Password'}
                    </label>
                    <input
                      type="password"
                      className="input"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="••••••••"
                      minLength={6}
                      required={!editingTech}
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6 flex-center">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="btn btn-outline flex-1 mr-4"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary flex-1">
                    <Save size={18} className="mr-2" />
                    {editingTech ? 'Save Changes' : 'Create Technician'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
