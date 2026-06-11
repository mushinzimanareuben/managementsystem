import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Users, Briefcase, Award, CheckCircle, Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';
import heroImage from '../assets/hero.png';

export default function Home() {
  const { API_URL, BACKEND_URL } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [ads, setAds] = useState([]);
  const [contactData, setContactData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    // Increment visitor count
    fetch(`${API_URL}/analytics/visitor`, { method: 'POST' }).catch(console.error);

    // Fetch jobs
    fetch(`${API_URL}/jobs`)
      .then(res => res.json())
      .then(data => setJobs(data.slice(0, 3)))
      .catch(console.error);

    // Fetch advertisements - show ALL ads
    fetch(`${API_URL}/ads`)
      .then(res => res.json())
      .then(data => setAds(data))
      .catch(console.error);
  }, [API_URL]);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'customer_info',
          data: contactData
        })
      });

      if (response.ok) {
        setSuccessMsg('Thank you! Your message has been received.');
        setContactData({ name: '', email: '', subject: '', message: '' });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdClick = (adId) => {
    // Record view in backend
    fetch(`${API_URL}/ads/${adId}`).catch(console.error);
  };

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="hero">
        <div className="container flex justify-between align-center flex-wrap-mobile gap-4">
          <div className="hero-content" style={{ flex: 1, minWidth: '300px' }}>
            <h1 className="hero-title">
              Streamline Your <span>Enterprise</span> Operations
            </h1>
            <p className="hero-subtitle">
              Smart Company Management System integrates your workforce management, advertising, customer inquiries, and job applications into a single premium platform.
            </p>
            <div className="flex gap-2">
              <a href="#services" className="btn btn-primary">
                Explore Services <ArrowRight size={18} />
              </a>
              <a href="#contact" className="btn btn-secondary">
                Contact Sales
              </a>
            </div>
          </div>

          <div className="hero-visual" style={{ flex: 1, minWidth: '320px' }}>
            <img
              src={heroImage}
              alt="Operations overview"
              style={{ width: '100%', borderRadius: '1.25rem', objectFit: 'cover', boxShadow: '0 24px 60px rgba(0,0,0,0.14)' }}
            />
          </div>
          {/* Ad Promotion Space */}
          {ads.length > 0 && (
            <div className="card glass-card" style={{ maxWidth: '400px', flex: 1, padding: '1.25rem' }}>
              <div className="badge badge-primary" style={{ marginBottom: '0.75rem' }}>Sponsored Announcement</div>
              <h4>{ads[0].title}</h4>
              <p style={{ fontSize: '0.9rem', margin: '0.5rem 0 1rem' }}>{ads[0].description}</p>
              {ads[0].mediaUrl && (
                <img 
                  src={ads[0].mediaUrl.startsWith('/uploads') ? `${BACKEND_URL}${ads[0].mediaUrl}` : ads[0].mediaUrl} 
                  alt={ads[0].title} 
                  style={{ width: '100%', borderRadius: 'var(--radius-sm)', maxHeight: '180px', objectFit: 'cover', marginBottom: '1rem' }}
                />
              )}
              <a 
                href={ads[0].promotionLink || '#'} 
                target="_blank" 
                rel="noreferrer" 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '0.5rem' }}
                onClick={() => handleAdClick(ads[0].id)}
              >
                Learn More
              </a>
            </div>
          )}
        </div>
      </section>

      {/* Intro Section */}
      <section className="section" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="container flex justify-between align-center flex-wrap-mobile gap-4">
          <div style={{ flex: 1, minWidth: '300px' }}>
            <div className="badge badge-primary" style={{ marginBottom: '1rem' }}>WHO WE ARE</div>
            <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Innovating Corporate Solutions for Tomorrow</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              We build intelligent operating frameworks that empower growing companies to manage their resources efficiently. From employee scheduling to marketing analytics, we align your operational workflows to maximize productivity.
            </p>
            <p style={{ color: 'var(--text-secondary)' }}>
              Driven by security, scalability, and premium design, our products represent the vanguard of corporate operations management.
            </p>
          </div>
          <div className="grid grid-2" style={{ flex: 1, minWidth: '300px' }}>
            <div className="card">
              <CheckCircle className="stat-icon" style={{ backgroundColor: 'var(--success-light)', color: 'var(--success)', marginBottom: '0.75rem' }} />
              <h5>Operational Speed</h5>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Accelerated workflow processing and analytics.</p>
            </div>
            <div className="card">
              <Users className="stat-icon" style={{ marginBottom: '0.75rem' }} />
              <h5>Workforce Synergy</h5>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Frictionless role integration and notifications.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container flex justify-between align-center flex-wrap-mobile gap-4">
          <div style={{ flex: 1, minWidth: '300px' }}>
            <h3>Visualize Your Workflows</h3>
            <p style={{ color: 'var(--text-secondary)', margin: '1rem 0' }}>
              Bring every team, campaign, and task into a unified dashboard with clean visuals and fast insight.
            </p>
            <p style={{ color: 'var(--text-secondary)' }}>
              Our platform displays operations, staffing, and analytics data in a centralized control center for easier decisions.
            </p>
          </div>
          <div style={{ flex: 1, minWidth: '300px' }}>
            <img
              src="/icons.svg"
              alt="Business management illustration"
              style={{ width: '100%', maxWidth: '520px', borderRadius: '1rem', background: '#fff', padding: '1rem', boxShadow: '0 15px 40px rgba(0,0,0,0.08)' }}
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="section" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
        <div className="container">
          <div className="grid grid-4 text-center">
            <div className="card" style={{ textAlign: 'center' }}>
              <Users className="stat-icon" style={{ margin: '0 auto 1rem' }} />
              <div className="stat-number">150+</div>
              <div className="stat-label">Employees</div>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <Briefcase className="stat-icon" style={{ margin: '0 auto 1rem' }} />
              <div className="stat-number">480+</div>
              <div className="stat-label">Projects Completed</div>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <Award className="stat-icon" style={{ margin: '0 auto 1rem' }} />
              <div className="stat-number">99.8%</div>
              <div className="stat-label">Client Satisfaction</div>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <MessageSquare className="stat-icon" style={{ margin: '0 auto 1rem' }} />
              <div className="stat-number">24/7</div>
              <div className="stat-label">Enterprise Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Services */}
      <section id="services" className="section">
        <div className="container">
          <div className="section-title">
            <h2>Our Core Services</h2>
            <p>Tailored enterprise solutions built to accelerate performance.</p>
          </div>
          <div className="grid grid-3">
            <div className="card">
              <h3>Enterprise HR</h3>
              <p style={{ color: 'var(--text-secondary)', margin: '1rem 0' }}>Comprehensive workforce management with advanced role controls, profile builders, and document storage.</p>
              <a href="/services" className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>Read More</a>
            </div>
            <div className="card">
              <h3>Targeted Advertising</h3>
              <p style={{ color: 'var(--text-secondary)', margin: '1rem 0' }}>Promote campaigns directly from the admin panel with scheduler logic and precise visitor view tracking metrics.</p>
              <a href="/services" className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>Read More</a>
            </div>
            <div className="card">
              <h3>Information Flow</h3>
              <p style={{ color: 'var(--text-secondary)', margin: '1rem 0' }}>Capture client inquiries, project bids, and resume uploads securely through customizable modules.</p>
              <a href="/services" className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>Read More</a>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Jobs Section */}
      {jobs.length > 0 && (
        <section className="section" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <div className="container">
            <div className="section-title">
              <h2>Join Our Growing Team</h2>
              <p>Explore current career openings and apply online.</p>
            </div>
            <div className="grid grid-3">
              {jobs.map(job => (
                <div key={job.id} className="card flex flex-col justify-between">
                  <div>
                    <div className="badge badge-success" style={{ marginBottom: '0.5rem' }}>{job.type}</div>
                    <h4>{job.title}</h4>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '0.5rem 0' }}>{job.department} • {job.location}</p>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineBreak: 'anywhere' }}>
                      {job.description.substring(0, 120)}...
                    </p>
                  </div>
                  <a href="/careers" className="btn btn-primary" style={{ marginTop: '1.5rem', width: '100%' }}>View Details</a>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Advertisements Section */}
      {ads.length > 0 && (
        <section className="section" style={{ background: 'linear-gradient(135deg, var(--bg-tertiary) 0%, var(--bg-secondary) 100%)' }}>
          <div className="container">
            <div className="section-title">
              <div className="badge badge-warning" style={{ marginBottom: '0.75rem', fontSize: '0.8rem' }}>📢 LATEST PROMOTIONS</div>
              <h2>Featured Announcements</h2>
              <p>Stay updated with our latest offers, news, and campaigns.</p>
            </div>
            <div className="grid grid-3">
              {ads.map(ad => (
                <div key={ad.id} className="card glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div className="badge badge-primary" style={{ alignSelf: 'flex-start' }}>Sponsored</div>
                  {ad.mediaUrl && (
                    <img
                      src={ad.mediaUrl.startsWith('/uploads') ? `${BACKEND_URL}${ad.mediaUrl}` : ad.mediaUrl}
                      alt={ad.title}
                      style={{ width: '100%', borderRadius: 'var(--radius-sm)', maxHeight: '200px', objectFit: 'cover' }}
                    />
                  )}
                  <h4 style={{ margin: 0 }}>{ad.title}</h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0, flex: 1 }}>{ad.description}</p>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>📅 Ends: {ad.endDate}</div>
                  <a
                    href={ad.promotionLink || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-primary"
                    style={{ width: '100%', textAlign: 'center' }}
                    onClick={() => handleAdClick(ad.id)}
                  >
                    Learn More
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section className="section" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
        <div className="container">
          <div className="section-title">
            <h2>What Our Clients Say</h2>
            <p>We work closely with industry leaders to shape enterprise efficiency.</p>
          </div>
          <div className="grid grid-3">
            <div className="card">
              <p style={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>"The integration of our employee database with live customer inquiry data and ad tracking has saved our team countless administrative hours."</p>
              <h5 style={{ marginTop: '1rem' }}>Sarah Jenkins</h5>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>VP Operations, NextTech Corp</p>
            </div>
            <div className="card">
              <p style={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>"Beautiful design, robust role-based access, and seamless exports. SCMS is the primary system driving our company data hubs."</p>
              <h5 style={{ marginTop: '1rem' }}>Marcus Brody</h5>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Director of IT, Apex Solutions</p>
            </div>
            <div className="card">
              <p style={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>"Our careers portal saw a 40% increase in applicant quality since using SCMS. The CV upload process is incredibly clean and fast."</p>
              <h5 style={{ marginTop: '1rem' }}>Linda Mercer</h5>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>HR Director, Innovate Ltd</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="section">
        <div className="container">
          <div className="section-title">
            <h2>Get In Touch</h2>
            <p>We would love to hear from you. Send us a message and we'll reply shortly.</p>
          </div>
          <div className="flex justify-between flex-wrap-mobile gap-4">
            <div className="card" style={{ flex: 1, minWidth: '300px' }}>
              <h3>Contact Information</h3>
              <p style={{ margin: '1rem 0 2rem', color: 'var(--text-secondary)' }}>Reach out via the channels below or drop a request directly in the form.</p>
                <div className="flex flex-col gap-3">
                <a
                  href="mailto:mushinzimanareuben@gmail.com"
                  className="flex align-center gap-2 contact-link-item"
                  style={{ textDecoration: 'none', color: 'inherit' }}
                  title="Send us an email"
                >
                  <Mail className="stat-icon" style={{ padding: '0.5rem' }} />
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Email Us</div>
                    <strong>mushinzimanareuben@gmail.com</strong>
                  </div>
                </a>
                <a
                  href="https://wa.me/250785037571"
                  target="_blank"
                  rel="noreferrer"
                  className="flex align-center gap-2 contact-link-item"
                  style={{ textDecoration: 'none', color: 'inherit' }}
                  title="Chat on WhatsApp"
                >
                  <Phone className="stat-icon" style={{ padding: '0.5rem', backgroundColor: 'var(--success-light)', color: 'var(--success)' }} />
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>WhatsApp Us</div>
                    <strong>+250 785 037 571</strong>
                  </div>
                </a>
                <a
                  href="https://www.google.com/maps/search/Butsure+Village,+Kigabiro+Cell,+Nyabitekeri+Sector,+Nyamasheke+District,+Western+Province,+Rwanda"
                  target="_blank"
                  rel="noreferrer"
                  className="flex align-center gap-2 contact-link-item"
                  style={{ textDecoration: 'none', color: 'inherit' }}
                  title="View on Google Maps"
                >
                  <MapPin className="stat-icon" style={{ padding: '0.5rem', backgroundColor: 'var(--warning-light)', color: 'var(--warning)' }} />
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Our Location</div>
                    <strong>Butsure Village, Kigabiro Cell</strong>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Nyabitekeri Sector, Nyamasheke District</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Western Province, Rwanda</div>
                  </div>
                </a>
              </div>
            </div>

            <div className="card" style={{ flex: 1.5, minWidth: '300px' }}>
              <h3>Send a Message</h3>
              {successMsg && (
                <div className="badge badge-success" style={{ padding: '0.75rem', width: '100%', margin: '1rem 0' }}>
                  {successMsg}
                </div>
              )}
              <form onSubmit={handleContactSubmit} style={{ marginTop: '1.5rem' }}>
                <div className="grid grid-2">
                  <div className="form-group">
                    <label className="form-label">Name</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={contactData.name} 
                      onChange={e => setContactData({ ...contactData, name: e.target.value })} 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input 
                      type="email" 
                      className="form-input" 
                      value={contactData.email} 
                      onChange={e => setContactData({ ...contactData, email: e.target.value })} 
                      required 
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={contactData.subject} 
                    onChange={e => setContactData({ ...contactData, subject: e.target.value })} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Message</label>
                  <textarea 
                    className="form-textarea" 
                    value={contactData.message} 
                    onChange={e => setContactData({ ...contactData, message: e.target.value })} 
                    required
                  ></textarea>
                </div>
                <button type="submit" disabled={submitting} className="btn btn-primary" style={{ width: '100%' }}>
                  {submitting ? 'Sending...' : 'Send Message'} <Send size={18} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
