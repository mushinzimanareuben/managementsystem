import React from 'react';
import { Award, Compass, Heart, Shield, Users } from 'lucide-react';

export default function About() {
  const team = [
    { name: 'Dr. Evelyn Carter', role: 'CEO & Co-founder', bio: 'Former Operations Director at Google, Evelyn holds a PhD in Systems Optimization.', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80' },
    { name: 'David Vance', role: 'Chief Technical Officer', bio: 'Veteran full stack engineer and database architect with 15+ years of software design experience.', image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80' },
    { name: 'Siddharth Roy', role: 'Head of Marketing', bio: 'Strategic marketer specialized in programmatic advertisement systems and corporate visibility.', image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80' },
  ];

  const milestones = [
    { year: '2020', title: 'Company Founded', desc: 'Established SCMS with a core team of three engineers in Boston.' },
    { year: '2022', title: 'Series A Funding', desc: 'Secured $12M in Series A to expand dashboard analytical capabilities.' },
    { year: '2024', title: 'Global Operations', desc: 'Opened offices in London and Tokyo, supporting over 200 enterprises.' },
  ];

  return (
    <div className="animate-fade-in">
      {/* Page Title */}
      <section className="section" style={{ paddingBottom: '2rem' }}>
        <div className="container">
          <div className="section-title">
            <h2>About SCMS Group</h2>
            <p>Empowering organizations through secure, analytical operational infrastructure.</p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="section" style={{ backgroundColor: 'var(--bg-secondary)', padding: '4rem 0' }}>
        <div className="container">
          <div className="grid grid-2 gap-4">
            <div className="card flex flex-col gap-2">
              <div className="flex align-center gap-2" style={{ color: 'var(--primary)' }}>
                <Compass size={24} />
                <h3>Our Mission</h3>
              </div>
              <p style={{ color: 'var(--text-secondary)' }}>
                To create unified data ecosystems for companies that synthesize human relations, advertisements, communications, and workflows into single interfaces. We replace administrative clutter with secure automation.
              </p>
            </div>
            <div className="card flex flex-col gap-2">
              <div className="flex align-center gap-2" style={{ color: 'var(--primary)' }}>
                <Shield size={24} />
                <h3>Our Vision</h3>
              </div>
              <p style={{ color: 'var(--text-secondary)' }}>
                To become the premier operational operating system for businesses globally, allowing enterprise divisions to interact securely while providing executives with real-time, exportable analytics dashboards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* History Timeline */}
      <section className="section">
        <div className="container">
          <h3 style={{ textAlign: 'center', marginBottom: '3rem', fontSize: '1.75rem' }}>Our History & Achievements</h3>
          <div className="flex flex-col gap-3" style={{ maxWidth: '800px', margin: '0 auto' }}>
            {milestones.map((milestone, idx) => (
              <div key={idx} className="card flex align-center gap-3 flex-wrap-mobile">
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)', minWidth: '120px' }}>
                  {milestone.year}
                </div>
                <div>
                  <h4>{milestone.title}</h4>
                  <p style={{ color: 'var(--text-secondary)' }}>{milestone.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="section" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
        <div className="container">
          <h3 style={{ textAlign: 'center', marginBottom: '3rem', fontSize: '1.75rem' }}>Leadership Team</h3>
          <div className="grid grid-3">
            {team.map((member, idx) => (
              <div key={idx} className="card text-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <img 
                  src={member.image} 
                  alt={member.name} 
                  style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', marginBottom: '1.5rem', border: '3px solid var(--primary)' }}
                />
                <h4>{member.name}</h4>
                <p style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.75rem' }}>{member.role}</p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
