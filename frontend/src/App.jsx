// App.jsx
// Fully commented example using React Router for page navigation

import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "./App.css";

// Simple page components
function HomePage() {
  return <h1>🏠 User Homepage</h1>;
}

function TickerPage() {
  return <h1>📈 Ticker Page</h1>;
}

function CalendarPage() {
  return <h1>📅 Calendar Page</h1>;
}

function NewsPage() {
  return <h1>📰 News Page</h1>;
}

function BlogPage() {
  return <h1>✍️ Blog Page</h1>;
}

function SettingsPage() {
  return <h1>⚙️ Settings Page</h1>;
}

export default function App() {
  return (
    <Router>
      {/* Menu bar at the top (homepage navigation) */}
      <nav className="menu-bar">
        {/* Each Link is a menu item that routes to a page */}
        <Link to="/">Home</Link>
        <Link to="/ticker">Ticker</Link>
        <Link to="/calendar">Calendar</Link>
        <Link to="/news">News</Link>
        <Link to="/blog">Blog</Link>
        <Link to="/settings">Settings</Link>
      </nav>

      {/* Page content area */}
      <main className="page-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/ticker" element={<TickerPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>
    </Router>
  );
}
