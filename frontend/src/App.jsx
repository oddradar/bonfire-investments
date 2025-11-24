import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "./App.css";

// Page components
import HomePage from "./pages/HomePage";
import TickerPage from "./pages/TickerPage";
import CalendarPage from "./pages/CalendarPage";
import NewsPage from "./pages/NewsPage";
import BlogPage from "./pages/BlogPage";
import SettingsPage from "./pages/SettingsPage";

export default function App() {
  // Menu position state: top, bottom, left, right
  const [menuPosition, setMenuPosition] = useState("left");

  // Detect orientation on mount and resize
  useEffect(() => {
    const updatePosition = () => {
      if (window.innerWidth > window.innerHeight) {
        setMenuPosition("left"); // landscape default
      } else {
        setMenuPosition("top"); // portrait default
      }
    };
    updatePosition();
    window.addEventListener("resize", updatePosition);
    return () => window.removeEventListener("resize", updatePosition);
  }, []);

  return (
    <Router>
      {/* Menu bar with dynamic position */}
      <nav className={`menu menu-${menuPosition}`}>
        <Link to="/">Home</Link>
        <Link to="/ticker">Ticker</Link>
        <Link to="/calendar">Calendar</Link>
        <Link to="/news">News</Link>
        <Link to="/blog">Blog</Link>
        <Link to="/settings">Settings</Link>
      </nav>

      {/* Page content */}
      <main className="page-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/ticker" element={<TickerPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route
            path="/settings"
            element={
              <SettingsPage
                menuPosition={menuPosition}
                setMenuPosition={setMenuPosition}
              />
            }
          />
        </Routes>
      </main>
    </Router>
  );
}
