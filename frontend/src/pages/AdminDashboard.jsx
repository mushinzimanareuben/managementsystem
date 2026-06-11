import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Users, Briefcase, BarChart3, MessageSquare, Plus, Edit2, Trash2, Eye, Download, LogOut, Check, Search, Calendar, FileText, X
} from 'lucide-react';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

export default function AdminDashboard() {
  const { token, logout, API_URL, BACKEND_URL } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Stats & Charts Data
  const [stats, setStats] = useState({ totalEmployees: 0, totalApplicants: 0, totalAds: 0, totalVisitors: 0 });
  const [activities, setActivities] = useState([]);
  const [chartData, setChartData] = useState({ departments: [], submissions: {}, ads: [] });

  // Entity Lists
  const [employees, setEmployees] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [ads, setAds] = useState([]);
  const [submissions, setSubmissions] = useState([]);

  // Modals state
  const [showEmpModal, setShowEmpModal] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [empForm, setEmpForm] = useState({ fullName: '', email: '', phoneNumber: '', position: '', department: 'Engineering', salary: '', address: '', status: 'active' });
  const [empPhoto, setEmpPhoto] = useState(null);

  const [showJobModal, setShowJobModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobForm, setJobForm] = useState({ title: '', department: 'Engineering', location: '', type: 'Full-time', description: '', requirements: '', salaryRange: '', status: 'open' });

  const [showAdModal, setShowAdModal] = useState(false);
  const [selectedAd, setSelectedAd] = useState(null);
  const [adForm, setAdForm] = useState({ title: '', description: '', mediaType: 'image', promotionLink: '', startDate: '', endDate: '', status: 'active' });
  const [adMedia, setAdMedia] = useState(null);

  // Search & Filter state
  const [empSearch, setEmpSearch] = useState('');
  const [empDeptFilter, setEmpDeptFilter] = useState('');
  const [subTypeFilter, setSubTypeFilter] = useState('');

  // Load Dashboard Stats
  const loadDashboardData = () => {
    fetch(`${API_URL}/analytics/dashboard`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setStats(data.metrics);
        setActivities(data.recentActivities);
        setChartData(data.charts);
      })
      .catch(console.error);
  };

  // Load Lists
  const loadEmployees = () => {
    const query = new URLSearchParams({ search: empSearch, department: empDeptFilter });
    fetch(`${API_URL}/employees?${query.toString()}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setEmployees(data.employees || []))
      .catch(console.error);
  };

  const loadJobs = () => {
    fetch(`${API_URL}/jobs?showClosed=true`)
      .then(res => res.json())
      .then(data => setJobs(data))
      .catch(console.error);
  };

  const loadAds = () => {
    fetch(`${API_URL}/ads?isAdmin=true`)
      .then(res => res.json())
      .then(data => setAds(data))
      .catch(console.error);
  };

  const loadSubmissions = () => {
    const query = new URLSearchParams();
    if (subTypeFilter) query.append('type', subTypeFilter);
    fetch(`${API_URL}/submissions?${query.toString()}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setSubmissions(data))
      .catch(console.error);
  };

  // Trigger loads based on tab
  useEffect(() => {
    loadDashboardData();
    if (activeTab === 'employees') loadEmployees();
    if (activeTab === 'jobs') loadJobs();
    if (activeTab === 'ads') loadAds();
    if (activeTab === 'submissions') loadSubmissions();
  }, [activeTab, empSearch, empDeptFilter, subTypeFilter]);

  // CRUD handlers
  // 1. Employees
  const handleSaveEmployee = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(empForm).forEach(key => formData.append(key, empForm[key]));
    if (empPhoto) formData.append('photo', empPhoto);

    const url = selectedEmp ? `${API_URL}/employees/${selectedEmp.id}` : `${API_URL}/employees`;
    const method = selectedEmp ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (response.ok) {
        setShowEmpModal(false);
        setSelectedEmp(null);
        setEmpPhoto(null);
        setEmpForm({ fullName: '', email: '', phoneNumber: '', position: '', department: 'Engineering', salary: '', address: '', status: 'active' });
        loadEmployees();
        loadDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteEmployee = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      await fetch(`${API_URL}/employees/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      loadEmployees();
      loadDashboardData();
    }
  };

  // 2. Jobs
  const handleSaveJob = async (e) => {
    e.preventDefault();
    const url = selectedJob ? `${API_URL}/jobs/${selectedJob.id}` : `${API_URL}/jobs`;
    const method = selectedJob ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(jobForm)
      });
      if (response.ok) {
        setShowJobModal(false);
        setSelectedJob(null);
        setJobForm({ title: '', department: 'Engineering', location: '', type: 'Full-time', description: '', requirements: '', salaryRange: '', status: 'open' });
        loadJobs();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteJob = async (id) => {
    if (window.confirm('Delete this job listing?')) {
      await fetch(`${API_URL}/jobs/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      loadJobs();
    }
  };

  // 3. Ads
  const handleSaveAd = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(adForm).forEach(key => formData.append(key, adForm[key]));
    if (adMedia) formData.append('media', adMedia);

    const url = selectedAd ? `${API_URL}/ads/${selectedAd.id}` : `${API_URL}/ads`;
    const method = selectedAd ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (response.ok) {
        setShowAdModal(false);
        setSelectedAd(null);
        setAdMedia(null);
        setAdForm({ title: '', description: '', mediaType: 'image', promotionLink: '', startDate: '', endDate: '', status: 'active' });
        loadAds();
        loadDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAd = async (id) => {
    if (window.confirm('Delete this advertisement?')) {
      await fetch(`${API_URL}/ads/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      loadAds();
      loadDashboardData();
    }
  };

  // 4. Submissions Update Status
  const handleUpdateSubStatus = async (id, status) => {
    await fetch(`${API_URL}/submissions/${id}/status`, {
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status })
    });
    loadSubmissions();
    loadDashboardData();
  };

  const handleDeleteSubmission = async (id) => {
    if (window.confirm('Delete this submission record?')) {
      await fetch(`${API_URL}/submissions/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      loadSubmissions();
      loadDashboardData();
    }
  };

  // Export handlers
  const triggerExport = (endpoint) => {
    window.open(`${API_URL}/export/${endpoint}?token=${token}`, '_blank');
  };

  // Chart configuration definitions
  const departmentChartData = {
    labels: chartData.departments.map(d => d.department),
    datasets: [{
      label: 'Number of Employees',
      data: chartData.departments.map(d => d.count),
      backgroundColor: 'rgba(59, 130, 246, 0.65)',
      borderColor: 'rgba(59, 130, 246, 1)',
      borderWidth: 1,
      borderRadius: 4
    }]
  };

  const submissionPieData = {
    labels: ['Customer Info', 'Service Request', 'Applications'],
    datasets: [{
      data: [
        chartData.submissions.customer_info || 0,
        chartData.submissions.service_request || 0,
        chartData.submissions.job_application || 0
      ],
      backgroundColor: ['rgba(16, 185, 129, 0.65)', 'rgba(245, 158, 11, 0.65)', 'rgba(59, 130, 246, 0.65)'],
      borderColor: ['#10b981', '#f59e0b', '#3b82f6'],
      borderWidth: 1
    }]
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2 className="sidebar-title">SCMS Console</h2>
        <ul className="sidebar-menu">
          <li>
            <button className={`sidebar-link ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
              <BarChart3 size={18} /> Dashboard Overview
            </button>
          </li>
          <li>
            <button className={`sidebar-link ${activeTab === 'employees' ? 'active' : ''}`} onClick={() => setActiveTab('employees')}>
              <Users size={18} /> Employee Directory
            </button>
          </li>
          <li>
            <button className={`sidebar-link ${activeTab === 'jobs' ? 'active' : ''}`} onClick={() => setActiveTab('jobs')}>
              <Briefcase size={18} /> Job Vacancies
            </button>
          </li>
          <li>
            <button className={`sidebar-link ${activeTab === 'ads' ? 'active' : ''}`} onClick={() => setActiveTab('ads')}>
              <Calendar size={18} /> Ad Manager
            </button>
          </li>
          <li>
            <button className={`sidebar-link ${activeTab === 'submissions' ? 'active' : ''}`} onClick={() => setActiveTab('submissions')}>
              <MessageSquare size={18} /> Submissions Hub
            </button>
          </li>
        </ul>
        <button className="btn btn-secondary" style={{ marginTop: 'auto', display: 'flex', gap: '0.5rem', width: '100%' }} onClick={logout}>
          <LogOut size={16} /> Sign Out
        </button>
      </aside>

      {/* Content */}
      <main className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="animate-fade-in">
            <div className="dashboard-header">
              <h2>Operational Overview</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Welcome to the administrator console. Monitor indicators below.</p>
            </div>

            {/* Stats */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon"><Users size={24} /></div>
                <div>
                  <div className="stat-number">{stats.totalEmployees}</div>
                  <div className="stat-label">Active Employees</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ backgroundColor: 'var(--success-light)', color: 'var(--success)' }}><FileText size={24} /></div>
                <div>
                  <div className="stat-number">{stats.totalApplicants}</div>
                  <div className="stat-label">Job Applicants</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ backgroundColor: 'var(--warning-light)', color: 'var(--warning)' }}><Calendar size={24} /></div>
                <div>
                  <div className="stat-number">{stats.totalAds}</div>
                  <div className="stat-label">Total Campaigns</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ backgroundColor: 'var(--danger-light)', color: 'var(--danger)' }}><BarChart3 size={24} /></div>
                <div>
                  <div className="stat-number">{stats.totalVisitors}</div>
                  <div className="stat-label">Page Visitors</div>
                </div>
              </div>
            </div>

            {/* Charts & Activity Logs */}
            <div className="grid grid-3" style={{ marginBottom: '2.5rem' }}>
              <div className="card" style={{ gridColumn: 'span 2' }}>
                <h3>Employee Department Share</h3>
                <div style={{ marginTop: '1.5rem', height: '260px' }}>
                  {chartData.departments.length > 0 ? (
                    <Bar data={departmentChartData} options={{ responsive: true, maintainAspectRatio: false }} />
                  ) : (
                    <div className="text-center" style={{ paddingTop: '5rem', color: 'var(--text-secondary)' }}>No department data available</div>
                  )}
                </div>
              </div>
              <div className="card">
                <h3>Submission Categories</h3>
                <div style={{ marginTop: '1.5rem', height: '260px' }}>
                  {Object.keys(chartData.submissions).length > 0 ? (
                    <Pie data={submissionPieData} options={{ responsive: true, maintainAspectRatio: false }} />
                  ) : (
                    <div className="text-center" style={{ paddingTop: '5rem', color: 'var(--text-secondary)' }}>No submission data</div>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Activities */}
            <div className="card">
              <h3>Recent Actions & Data Stream</h3>
              <div className="flex flex-col gap-2 animate-fade-in" style={{ marginTop: '1rem' }}>
                {activities.map(act => (
                  <div key={act.id} className="flex align-center justify-between" style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
                    <span>{act.text}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>{new Date(act.time).toLocaleDateString()}</span>
                  </div>
                ))}
                {activities.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No activity records.</p>}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'employees' && (
          <div className="animate-fade-in">
            <div className="dashboard-header flex justify-between align-center flex-wrap-mobile gap-2">
              <div>
                <h2>Employee Directory</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Manage profiles, salaries, roles, and status levels.</p>
              </div>
              <div className="flex gap-1 flex-wrap-mobile">
                <button className="btn btn-primary" onClick={() => { setSelectedEmp(null); setEmpForm({ fullName: '', email: '', phoneNumber: '', position: '', department: 'Engineering', salary: '', address: '', status: 'active' }); setShowEmpModal(true); }}>
                  <Plus size={16} /> Add Employee
                </button>
                <button className="btn btn-secondary" onClick={() => triggerExport('employees/excel')}>
                  <Download size={16} /> Excel Report
                </button>
                <button className="btn btn-secondary" onClick={() => triggerExport('employees/pdf')}>
                  <Download size={16} /> PDF Roster
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
              <div className="flex gap-2 flex-wrap-mobile align-center">
                <div className="flex align-center gap-1 form-group" style={{ marginBottom: 0, flex: 2 }}>
                  <Search size={18} />
                  <input type="text" className="form-input" placeholder="Search by name, position..." value={empSearch} onChange={e => setEmpSearch(e.target.value)} />
                </div>
                <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
                  <select className="form-select" value={empDeptFilter} onChange={e => setEmpDeptFilter(e.target.value)}>
                    <option value="">All Departments</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Operations">Operations</option>
                    <option value="HR">HR</option>
                  </select>
                </div>
              </div>
            </div>

            {/* List */}
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Position / Dept</th>
                    <th>Salary</th>
                    <th>Hired Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map(emp => (
                    <tr key={emp.id}>
                      <td>
                        <div className="flex align-center gap-2">
                          <img src={emp.photoUrl ? (emp.photoUrl.startsWith('/uploads') ? `${BACKEND_URL}${emp.photoUrl}` : emp.photoUrl) : 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&auto=format&fit=crop&q=80'} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                          <div>
                            <strong>{emp.fullName}</strong>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{emp.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <strong>{emp.position}</strong>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{emp.department}</div>
                      </td>
                      <td>${parseFloat(emp.salary).toLocaleString()}</td>
                      <td>{emp.employmentDate}</td>
                      <td>
                        <span className={`badge ${emp.status === 'active' ? 'badge-success' : emp.status === 'on_leave' ? 'badge-warning' : 'badge-danger'}`}>{emp.status}</span>
                      </td>
                      <td>
                        <div className="flex gap-1">
                          <button className="btn-icon" onClick={() => {
                            setSelectedEmp(emp);
                            setEmpForm({
                              fullName: emp.fullName,
                              email: emp.email,
                              phoneNumber: emp.phoneNumber || '',
                              position: emp.position,
                              department: emp.department,
                              salary: emp.salary,
                              address: emp.address || '',
                              status: emp.status
                            });
                            setShowEmpModal(true);
                          }}>
                            <Edit2 size={14} />
                          </button>
                          <button className="btn-icon" style={{ color: 'var(--danger)' }} onClick={() => handleDeleteEmployee(emp.id)}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {employees.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center" style={{ padding: '2rem' }}>No employees registered.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Employee Modal */}
            {showEmpModal && (
              <div className="modal-overlay">
                <div className="modal-content">
                  <button className="modal-close" onClick={() => setShowEmpModal(false)}><X size={20} /></button>
                  <h3>{selectedEmp ? 'Edit Profile' : 'Register New Employee'}</h3>
                  <form onSubmit={handleSaveEmployee} style={{ marginTop: '1.5rem' }}>
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <input type="text" className="form-input" value={empForm.fullName} onChange={e => setEmpForm({ ...empForm, fullName: e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email</label>
                      <input type="email" className="form-input" value={empForm.email} onChange={e => setEmpForm({ ...empForm, email: e.target.value })} required disabled={!!selectedEmp} />
                    </div>
                    <div className="grid grid-2">
                      <div className="form-group">
                        <label className="form-label">Phone</label>
                        <input type="text" className="form-input" value={empForm.phoneNumber} onChange={e => setEmpForm({ ...empForm, phoneNumber: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Position</label>
                        <input type="text" className="form-input" value={empForm.position} onChange={e => setEmpForm({ ...empForm, position: e.target.value })} required />
                      </div>
                    </div>
                    <div className="grid grid-2">
                      <div className="form-group">
                        <label className="form-label">Department</label>
                        <select className="form-select" value={empForm.department} onChange={e => setEmpForm({ ...empForm, department: e.target.value })}>
                          <option value="Engineering">Engineering</option>
                          <option value="Marketing">Marketing</option>
                          <option value="Operations">Operations</option>
                          <option value="HR">HR</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Salary</label>
                        <input type="number" className="form-input" value={empForm.salary} onChange={e => setEmpForm({ ...empForm, salary: e.target.value })} required />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Address</label>
                      <input type="text" className="form-input" value={empForm.address} onChange={e => setEmpForm({ ...empForm, address: e.target.value })} />
                    </div>
                    <div className="grid grid-2">
                      <div className="form-group">
                        <label className="form-label">Status</label>
                        <select className="form-select" value={empForm.status} onChange={e => setEmpForm({ ...empForm, status: e.target.value })}>
                          <option value="active">Active</option>
                          <option value="on_leave">On Leave</option>
                          <option value="terminated">Terminated</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Photo Upload</label>
                        <input type="file" onChange={e => setEmpPhoto(e.target.files[0])} />
                      </div>
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem' }}>Save Employee</button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'jobs' && (
          <div className="animate-fade-in">
            <div className="dashboard-header flex justify-between align-center">
              <div>
                <h2>Job Vacancies</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Publish and status-track openings across departments.</p>
              </div>
              <button className="btn btn-primary" onClick={() => { setSelectedJob(null); setJobForm({ title: '', department: 'Engineering', location: '', type: 'Full-time', description: '', requirements: '', salaryRange: '', status: 'open' }); setShowJobModal(true); }}>
                <Plus size={16} /> Create Vacancy
              </button>
            </div>

            {/* List */}
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Job Title</th>
                    <th>Department</th>
                    <th>Type / Location</th>
                    <th>Salary Estimate</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map(job => (
                    <tr key={job.id}>
                      <td><strong>{job.title}</strong></td>
                      <td>{job.department}</td>
                      <td>{job.type} / {job.location}</td>
                      <td>{job.salaryRange || 'N/A'}</td>
                      <td>
                        <span className={`badge ${job.status === 'open' ? 'badge-success' : 'badge-danger'}`}>{job.status}</span>
                      </td>
                      <td>
                        <div className="flex gap-1">
                          <button className="btn-icon" onClick={() => {
                            setSelectedJob(job);
                            setJobForm({
                              title: job.title,
                              department: job.department,
                              location: job.location,
                              type: job.type,
                              description: job.description,
                              requirements: job.requirements,
                              salaryRange: job.salaryRange || '',
                              status: job.status
                            });
                            setShowJobModal(true);
                          }}>
                            <Edit2 size={14} />
                          </button>
                          <button className="btn-icon" style={{ color: 'var(--danger)' }} onClick={() => handleDeleteJob(job.id)}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {jobs.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center" style={{ padding: '2rem' }}>No job vacancy posts exist.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Job Modal */}
            {showJobModal && (
              <div className="modal-overlay">
                <div className="modal-content">
                  <button className="modal-close" onClick={() => setShowJobModal(false)}><X size={20} /></button>
                  <h3>{selectedJob ? 'Edit Vacancy' : 'New Job Vacancy'}</h3>
                  <form onSubmit={handleSaveJob} style={{ marginTop: '1.5rem' }}>
                    <div className="form-group">
                      <label className="form-label">Job Title</label>
                      <input type="text" className="form-input" value={jobForm.title} onChange={e => setJobForm({ ...jobForm, title: e.target.value })} required />
                    </div>
                    <div className="grid grid-2">
                      <div className="form-group">
                        <label className="form-label">Department</label>
                        <select className="form-select" value={jobForm.department} onChange={e => setJobForm({ ...jobForm, department: e.target.value })}>
                          <option value="Engineering">Engineering</option>
                          <option value="Marketing">Marketing</option>
                          <option value="Operations">Operations</option>
                          <option value="HR">HR</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Location</label>
                        <input type="text" className="form-input" placeholder="e.g. London, UK" value={jobForm.location} onChange={e => setJobForm({ ...jobForm, location: e.target.value })} required />
                      </div>
                    </div>
                    <div className="grid grid-2">
                      <div className="form-group">
                        <label className="form-label">Contract Type</label>
                        <select className="form-select" value={jobForm.type} onChange={e => setJobForm({ ...jobForm, type: e.target.value })}>
                          <option value="Full-time">Full-time</option>
                          <option value="Part-time">Part-time</option>
                          <option value="Contract">Contract</option>
                          <option value="Remote">Remote</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Salary Range</label>
                        <input type="text" className="form-input" placeholder="e.g. $80k - $100k" value={jobForm.salaryRange} onChange={e => setJobForm({ ...jobForm, salaryRange: e.target.value })} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Job Description</label>
                      <textarea className="form-textarea" value={jobForm.description} onChange={e => setJobForm({ ...jobForm, description: e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Requirements</label>
                      <textarea className="form-textarea" value={jobForm.requirements} onChange={e => setJobForm({ ...jobForm, requirements: e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Publishing Status</label>
                      <select className="form-select" value={jobForm.status} onChange={e => setJobForm({ ...jobForm, status: e.target.value })}>
                        <option value="open">Open (Publicly Visible)</option>
                        <option value="closed">Closed / Internal Only</option>
                      </select>
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem' }}>Save Vacancy</button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'ads' && (
          <div className="animate-fade-in">
            <div className="dashboard-header flex justify-between align-center">
              <div>
                <h2>Ad & Promotion Manager</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Publish campaigns, schedule durations, and check visitor views counts.</p>
              </div>
              <button className="btn btn-primary" onClick={() => { setSelectedAd(null); setAdForm({ title: '', description: '', mediaType: 'image', promotionLink: '', startDate: '', endDate: '', status: 'active' }); setShowAdModal(true); }}>
                <Plus size={16} /> Build Campaign
              </button>
            </div>

            {/* List */}
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Campaign details</th>
                    <th>Timeline</th>
                    <th>Tracked Views</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {ads.map(ad => (
                    <tr key={ad.id}>
                      <td>
                        <div className="flex align-center gap-2">
                          {ad.mediaUrl && <img src={ad.mediaUrl.startsWith('/uploads') ? `${BACKEND_URL}${ad.mediaUrl}` : ad.mediaUrl} style={{ width: '50px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />}
                          <div>
                            <strong>{ad.title}</strong>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Type: {ad.mediaType}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem' }}>Start: {ad.startDate}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>End: {ad.endDate}</div>
                      </td>
                      <td style={{ fontWeight: 800 }}>{ad.views} views</td>
                      <td>
                        <span className={`badge ${ad.status === 'active' ? 'badge-success' : ad.status === 'paused' ? 'badge-warning' : 'badge-danger'}`}>{ad.status}</span>
                      </td>
                      <td>
                        <div className="flex gap-1">
                          <button className="btn-icon" onClick={() => {
                            setSelectedAd(ad);
                            setAdForm({
                              title: ad.title,
                              description: ad.description,
                              mediaType: ad.mediaType,
                              promotionLink: ad.promotionLink || '',
                              startDate: ad.startDate,
                              endDate: ad.endDate,
                              status: ad.status
                            });
                            setShowAdModal(true);
                          }}>
                            <Edit2 size={14} />
                          </button>
                          <button className="btn-icon" style={{ color: 'var(--danger)' }} onClick={() => handleDeleteAd(ad.id)}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {ads.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center" style={{ padding: '2rem' }}>No ad campaigns created.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Ad Modal */}
            {showAdModal && (
              <div className="modal-overlay">
                <div className="modal-content">
                  <button className="modal-close" onClick={() => setShowAdModal(false)}><X size={20} /></button>
                  <h3>{selectedAd ? 'Edit Ad Campaign' : 'Create Ad Campaign'}</h3>
                  <form onSubmit={handleSaveAd} style={{ marginTop: '1.5rem' }}>
                    <div className="form-group">
                      <label className="form-label">Campaign Title</label>
                      <input type="text" className="form-input" value={adForm.title} onChange={e => setAdForm({ ...adForm, title: e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Description / Promotion text</label>
                      <textarea className="form-textarea" value={adForm.description} onChange={e => setAdForm({ ...adForm, description: e.target.value })} required />
                    </div>
                    <div className="grid grid-2">
                      <div className="form-group">
                        <label className="form-label">Media Type</label>
                        <select className="form-select" value={adForm.mediaType} onChange={e => setAdForm({ ...adForm, mediaType: e.target.value })}>
                          <option value="image">Image</option>
                          <option value="video">Video</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Promotion Link</label>
                        <input type="text" className="form-input" placeholder="e.g. https://domain.com/sale" value={adForm.promotionLink} onChange={e => setAdForm({ ...adForm, promotionLink: e.target.value })} />
                      </div>
                    </div>
                    <div className="grid grid-2">
                      <div className="form-group">
                        <label className="form-label">Start Date</label>
                        <input type="date" className="form-input" value={adForm.startDate} onChange={e => setAdForm({ ...adForm, startDate: e.target.value })} required />
                      </div>
                      <div className="form-group">
                        <label className="form-label">End Date</label>
                        <input type="date" className="form-input" value={adForm.endDate} onChange={e => setAdForm({ ...adForm, endDate: e.target.value })} required />
                      </div>
                    </div>
                    <div className="grid grid-2">
                      <div className="form-group">
                        <label className="form-label">Status</label>
                        <select className="form-select" value={adForm.status} onChange={e => setAdForm({ ...adForm, status: e.target.value })}>
                          <option value="active">Active</option>
                          <option value="paused">Paused</option>
                          <option value="scheduled">Scheduled</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Media File</label>
                        <input type="file" onChange={e => setAdMedia(e.target.files[0])} />
                      </div>
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem' }}>Save Campaign</button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'submissions' && (
          <div className="animate-fade-in">
            <div className="dashboard-header flex justify-between align-center">
              <div>
                <h2>Submissions Hub (Data Collection)</h2>
                <p style={{ color: 'var(--text-secondary)' }}>View client messages, service consultations, and job applications securely.</p>
              </div>
              <button className="btn btn-secondary" onClick={() => triggerExport('submissions/excel')}>
                <Download size={16} /> Export to Excel
              </button>
            </div>

            {/* Filters */}
            <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
              <div className="flex gap-2">
                <button className={`btn ${!subTypeFilter ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setSubTypeFilter('')}>All Forms</button>
                <button className={`btn ${subTypeFilter === 'customer_info' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setSubTypeFilter('customer_info')}>Inquiries</button>
                <button className={`btn ${subTypeFilter === 'service_request' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setSubTypeFilter('service_request')}>Service Requests</button>
                <button className={`btn ${subTypeFilter === 'job_application' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setSubTypeFilter('job_application')}>Applications</button>
              </div>
            </div>

            {/* List */}
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Details</th>
                    <th>CV Link</th>
                    <th>Submitted At</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map(sub => {
                    const payload = sub.data;
                    const subId = sub._id || sub.id;
                    return (
                      <tr key={subId}>
                        <td>
                          <span className={`badge ${sub.type === 'job_application' ? 'badge-primary' : sub.type === 'service_request' ? 'badge-warning' : 'badge-success'}`}>
                            {sub.type.replace('_', ' ')}
                          </span>
                        </td>
                        <td>
                          {sub.type === 'customer_info' && (
                            <div>
                              <strong>{payload.name}</strong> ({payload.email})<br />
                              <span style={{ fontSize: '0.85rem' }}>Sub: {payload.subject}</span><br />
                              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>"{payload.message}"</span>
                            </div>
                          )}
                          {sub.type === 'service_request' && (
                            <div>
                              <strong>Client: {payload.clientName}</strong> ({payload.email})<br />
                              <span style={{ fontSize: '0.85rem' }}>Request: {payload.serviceName}</span><br />
                              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Notes: "{payload.notes}"</span>
                            </div>
                          )}
                          {sub.type === 'job_application' && (
                            <div>
                              <strong>Applicant: {payload.applicantName}</strong> ({payload.applicantEmail})<br />
                              <span style={{ fontSize: '0.85rem' }}>Job: {payload.jobTitle}</span><br />
                              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Cover: "{payload.coverLetter}"</span>
                            </div>
                          )}
                        </td>
                        <td>
                          {sub.cvUrl ? (
                            <a href={`${BACKEND_URL}${sub.cvUrl}`} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                              <FileText size={12} /> Download CV
                            </a>
                          ) : 'N/A'}
                        </td>
                        <td style={{ fontSize: '0.85rem' }}>{new Date(sub.createdAt).toLocaleDateString()}</td>
                        <td>
                          <select className="form-select" style={{ padding: '0.25rem', fontSize: '0.85rem', width: 'auto' }} value={sub.status} onChange={e => handleUpdateSubStatus(subId, e.target.value)}>
                            <option value="pending">Pending</option>
                            <option value="reviewed">Reviewed</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </td>
                        <td>
                          <button className="btn-icon" style={{ color: 'var(--danger)' }} onClick={() => handleDeleteSubmission(subId)}>
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {submissions.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center" style={{ padding: '2rem' }}>No submission entries found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
