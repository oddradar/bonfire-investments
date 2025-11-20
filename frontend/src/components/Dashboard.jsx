// Import React and useState hook for managing layout state
import React, { useState } from "react";

// Import the GridLayout component from react-grid-layout
import GridLayout from "react-grid-layout";

// Import default styles for grid layout and resizable widgets
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

// Dashboard component: renders a draggable, resizable grid of widgets
export default function Dashboard() {
  // Define initial layout: each item has an id (i), position (x, y), width (w), and height (h)
  const [layout, setLayout] = useState([
    { i: "menu", x: 0, y: 0, w: 2, h: 1 },       // Hamburger menu widget
    { i: "screener", x: 2, y: 0, w: 4, h: 2 },   // Stock screener widget
    { i: "calendar", x: 0, y: 1, w: 3, h: 2 },   // Calendar widget
  ]);

  // Render the grid layout with draggable/resizable widgets
  return (
    <GridLayout
      className="layout"          // CSS class for styling
      layout={layout}             // Current layout state
      cols={12}                   // Total number of columns in the grid
      rowHeight={100}             // Height of each grid row (in pixels)
      width={1200}                // Total width of the grid (in pixels)
      onLayoutChange={(newLayout) => setLayout(newLayout)} // Update layout when widgets are moved/resized
    >
      {/* Hamburger menu widget (draggable) */}
      <div key="menu" style={{ background: "#333", color: "#fff" }}>
        ☰ Menu
      </div>

      {/* Screener widget (draggable) */}
      <div key="screener" style={{ background: "#eee" }}>
        📊 Screener
      </div>

      {/* Calendar widget (draggable) */}
      <div key="calendar" style={{ background: "#ddd" }}>
        📅 Calendar
      </div>
    </GridLayout>
  );
}
