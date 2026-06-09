import React from 'react';
import { Mail, Phone, MapPin, CheckSquare, Github, Twitter, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{ backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', padding: '4rem 0 2rem' }}>
      <div className="container">
        <div className="grid grid-3" style={{ marginBottom: '3rem' }}>
          <div>
            <h3 className="nav-logo" style={{ marginBottom: '1rem' }}>
              <CheckSquare size={24} /> Smart Company
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              A modern operational hub synthesizing workforce data collection, public career portals, and targeted advertisement trackers.
            </p>
            <div className="flex gap-2">
              <a href="#" className="btn-icon" style={{ padding: '0.4rem' }}><Twitter size={16} /></a>
              <a href="#" className="btn-icon" style={{ padding: '0.4rem' }}><Linkedin size={16} /></a>
              <a href="#" className="btn-icon" style={{ padding: '0.4rem' }}><Github size={16} /></a>
            </div>
          </div>

          <div>
            <h4 style={{ marginBottom: '1rem' }}>Platform Navigation</h4>
            <div className="flex flex-col gap-2" style={{ fontSize: '0.9rem' }}>
              <a href="/" className="nav-link">Home</a>
              <a href="/about" className="nav-link">About Us</a>
              <a href="/services" className="nav-link">Services</a>
              <a href="/careers" className="nav-link">Careers</a>
            </div>
          </div>

          <div>
            <h4 style={{ marginBottom: '1rem' }}>Help & Operations</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
              For support inquiries, system integration, or employee profile linkages, contact our operations center.
            </p>
            <div className="flex flex-col gap-2" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <div className="flex align-center gap-1"><Mail size={14} /> mushinzimanareuben@gmail.com</div>
              <div className="flex align-center gap-1"><Phone size={14} /> +250785037571 (WhatsApp)</div>
              <div className="flex align-center gap-1"><MapPin size={14} /> 100 Enterprise Way, Boston MA</div>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
          © {new Date().getFullYear()} Smart Company Management System (SCMS). All rights reserved. Secure JWT Authentication Active.
        </div>
      </div>
    </footer>
  );
}
