import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Activity } from 'lucide-react';
import { authAPI } from '../services/api';

const Signup = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    name: '',
    role: 'PATIENT',
    phone: '',
    // Patient specific
    gender: 'Male',
    dob: '',
    bloodGroup: '',
    address: '',
    // Doctor specific
    specialization: '',
    consultationFee: '',
    qualification: '',
    experience: ''
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // We pass the exact object, backend will map it correctly based on role
      await authAPI.register(formData);
      navigate('/login', { state: { message: 'Registration successful! Please login.' } });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 text-primary mb-4 shadow-lg shadow-primary/20">
            <Activity size={32} />
          </div>
          <h1 className="text-3xl font-bold text-content tracking-tight">Create an Account</h1>
          <p className="text-content-muted mt-2">Join Medicare Hospital Management System</p>
        </div>

        <div className="glass-card p-8">
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Account Role */}
            <div>
              <label className="form-label">I am registering as a:</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  className={`py-3 rounded-lg border font-medium transition-all ${
                    formData.role === 'PATIENT' 
                      ? 'bg-primary/20 border-primary text-primary' 
                      : 'bg-surface border-border text-content-muted hover:bg-border'
                  }`}
                  onClick={() => setFormData({ ...formData, role: 'PATIENT' })}
                >
                  Patient
                </button>
                <button
                  type="button"
                  className={`py-3 rounded-lg border font-medium transition-all ${
                    formData.role === 'DOCTOR' 
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500' 
                      : 'bg-surface border-border text-content-muted hover:bg-border'
                  }`}
                  onClick={() => setFormData({ ...formData, role: 'DOCTOR' })}
                >
                  Doctor
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Username</label>
                <input 
                  type="text" 
                  name="username"
                  className="form-control" 
                  required 
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="johndoe"
                />
              </div>
              <div>
                <label className="form-label">Password</label>
                <input 
                  type="password" 
                  name="password"
                  className="form-control" 
                  required 
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="form-label">Email Address</label>
                <input 
                  type="email" 
                  name="email"
                  className="form-control" 
                  required 
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="form-label">Full Name</label>
                <input 
                  type="text" 
                  name="name"
                  className="form-control" 
                  required 
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="form-label">Phone Number</label>
                <input 
                  type="text" 
                  name="phone"
                  className="form-control" 
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>

            <div className="border-t border-border my-6 pt-6">
              <h4 className="text-content font-semibold mb-4">
                {formData.role === 'PATIENT' ? 'Patient Details' : 'Professional Details'}
              </h4>
              
              {formData.role === 'PATIENT' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Gender</label>
                    <select name="gender" className="form-control" value={formData.gender} onChange={handleChange}>
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Date of Birth</label>
                    <input type="date" name="dob" className="form-control" value={formData.dob} onChange={handleChange} />
                  </div>
                  <div>
                    <label className="form-label">Blood Group</label>
                    <input type="text" name="bloodGroup" className="form-control" placeholder="e.g. O+" value={formData.bloodGroup} onChange={handleChange} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="form-label">Address</label>
                    <input type="text" name="address" className="form-control" placeholder="123 Main St, City" value={formData.address} onChange={handleChange} />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Specialization</label>
                    <input type="text" name="specialization" className="form-control" required placeholder="e.g. Cardiologist" value={formData.specialization} onChange={handleChange} />
                  </div>
                  <div>
                    <label className="form-label">Consultation Fee ($)</label>
                    <input type="number" name="consultationFee" className="form-control" placeholder="e.g. 150" value={formData.consultationFee} onChange={handleChange} />
                  </div>
                  <div>
                    <label className="form-label">Qualification</label>
                    <input type="text" name="qualification" className="form-control" placeholder="e.g. MD, MBBS" value={formData.qualification} onChange={handleChange} />
                  </div>
                  <div>
                    <label className="form-label">Experience</label>
                    <input type="text" name="experience" className="form-control" placeholder="e.g. 10 years" value={formData.experience} onChange={handleChange} />
                  </div>
                </div>
              )}
            </div>

            <button 
              type="submit" 
              className={`btn w-full py-3 text-lg mt-6 ${formData.role === 'PATIENT' ? 'btn-primary' : 'bg-emerald-500 text-content hover:bg-emerald-600 focus:ring-emerald-500'}`}
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Complete Registration'}
            </button>
          </form>

          <div className="mt-6 text-center text-content-muted text-sm">
            Already have an account? <Link to="/login" className="text-primary hover:text-indigo-400 font-medium">Sign in here</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
