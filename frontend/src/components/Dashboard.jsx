// Import React and hooks
import React, { useState, useEffect } from "react";
import "./Dashboard.css"; // external CSS file

export default function Dashboard() {
  // State: menu position (top, bottom, left, right)
  const [menuPosition, setMenuPosition] = useState("left");

  // Effect: detect orientation and set default menu position
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
    <div className="dashboard">
      {/* Settings control: user can override menu position */}
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

      {/* Menu: class changes based on state */}
      <nav className={`menu menu-${menuPosition}`}>
        {/* Each button is sized naturally; menu width adapts to longest */}
        <button>☰ Menu</button>
        <button>➕ Add Ticker</button>
        <button>📅 Calendar</button>
        <button>📰 News</button>
        <button>✍️ Blog</button>
        <button>🔐 Login</button>
      </nav>

      {/* Main content */}
      <main className="content">
        <h1>Dashboard Content</h1>
      </main>
    </div>
  );
}
