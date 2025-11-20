// Import React and hooks
import React, { useState, useEffect } from "react";
import GridLayout from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

// Helper: fetch ticker data from Yahoo Finance API
async function fetchTickerData(symbol) {
  const res = await fetch(
    `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbol}`
  );
  const data = await res.json();
  const quote = data.quoteResponse.result[0];
  return {
    name: quote.longName || quote.shortName,
    symbol: quote.symbol,
    price: quote.regularMarketPrice,
    dayHigh: quote.regularMarketDayHigh,
    dayLow: quote.regularMarketDayLow,
    yearHigh: quote.fiftyTwoWeekHigh,
    yearLow: quote.fiftyTwoWeekLow,
    // Placeholder metrics for compare mode
    totalReturn: "N/A",
    priceReturn: "N/A",
    nav: "N/A"
  };
}

export default function Dashboard() {
  // Layout state (persisted)
  const [layout, setLayout] = useState(() => {
    const saved = localStorage.getItem("dashboard-layout");
    return saved ? JSON.parse(saved) : [{ i: "menu", x: 0, y: 0, w: 2, h: 1 }];
  });

  // Ticker widgets state (persisted)
  const [tickers, setTickers] = useState(() => {
    const saved = localStorage.getItem("dashboard-tickers");
    return saved ? JSON.parse(saved) : [];
  });

  // Fullscreen overlay state
  const [fullscreenWidget, setFullscreenWidget] = useState(null);

  // Hamburger menu open/closed
  const [menuOpen, setMenuOpen] = useState(false);

  // Persist layout + tickers
  useEffect(() => {
    localStorage.setItem("dashboard-layout", JSON.stringify(layout));
    localStorage.setItem("dashboard-tickers", JSON.stringify(tickers));
  }, [layout, tickers]);

  // Add ticker widget
  const addTicker = async (symbol) => {
    const data = await fetchTickerData(symbol);
    const id = `ticker-${symbol}-${Date.now()}`;
    setLayout((prev) => [...prev, { i: id, x: 0, y: Infinity, w: 3, h: 2 }]);
    setTickers((prev) => [...prev, { id, data, compare: false }]);
  };

  // Remove widget
  const removeWidget = (id) => {
    setLayout((prev) => prev.filter((item) => item.i !== id));
    setTickers((prev) => prev.filter((t) => t.id !== id));
  };

  // Toggle compare
  const toggleCompare = (id) => {
    setTickers((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, compare: !t.compare } : t
      )
    );
  };

  // Compare tickers
  const compareTickers = tickers.filter((t) => t.compare);

  return (
    <>
      {/* Fullscreen overlay */}
      {fullscreenWidget && (
        <div
          style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            background: "#111", color: "#fff",
            zIndex: 1000, padding: "20px", overflowY: "auto"
          }}
        >
          <button
            onClick={() => setFullscreenWidget(null)}
            style={{ background: "red", color: "white", padding: "5px" }}
          >
            ✖ Close Fullscreen
          </button>

          {fullscreenWidget.type === "ticker" && (
            <>
              <h2>{fullscreenWidget.data.symbol} — {fullscreenWidget.data.name}</h2>
              <p>💲 Last Price: {fullscreenWidget.data.price}</p>
              <p>📈 Daily High: {fullscreenWidget.data.dayHigh}</p>
              <p>📉 Daily Low: {fullscreenWidget.data.dayLow}</p>
              <p>🔼 52‑Week High: {fullscreenWidget.data.yearHigh}</p>
              <p>🔽 52‑Week Low: {fullscreenWidget.data.yearLow}</p>
              <p>📊 Total Return: {fullscreenWidget.data.totalReturn}</p>
              <p>📊 Price Return: {fullscreenWidget.data.priceReturn}</p>
              <p>📊 NAV: {fullscreenWidget.data.nav}</p>
            </>
          )}

          {fullscreenWidget.type === "compare" && (
            <>
              <h2>Comparison View</h2>
              {compareTickers.map((t) => (
                <div key={t.id} style={{ marginBottom: "10px" }}>
                  <strong>{t.data.symbol}</strong> — {t.data.name}
                  <p>💲 Price: {t.data.price}</p>
                  <p>📈 Daily High: {t.data.dayHigh}</p>
                  <p>📉 Daily Low: {t.data.dayLow}</p>
                  <p>🔼 52‑Week High: {t.data.yearHigh}</p>
                  <p>🔽 52‑Week Low: {t.data.yearLow}</p>
                  <p>📊 Total Return: {t.data.totalReturn}</p>
                  <p>📊 Price Return: {t.data.priceReturn}</p>
                  <p>📊 NAV: {t.data.nav}</p>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* Grid layout */}
      <GridLayout
        className="layout"
        layout={layout}
        cols={12}
        rowHeight={100}
        width={1200}
        margin={[0, 0]}
        containerPadding={[0, 0]}
        onLayoutChange={(newLayout) => setLayout(newLayout)}
      >
        {/* Hamburger menu widget */}
        <div
          key="menu"
          style={{
            background: "#333", color: "#fff", padding: "10px",
            cursor: "pointer", position: "relative"
          }}
        >
          {/* ☰ icon toggles menuOpen */}
          <div
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ fontSize: "24px" }}
          >
            ☰
          </div>

          {/* Menu panel only when open */}
          {menuOpen && (
            <div
              style={{
                position: "absolute",
                top: "40px",
                left: "0",
                background: "#444",
                padding: "10px",
                borderRadius: "4px",
                zIndex: 10
              }}
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const symbol = e.target.elements.symbol.value.toUpperCase();
                  if (symbol) addTicker(symbol);
                  e.target.reset();
                }}
              >
                <input
                  type="text"
                  name="symbol"
                  placeholder="Enter ticker (e.g. AAPL)"
                  style={{ width: "100%", padding: "5px" }}
                />
                <button type="submit" style={{ marginTop: "5px" }}>
                  ➕ Add Ticker
                </button>
              </form>
              <button
                onClick={() => setFullscreenWidget({ type: "compare" })}
                style={{ marginTop: "10px" }}
              >
                🔍 Compare Mode
              </button>
              <button style={{ marginTop: "10px" }}>📅 Add Calendar</button>
              <button style={{ marginTop: "10px" }}>📰 Add News</button>
              <button style={{ marginTop: "10px" }}>✍️ Add Blog</button>
              <button style={{ marginTop: "10px" }}>🔐 Login</button>
            </div>
          )}
        </div>

        {/* Render ticker widgets */}
        {tickers.map((t) => (
          <div
            key={t.id}
            style={{
              background: "#eee", padding: "10px",
              position: "relative", display: "flex",
              flexDirection: "column"
            }}
          >
            {/* Close button */}
            <button
              onClick={() => removeWidget(t.id)}
              style={{
                position: "absolute", top: "5px", right: "5px",
                background: "red", color: "white", border: "none"
              }}
            >
              ✖
            </button>

            {/* Fullscreen button */}
            <button
              onClick={() => setFullscreenWidget({ type: "ticker", data: t.data })}
              style={{
                position: "absolute", top: "5px", right: "35px",
                background: "blue", color: "white", border: "none"
              }}
            >
