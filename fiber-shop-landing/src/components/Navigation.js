import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/Navigation.css';
import Logo from './Logo';

export default function Navigation() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className="top-navigation" aria-label="Main navigation">
      <div className="nav-container">
        <Link to="/" className="nav-logo" aria-label="Fiber Agent - Home">
          <Logo size={32} />
          <span className="logo-text">FiberAgent</span>
        </Link>

        <ul className="nav-menu">
          <li className={`nav-item ${isActive('/')}`}>
            <Link to="/" className="nav-link" aria-current={isActive('/') ? 'page' : undefined}>Home</Link>
          </li>
          <li className={`nav-item ${isActive('/about')}`}>
            <Link to="/about" className="nav-link" aria-current={isActive('/about') ? 'page' : undefined}>About</Link>
          </li>
          <li className={`nav-item ${isActive('/demo')}`}>
            <Link to="/demo" className="nav-link" aria-current={isActive('/demo') ? 'page' : undefined}>Demo</Link>
          </li>
          <li className={`nav-item ${isActive('/agent')}`}>
            <Link to="/agent" className="nav-link" aria-current={isActive('/agent') ? 'page' : undefined}>For Agents</Link>
          </li>
          <li className={`nav-item ${isActive('/developers')}`}>
            <Link to="/developers" className="nav-link" aria-current={isActive('/developers') ? 'page' : undefined}>Docs</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
