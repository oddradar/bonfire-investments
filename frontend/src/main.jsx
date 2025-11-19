// React + ReactDOM are needed to render components
import React from "react";
import ReactDOM from "react-dom/client";

// Import the root App component
import App from "./App";

// Render App into the #root div in index.html
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
