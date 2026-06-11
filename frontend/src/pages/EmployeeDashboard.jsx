import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Phone, MapPin, Mail, Calendar, Briefcase, DollarSign, Upload, Bell, CheckCircle, CheckSquare } from 'lucide-react';

export default function EmployeeDashboard() {
  const { user, token, API_URL, BACKEND_URL } = useAuth();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', phoneNumber: '', address: '' });
  const [photoFile, setPhotoFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');
  const [announcements, setAnnouncements] = useState([]);

  // Task Board States
  const [tasks, setTasks] = useState([]);
  const [tasksPage, setTasksPage] = useState(1);
  const [tasksTotalPages, setTasksTotalPages] = useState(1);
  const [tasksLimit] = useState(5);
  const [tasksStatusFilter, setTasksStatusFilter] = useState('');

  const loadTasks = () => {
    const query = new URLSearchParams({
      page: tasksPage,
      limit: tasksLimit,
      status: tasksStatusFilter
    });
    fetch(`${API_URL}/tasks?${query.toString()}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setTasks(data.tasks || []);
        setTasksTotalPages(data.totalPages || 1);
      })
      .catch(console.error);
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        loadTasks();
      } else {
        alert('Failed to update task status');
      }
    } catch (error) {
      console.error('Update status error:', error);
    }
  };

  // Reset page parameters on filter changes
  useEffect(() => {
    setTasksPage(1);
  }, [tasksStatusFilter]);

  useEffect(() => {
    if (token) {
      loadTasks();
    }
  }, [token, tasksPage, tasksStatusFilter]);

  useEffect(() => {
    if (user && user.Employee) {
      setEmployee(user.Employee);
      setFormData({
        fullName: user.Employee.fullName || '',
        phoneNumber: user.Employee.phoneNumber || '',
        address: user.Employee.address || ''
      });
      setLoading(false);
    } else if (user && user.role === 'admin') {
      // Admins should be on the AdminDashboard, redirect
      window.location.href = '/dashboard';
    } else {
      // Fetch employee profile just in case
      setLoading(false);
    }

    // Fetch advertisements as company announcements
    fetch(`${API_URL}/ads`)
      .then(res => res.json())
      .then(data => setAnnouncements(data))
      .catch(console.error);
  }, [user, API_URL]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMsg('');

    try {
      const uploadData = new FormData();
      uploadData.append('fullName', formData.fullName);
      uploadData.append('phoneNumber', formData.phoneNumber);
      uploadData.append('address', formData.address);
      if (photoFile) {
        uploadData.append('photo', photoFile);
      }

      const response = await fetch(`${API_URL}/employees/${employee.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: uploadData
      });

      const updatedEmp = await response.json();

      if (response.ok) {
        setEmployee(updatedEmp);
        setEditing(false);
        setMsg('Profile successfully updated!');
        // Refresh page after a brief delay to update AuthContext state
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setMsg(updatedEmp.message || 'Update failed.');
      }
    } catch (error) {
      console.error(error);
      setMsg('Error saving profile changes.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="container text-center" style={{ padding: '6rem' }}><h3>Loading dashboard...</h3></div>;
  }

  if (!employee) {
    return (
      <div className="container text-center" style={{ padding: '6rem' }}>
        <h3>No Employee Profile Linked</h3>
        <p style={{ color: 'var(--text-secondary)' }}>Please contact the IT administrator to link your account.</p>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ padding: '3rem 1.5rem' }}>
      <div className="dashboard-header flex justify-between align-center flex-wrap-mobile gap-2" style={{ marginBottom: '2.5rem' }}>
        <div>
          <h2>Welcome back, {employee.fullName}!</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your personal details and view announcements.</p>
        </div>
        <div className="badge badge-success">
          Status: {employee.status}
        </div>
      </div>

      {msg && (
        <div className="badge badge-success" style={{ width: '100%', padding: '0.75rem', marginBottom: '2rem', display: 'block', textAlign: 'center' }}>
          {msg}
        </div>
      )}

      <div className="grid grid-3">
        {/* Profile Card */}
        <div className="card flex flex-col align-center text-center" style={{ gridColumn: 'span 1' }}>
          <img 
            src={employee.photoUrl ? (employee.photoUrl.startsWith('/uploads') ? `${BACKEND_URL}${employee.photoUrl}` : employee.photoUrl) : 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'} 
            alt={employee.fullName} 
            style={{ width: '130px', height: '130px', borderRadius: '50%', objectFit: 'cover', border: '4px solid var(--primary)', marginBottom: '1rem' }}
          />
          <h3>{employee.fullName}</h3>
          <p style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem', marginBottom: '1.5rem' }}>{employee.position}</p>

          <div style={{ width: '100%', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }} className="flex flex-col gap-2 text-left">
            <div className="flex align-center gap-1" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <Briefcase size={16} /> <span>{employee.department}</span>
            </div>
            <div className="flex align-center gap-1" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <Mail size={16} /> <span>{employee.email}</span>
            </div>
            <div className="flex align-center gap-1" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <Phone size={16} /> <span>{employee.phoneNumber || 'Not provided'}</span>
            </div>
            <div className="flex align-center gap-1" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <MapPin size={16} /> <span style={{ wordBreak: 'break-word' }}>{employee.address || 'Not provided'}</span>
            </div>
            <div className="flex align-center gap-1" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <Calendar size={16} /> <span>Hired: {employee.employmentDate}</span>
            </div>
            <div className="flex align-center gap-1" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <DollarSign size={16} /> <span>Salary: ${parseFloat(employee.salary).toLocaleString()} / yr</span>
            </div>
          </div>

          {!editing ? (
            <button className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem' }} onClick={() => setEditing(true)}>
              Edit Contact Info
            </button>
          ) : (
            <button className="btn btn-secondary" style={{ width: '100%', marginTop: '1.5rem' }} onClick={() => setEditing(false)}>
              Cancel
            </button>
          )}
        </div>

        {/* Action Panel / Edit Form */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          {editing ? (
            <div>
              <h3>Update Personal Information</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Modify your name, phone number, address, and upload a profile photo.</p>
              
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={formData.fullName} 
                    onChange={e => setFormData({ ...formData, fullName: e.target.value })} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={formData.phoneNumber} 
                    onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })} 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Address</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={formData.address} 
                    onChange={e => setFormData({ ...formData, address: e.target.value })} 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Upload New Photo</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: 'var(--bg-tertiary)', padding: '0.75rem', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                    <Upload size={20} style={{ color: 'var(--text-tertiary)' }} />
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={e => setPhotoFile(e.target.files[0])} 
                    />
                  </div>
                  {photoFile && <span style={{ fontSize: '0.8rem', color: 'var(--primary)', marginTop: '0.25rem' }}>Selected: {photoFile.name}</span>}
                </div>

                <button type="submit" disabled={submitting} className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem' }}>
                  {submitting ? 'Saving Changes...' : 'Save Profile Changes'}
                </button>
              </form>
            </div>
          ) : (
            <div className="grid grid-2" style={{ gap: '2rem' }}>
              {/* Task Board Section */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="flex align-center gap-2" style={{ marginBottom: '1.5rem' }}>
                  <CheckSquare size={24} style={{ color: 'var(--primary)' }} />
                  <h3>My Assigned Tasks</h3>
                </div>

                {/* Filter */}
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <select 
                    className="form-select" 
                    value={tasksStatusFilter} 
                    onChange={e => setTasksStatusFilter(e.target.value)}
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}
                  >
                    <option value="">All Tasks</option>
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2" style={{ flex: 1 }}>
                  {tasks.map(task => (
                    <div 
                      key={task.id} 
                      className="card" 
                      style={{ 
                        padding: '1rem', 
                        backgroundColor: 'var(--bg-tertiary)', 
                        borderColor: task.status === 'completed' ? 'var(--success)' : task.status === 'in_progress' ? 'var(--primary)' : 'var(--border-color)',
                        transform: 'none',
                        boxShadow: 'none'
                      }}
                    >
                      <div className="flex justify-between align-center" style={{ marginBottom: '0.5rem' }}>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{task.title}</h4>
                        <span className={`badge ${task.status === 'completed' ? 'badge-success' : task.status === 'in_progress' ? 'badge-primary' : 'badge-warning'}`} style={{ fontSize: '0.6rem' }}>
                          {task.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                        {task.description || 'No description provided.'}
                      </p>
                      <div className="flex justify-between align-center" style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                        <span>Due: {task.dueDate || 'No due date'}</span>
                        <div className="flex gap-1">
                          {task.status === 'pending' && (
                            <button 
                              className="btn btn-primary" 
                              style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', borderRadius: '4px' }}
                              onClick={() => handleUpdateTaskStatus(task.id, 'in_progress')}
                            >
                              Start
                            </button>
                          )}
                          {task.status === 'in_progress' && (
                            <button 
                              className="btn btn-success" 
                              style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', borderRadius: '4px', backgroundColor: 'var(--success)', color: '#fff' }}
                              onClick={() => handleUpdateTaskStatus(task.id, 'completed')}
                            >
                              Complete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {tasks.length === 0 && (
                    <div style={{ padding: '2rem', textAlign: 'center', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No tasks assigned.</p>
                    </div>
                  )}
                </div>

                {/* Pagination */}
                {tasksTotalPages > 1 && (
                  <div className="flex justify-center align-center gap-1" style={{ marginTop: '1rem' }}>
                    <button 
                      className="btn btn-secondary" 
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} 
                      disabled={tasksPage === 1}
                      onClick={() => setTasksPage(tasksPage - 1)}
                    >
                      Prev
                    </button>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{tasksPage} / {tasksTotalPages}</span>
                    <button 
                      className="btn btn-secondary" 
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} 
                      disabled={tasksPage === tasksTotalPages}
                      onClick={() => setTasksPage(tasksPage + 1)}
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>

              {/* Company Announcements Section */}
              <div>
                <div className="flex align-center gap-2" style={{ marginBottom: '1.5rem' }}>
                  <Bell size={24} style={{ color: 'var(--primary)' }} />
                  <h3>Company Announcements</h3>
                </div>

                {announcements.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                    <p style={{ color: 'var(--text-secondary)' }}>No current announcements.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {announcements.map(notice => (
                      <div key={notice.id} className="card" style={{ backgroundColor: 'var(--bg-tertiary)', padding: '1.25rem' }}>
                        <div className="flex justify-between align-center" style={{ marginBottom: '0.5rem' }}>
                          <h4 style={{ fontSize: '1.1rem' }}>{notice.title}</h4>
                          <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>Notice</span>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', marginBottom: '0.75rem' }}>{notice.description}</p>
                        {notice.mediaUrl && (
                          <img 
                            src={notice.mediaUrl.startsWith('/uploads') ? `${BACKEND_URL}${notice.mediaUrl}` : notice.mediaUrl} 
                            alt={notice.title} 
                            style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
