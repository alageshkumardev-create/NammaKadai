import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserPlus } from 'lucide-react';

export default function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'technician'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signup(formData);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%', margin: '1rem' }}>
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <UserPlus size={30} color="white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold">Create Account</h1>
          <p className="text-gray mt-2">Sign up for a new account</p>
        </div>

        {error && (
          <div style={{
            padding: '0.75rem',
            backgroundColor: '#fee2e2',
            color: '#991b1b',
            borderRadius: '0.375rem',
            marginBottom: '1rem',
            fontSize: '0.875rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="label">Full Name</label>
            <input
              type="text"
              name="name"
              className="input"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              required
            />
          </div>

          <div className="mb-4">
            <label className="label">Email</label>
            <input
              type="email"
              name="email"
              className="input"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
              required
            />
          </div>

          <div className="mb-4">
            <label className="label">Phone</label>
            <input
              type="tel"
              name="phone"
              className="input"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+919876543210"
            />
          </div>

          <div className="mb-4">
            <label className="label">Password</label>
            <input
              type="password"
              name="password"
              className="input"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              minLength={6}
            />
            <p className="text-sm text-gray mt-1">Minimum 6 characters</p>
          </div>

          <div className="mb-6">
            <label className="label">Role</label>
            <select
              name="role"
              className="input"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="technician">Technician</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={loading}
            style={{ justifyContent: 'center' }}
          >
            {loading ? <div className="spinner"></div> : 'Create Account'}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-gray">
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '500' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
