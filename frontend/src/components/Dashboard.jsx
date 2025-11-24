// Import React and hooks
import React, { useState, useEffect } from "react";
import "./Dashboard.css"; // external CSS file for layout classes

export default function Dashboard() {
  // State: menu position (top, bottom, left, right)
  const [menuPosition, setMenuPosition] = useState("left"); // default, will be updated by orientation check

  // Effect: detect orientation and set default menu position
  useEffect(() => {
    // Function to check orientation
    const updatePosition = () => {
      // window.innerWidth > window.innerHeight → landscape
      if (window.innerWidth > window.innerHeight) {
        setMenuPosition("left"); // landscape default
      } else {
        setMenuPosition("top"); // portrait default
      }
    };

    // Run once on mount
    updatePosition();

    // Also run whenever window is resized
    window.addEventListener("resize", updatePosition);

    // Cleanup listener on unmount
    return () => window.removeEventListener("resize", updatePosition);
  }, []);

  return (
    <div className="dashboard">
      {/* Settings control: allows user to override menu position */}
      <div className="settings">
        <label htmlFor="menuPosition">Menu position:</label>
        <select
          id="menuPosition"
          value={menuPosition}
          onChange={(e) => setMenuPosition(e.target.value)}
        >
          <option value="top">Top</option>
          <option value="bottom">Bottom</option>
          <option value="left">Left</option>
          <option value="right">Right</option>
        </select>
      </div>

      {/* Menu: always rendered, class changes based on state */}
      <nav className={`menu menu-${menuPosition}`}>
        {/* Hamburger icon or label */}
        ☰ Menu
        {/* Example buttons for widgets */}
        <button>➕ Add Ticker</button>
        <button>📅 Calendar</button>
        <button>📰 News</button>
        <button>✍️ Blog</button>
        <button>🔐 Login</button>
      </nav>

      {/* Main content area */}
      <main className="content">
        {/* Widgets would render here */}
        <h1>Dashboard Content</h1>
      </main>
    </div>
  );
}
