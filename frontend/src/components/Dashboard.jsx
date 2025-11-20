// Import React and the useState hook to manage layout state
import React, { useState } from "react";

// Import the GridLayout component from react-grid-layout
import GridLayout from "react-grid-layout";

// Import default styles for grid layout and resizable widgets
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

// Define and export the Dashboard component
export default function Dashboard() {
  // Initial layout state: defines position and size of each widget
  const [layout, setLayout] = useState([
    {
      i: "menu",    // Unique ID for the hamburger menu widget
      x: 0,         // Column position (0 = far left)
      y: 0,         // Row position (0 = top)
      w: 2,         // Width in grid columns
      h: 1          // Height in grid rows
    },
    {
      i: "screener", // Unique ID for the screener widget
      x: 2,
      y: 0,
      w: 4,
      h: 2
    },
    {
      i: "calendar", // Unique ID for the calendar widget
      x: 0,
      y: 1,
      w: 3,
      h: 2
    }
  ]);

  // Render the draggable/resizable grid layout
  return (
    <GridLayout
      className="layout"          // CSS class for styling the grid
      layout={layout}             // Current layout state
      cols={12}                   // Total number of columns in the grid
      rowHeight={100}             // Height of each row in pixels
      width={1200}                // Total width of the grid in pixels
      onLayoutChange={(newLayout) => setLayout(newLayout)} // Update layout when widgets move/resize
    >
      {/* Hamburger menu widget */}
      <div key="menu" style={{ background: "#333", color: "#fff", padding: "10px" }}>
        {/* Unicode hamburger icon */}
        ☰ Hamburger Menu
      </div>

      {/* Screener widget */}
      <div key="screener" style={{ background: "#eee", padding: "10px" }}>
        📊 Screener Widget
      </div>

      {/* Calendar widget */}
      <div key="calendar" style={{ background: "#ddd", padding: "10px" }}>
        📅 Calendar Widget
      </div>
    </GridLayout>
  );
}
