import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, MapPin, Briefcase, Calendar, Upload, FileText, CheckCircle, X } from 'lucide-react';

export default function Careers() {
  const { API_URL } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  
  // Selection & Modal
  const [selectedJob, setSelectedJob] = useState(null);
  const [applying, setApplying] = useState(false);
  
  // Application Form
  const [appForm, setAppForm] = useState({ name: '', email: '', phone: '', coverLetter: '' });
  const [cvFile, setCvFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');

  // Fetch Jobs
  const loadJobs = () => {
    const query = new URLSearchParams({
      search,
      department: deptFilter,
      type: typeFilter
    });
    fetch(`${API_URL}/jobs?${query.toString()}`)
      .then(res => res.json())
      .then(data => setJobs(data))
      .catch(console.error);
  };

  useEffect(() => {
    loadJobs();
  }, [search, deptFilter, typeFilter]);

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!cvFile) {
      setMsg('Please upload your CV/Resume to continue.');
      return;
    }

    setSubmitting(true);
    setMsg('');

    try {
      const formData = new FormData();
      formData.append('type', 'job_application');
      formData.append('cv', cvFile);
      formData.append('data', JSON.stringify({
        jobId: selectedJob.id,
        jobTitle: selectedJob.title,
        applicantName: appForm.name,
        applicantEmail: appForm.email,
        applicantPhone: appForm.phone,
        coverLetter: appForm.coverLetter
      }));

      const response = await fetch(`${API_URL}/submissions`, {
        method: 'POST',
        body: formData // Set body directly to FormData (fetch handles boundary header)
      });

      const resData = await response.json();

      if (response.ok) {
        setMsg('Application submitted successfully! Our HR team will review your application.');
        setAppForm({ name: '', email: '', phone: '', coverLetter: '' });
        setCvFile(null);
        setTimeout(() => {
          setApplying(false);
          setSelectedJob(null);
          setMsg('');
        }, 3000);
      } else {
        setMsg(resData.message || 'Submission failed.');
      }
    } catch (error) {
      console.error(error);
      setMsg('An error occurred during submission.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '3rem 1.5rem' }}>
      <div className="section-title">
        <h2>Open Career Opportunities</h2>
        <p>Join our mission to craft the future of corporate data systems.</p>
      </div>

      {/* Search and Filters */}
      <div className="card" style={{ marginBottom: '2.5rem', padding: '1.25rem' }}>
        <div className="flex justify-between flex-wrap-mobile gap-2 align-center">
          <div className="flex align-center gap-1 form-group" style={{ flex: 2, marginBottom: 0 }}>
            <Search size={20} style={{ color: 'var(--text-tertiary)' }} />
            <input 
              type="text" 
              className="form-input" 
              placeholder="Search by job title..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <select 
              className="form-select"
              value={deptFilter}
              onChange={e => setDeptFilter(e.target.value)}
            >
              <option value="">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Marketing">Marketing</option>
              <option value="Operations">Operations</option>
              <option value="HR">HR</option>
            </select>
          </div>

          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <select 
              className="form-select"
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="Full-time">Full-Time</option>
              <option value="Part-time">Part-Time</option>
              <option value="Contract">Contract</option>
              <option value="Remote">Remote</option>
            </select>
          </div>
        </div>
      </div>

      {/* Jobs Grid */}
      {jobs.length === 0 ? (
        <div className="card text-center" style={{ padding: '4rem' }}>
          <Briefcase size={40} style={{ color: 'var(--text-tertiary)', marginBottom: '1rem' }} />
          <h3>No job vacancies found</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Check back later or adjust your search filters.</p>
        </div>
      ) : (
        <div className="grid grid-3">
          {jobs.map(job => (
            <div key={job.id} className="card flex flex-col justify-between">
              <div>
                <span className="badge badge-success" style={{ marginBottom: '0.75rem' }}>{job.type}</span>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{job.title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  {job.department} • {job.location}
                </p>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineBreak: 'anywhere' }}>
                  {job.description.substring(0, 150)}...
                </p>
              </div>
              <button 
                className="btn btn-primary" 
                style={{ marginTop: '1.5rem', width: '100%' }}
                onClick={() => {
                  setSelectedJob(job);
                  setApplying(false);
                  setMsg('');
                }}
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Job Detail & Apply Modal */}
      {selectedJob && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: applying ? '650px' : '750px' }}>
            <button className="modal-close" onClick={() => setSelectedJob(null)}>
              <X size={24} />
            </button>

            {!applying ? (
              // Job details view
              <div>
                <span className="badge badge-success" style={{ marginBottom: '0.5rem' }}>{selectedJob.type}</span>
                <h2 style={{ marginBottom: '0.5rem' }}>{selectedJob.title}</h2>
                <div className="flex gap-3" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                  <span className="flex align-center gap-1"><Briefcase size={16} /> {selectedJob.department}</span>
                  <span className="flex align-center gap-1"><MapPin size={16} /> {selectedJob.location}</span>
                  {selectedJob.salaryRange && <span className="flex align-center gap-1">💰 {selectedJob.salaryRange}</span>}
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ marginBottom: '0.5rem' }}>Job Description</h4>
                  <p style={{ color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>{selectedJob.description}</p>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                  <h4 style={{ marginBottom: '0.5rem' }}>Requirements</h4>
                  <p style={{ color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>{selectedJob.requirements}</p>
                </div>

                <div className="flex gap-2">
                  <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => setApplying(true)}>
                    Apply for this Job
                  </button>
                  <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setSelectedJob(null)}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              // Application Form view
              <div>
                <h3 style={{ marginBottom: '0.25rem' }}>Apply for {selectedJob.title}</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                  {selectedJob.department} • {selectedJob.location}
                </p>

                {msg && (
                  <div className={`badge ${msg.includes('successfully') ? 'badge-success' : 'badge-danger'}`} style={{ padding: '0.75rem', width: '100%', marginBottom: '1rem', display: 'block', textAlign: 'center' }}>
                    {msg}
                  </div>
                )}

                <form onSubmit={handleApplySubmit}>
                  <div className="grid grid-2">
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <input 
                        type="text" 
                        className="form-input"
                        value={appForm.name}
                        onChange={e => setAppForm({ ...appForm, name: e.target.value })}
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email Address</label>
                      <input 
                        type="email" 
                        className="form-input"
                        value={appForm.email}
                        onChange={e => setAppForm({ ...appForm, email: e.target.value })}
                        required 
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input 
                      type="tel" 
                      className="form-input"
                      value={appForm.phone}
                      onChange={e => setAppForm({ ...appForm, phone: e.target.value })}
                      required 
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Upload CV / Resume (PDF, DOC)</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: 'var(--bg-tertiary)', padding: '0.75rem', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                      <Upload size={20} style={{ color: 'var(--text-tertiary)' }} />
                      <input 
                        type="file" 
                        accept=".pdf,.doc,.docx"
                        onChange={e => setCvFile(e.target.files[0])}
                        required 
                      />
                    </div>
                    {cvFile && <span style={{ fontSize: '0.8rem', color: 'var(--primary)', marginTop: '0.25rem' }}>Selected: {cvFile.name}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Cover Letter</label>
                    <textarea 
                      className="form-textarea"
                      placeholder="Briefly introduce yourself and why you're a fit..."
                      value={appForm.coverLetter}
                      onChange={e => setAppForm({ ...appForm, coverLetter: e.target.value })}
                      required
                    ></textarea>
                  </div>

                  <div className="flex gap-2" style={{ marginTop: '1.5rem' }}>
                    <button type="submit" disabled={submitting} className="btn btn-primary" style={{ flex: 1 }}>
                      {submitting ? 'Submitting Application...' : 'Submit Application'}
                    </button>
                    <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setApplying(false)}>
                      Back
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
