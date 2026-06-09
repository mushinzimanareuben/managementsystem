import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Settings, Database, Cloud, BarChart, Server, Check } from 'lucide-react';

export default function Services() {
  const { API_URL } = useAuth();
  const [formData, setFormData] = useState({ clientName: '', email: '', serviceName: 'Enterprise Core System', notes: '' });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const services = [
    { title: 'Enterprise Core System', icon: <Server size={28} />, desc: 'Deploy database models, user role authorizations, and audit-ready data logs for operations.', price: 'Starts at $2,500/mo' },
    { title: 'Marketing Ad Engine', icon: <BarChart size={28} />, desc: 'Configure promotional spots and advertisement metrics with scheduling and real-time view tracking.', price: 'Starts at $1,200/mo' },
    { title: 'Data Pipeline Hub', icon: <Database size={28} />, desc: 'Consolidate multiple customer submission channels, applicant data, and resume files securely.', price: 'Starts at $1,800/mo' },
    { title: 'Cloud Infrastructure Integration', icon: <Cloud size={28} />, desc: 'Migrate local file system uploads to Cloudinary or Firebase Storage dynamically with custom CDNs.', price: 'Starts at $3,000/mo' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');

    try {
      const response = await fetch(`${API_URL}/submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'service_request',
          data: formData
        })
      });

      if (response.ok) {
        setMsg('Success! Your service request has been submitted. Our engineering team will contact you shortly.');
        setFormData({ clientName: '', email: '', serviceName: 'Enterprise Core System', notes: '' });
      } else {
        setMsg('Failed to submit request. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setMsg('Network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <section className="section" style={{ paddingBottom: '2rem' }}>
        <div className="container">
          <div className="section-title">
            <h2>Our Enterprise Services</h2>
            <p>Select a service to streamline your business and request a custom deployment.</p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="section" style={{ padding: '2rem 0' }}>
        <div className="container">
          <div className="grid grid-2">
            {services.map((srv, idx) => (
              <div key={idx} className="card flex gap-3 align-center">
                <div className="stat-icon" style={{ alignSelf: 'flex-start', marginTop: '0.25rem' }}>
                  {srv.icon}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{srv.title}</h3>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem', fontSize: '0.95rem' }}>{srv.desc}</p>
                  <span className="badge badge-primary" style={{ padding: '0.35rem 0.75rem' }}>{srv.price}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Request Form */}
      <section className="section" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="container" style={{ maxWidth: '700px' }}>
          <div className="card">
            <h3 style={{ textAlign: 'center', marginBottom: '1rem' }}>Request Service Consultation</h3>
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '2rem' }}>Fill out the details below, and our team will prepare a structured proposal for your review.</p>
            
            {msg && (
              <div className={`badge ${msg.includes('Success') ? 'badge-success' : 'badge-danger'}`} style={{ padding: '0.75rem', width: '100%', marginBottom: '1.5rem', display: 'block', textAlign: 'center' }}>
                {msg}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Company / Client Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={formData.clientName} 
                  onChange={e => setFormData({ ...formData, clientName: e.target.value })} 
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Business Email</label>
                <input 
                  type="email" 
                  className="form-input" 
                  value={formData.email} 
                  onChange={e => setFormData({ ...formData, email: e.target.value })} 
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Service of Interest</label>
                <select 
                  className="form-select" 
                  value={formData.serviceName} 
                  onChange={e => setFormData({ ...formData, serviceName: e.target.value })}
                >
                  {services.map((srv, idx) => (
                    <option key={idx} value={srv.title}>{srv.title}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Project Details / Custom Requests</label>
                <textarea 
                  className="form-textarea" 
                  placeholder="Describe your architecture requirements, user scale, and timeline..."
                  value={formData.notes} 
                  onChange={e => setFormData({ ...formData, notes: e.target.value })} 
                  required
                ></textarea>
              </div>
              <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                {loading ? 'Submitting Request...' : 'Submit Request'}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
