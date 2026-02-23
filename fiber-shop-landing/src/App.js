import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import LandingPage from './pages/LandingPage';
import AboutPage from './pages/AboutPage';
import DemoPage from './pages/DemoPage';
import AgentPage from './pages/AgentPage';
import UserPage from './pages/UserPage';
import StatisticsPage from './components/StatisticsPage';
import ComparePage from './pages/ComparePage';
import VisualDemoPage from './pages/VisualDemoPage';
import OnePagerPage from './pages/OnePagerPage';
import CapabilitiesPage from './pages/CapabilitiesPage';

function App() {
  return (
    <Router>
      <Navigation />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/demo" element={<DemoPage />} />
        <Route path="/agent" element={<AgentPage />} />
        <Route path="/user" element={<UserPage />} />
        <Route path="/stats" element={<StatisticsPage />} />
        <Route path="/compare" element={<ComparePage />} />
        <Route path="/visual-demo" element={<VisualDemoPage />} />
        <Route path="/onepager" element={<OnePagerPage />} />
        <Route path="/capabilities" element={<CapabilitiesPage />} />
      </Routes>
    </Router>
  );
}

export default App;
