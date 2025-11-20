// Import React and hooks
import React, { useState, useEffect } from "react";
import GridLayout from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

/**
 * Helper: fetch ticker data from Yahoo Finance API (unauthenticated endpoint).
 * You can swap this with your own source later (e.g., paid API).
 */
async function fetchTickerData(symbol) {
  const res = await fetch(
    `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbol}`
  );
  const data = await res.json();
  const quote = data?.quoteResponse?.result?.[0];

  // Guard against missing results
  if (!quote) {
    return {
      name: "Unknown",
      symbol,
      price: "—",
      dayHigh: "—",
      dayLow: "—",
      yearHigh: "—",
      yearLow: "—",
      totalReturn: "N/A",
      priceReturn: "N/A",
      nav: "N/A",
    };
  }

  return {
    name: quote.longName || quote.shortName || symbol,
    symbol: quote.symbol || symbol,
    price: quote.regularMarketPrice ?? "—",
    dayHigh: quote.regularMarketDayHigh ?? "—",
    dayLow: quote.regularMarketDayLow ?? "—",
    yearHigh: quote.fiftyTwoWeekHigh ?? "—",
    yearLow: quote.fiftyTwoWeekLow ?? "—",
    // Placeholder metrics for compare mode (wire real data later)
    totalReturn: "N/A",
    priceReturn: "N/A",
    nav: "N/A",
  };
}

/**
 * Dashboard component
 * - ☰ Hamburger menu (toggles panel)
 * - Add ticker widgets dynamically
 * - Each widget: close (✖), fullscreen (⛶), compare checkbox
 * - Fullscreen overlay for single ticker or compare view
 * - Persists layout and tickers in localStorage
 */
export default function Dashboard() {
  // Persisted grid layout (only menu by default)
  const [layout, setLayout] = useState(() => {
    const saved = localStorage.getItem("dashboard-layout");
    return saved ? JSON.parse(saved) : [{ i: "menu", x: 0, y: 0, w: 2, h: 1 }];
  });

  // Persisted ticker widgets
  const [tickers, setTickers] = useState(() => {
    const saved = localStorage.getItem("dashboard-tickers");
    return saved ? JSON.parse(saved) : [];
  });

  // Fullscreen overlay state: { type: "ticker" | "compare", data?: {...} }
  const [fullscreenWidget, setFullscreenWidget] = useState(null);

  // Hamburger menu toggle
  const [menuOpen, setMenuOpen] = useState(false);

  // Persist layout + tickers whenever they change
  useEffect(() => {
    localStorage.setItem("dashboard-layout", JSON.stringify(layout));
    localStorage.setItem("dashboard-tickers", JSON.stringify(tickers));
  }, [layout, tickers]);

  // Add ticker widget to grid and state
  const addTicker = async (symbol) => {
    const data = await fetchTickerData(symbol.toUpperCase());
    const id = `ticker-${data.symbol}-${Date.now()}`;

    setLayout((prev) => [
      ...prev,
      { i: id, x: 0, y: Infinity, w: 3, h: 2 }, // y: Infinity → auto place at bottom
    ]);

    setTickers((prev) => [...prev, { id, data, compare: false }]);
  };

  // Remove widget (by id) from layout and ticker list
  const removeWidget = (id) => {
    setLayout((prev) => prev.filter((item) => item.i !== id));
    setTickers((prev) => prev.filter((t) => t.id !== id));
  };

  // Toggle compare flag on a ticker widget
  const toggleCompare = (id) => {
    setTickers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, compare: !t.compare } : t))
    );
  };

  // Tickers selected for comparison
  const compareTickers = tickers.filter((t) => t.compare);

  return (
    <>
      {/* Fullscreen overlay for ticker details or comparison */}
      {fullscreenWidget && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "#111",
            color: "#fff",
            zIndex: 1000,
            padding: "20px",
            overflowY: "auto",
          }}
        >
          {/* Close fullscreen */}
          <button
            onClick={() => setFullscreenWidget(null)}
            style={{
              background: "red",
              color: "white",
              padding: "6px 10px",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              marginBottom: "12px",
            }}
          >
            ✖ Close Fullscreen
          </button>

          {/* Single ticker fullscreen details */}
          {fullscreenWidget.type === "ticker" && fullscreenWidget.data && (
            <>
              <h2 style={{ marginTop: 0 }}>
                {fullscreenWidget.data.symbol} — {fullscreenWidget.data.name}
              </h2>
              <p>💲 Last Price: {fullscreenWidget.data.price}</p>
              <p>📈 Daily High: {fullscreenWidget.data.dayHigh}</p>
              <p>📉 Daily Low: {fullscreenWidget.data.dayLow}</p>
              <p>🔼 52‑Week High: {fullscreenWidget.data.yearHigh}</p>
              <p>🔽 52‑Week Low: {fullscreenWidget.data.yearLow}</p>
              <hr style={{ borderColor: "#333" }} />
              <p>📊 Total Return: {fullscreenWidget.data.totalReturn}</p>
              <p>📊 Price Return: {fullscreenWidget.data.priceReturn}</p>
              <p>📊 NAV: {fullscreenWidget.data.nav}</p>
            </>
          )}

          {/* Comparison fullscreen view */}
          {fullscreenWidget.type === "compare" && (
            <>
              <h2 style={{ marginTop: 0 }}>Comparison View</h2>

              {/* Controls to add/remove tickers in compare mode */}
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const symbol = e.currentTarget.elements.symbol.value.toUpperCase();
                  if (!symbol) return;
                  const data = await fetchTickerData(symbol);
                  const id = `ticker-${data.symbol}-${Date.now()}`;

                  // Add into both layout (hidden in fullscreen but needed for persistence) and tickers
                  setLayout((prev) => [
                    ...prev,
                    { i: id, x: 0, y: Infinity, w: 3, h: 2 },
                  ]);
                  setTickers((prev) => [...prev, { id, data, compare: true }]);

                  e.currentTarget.reset();
                }}
                style={{ marginBottom: "16px" }}
              >
                <input
                  type="text"
                  name="symbol"
                  placeholder="Add ticker to compare (e.g., AAPL)"
                  style={{ padding: "6px", width: "240px", marginRight: "8px" }}
                />
                <button
                  type="submit"
                  style={{
                    padding: "6px 10px",
                    background: "#2d7ef7",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  ➕ Add to Compare
                </button>
              </form>

              {/* Comparison metric selector (placeholders; wire to real metrics later) */}
              <div style={{ marginBottom: "12px" }}>
                <strong>Metrics:</strong>
                <div style={{ marginTop: "6px" }}>
                  {/* In a future iteration, use radio/select and compute real values */}
                  <label style={{ marginRight: "12px" }}>
                    <input type="radio" name="metric" defaultChecked /> Price return
                  </label>
                  <label style={{ marginRight: "12px" }}>
                    <input type="radio" name="metric" /> Total return
                  </label>
                  <label style={{ marginRight: "12px" }}>
                    <input type="radio" name="metric" /> NAV
                  </label>
                </div>
              </div>

              {/* List compared tickers */}
              {compareTickers.length === 0 ? (
                <p style={{ color: "#bbb" }}>No tickers selected for comparison.</p>
              ) : (
                compareTickers.map((t) => (
                  <div
                    key={t.id}
                    style={{
                      marginBottom: "14px",
                      paddingBottom: "12px",
                      borderBottom: "1px solid #333",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <strong style={{ marginRight: "8px" }}>{t.data.symbol}</strong>
                      <span style={{ color: "#bbb" }}>— {t.data.name}</span>
                      <button
                        onClick={() => {
                          // Unselect from compare (but keep widget unless closed)
                          setTickers((prev) =>
                            prev.map((x) =>
                              x.id === t.id ? { ...x, compare: false } : x
                            )
                          );
                        }}
                        style={{
                          marginLeft: "auto",
                          background: "#555",
                          color: "#fff",
                          border: "none",
                          borderRadius: "4px",
                          padding: "4px 8px",
                          cursor: "pointer",
                        }}
                      >
                        Remove from Compare
                      </button>
                    </div>

                    <div style={{ marginTop: "8px" }}>
                      💲 Price: {t.data.price} | 📈 High: {t.data.dayHigh} | 📉 Low:{" "}
                      {t.data.dayLow}
                    </div>
                    <div>
                      🔼 52‑Week High: {t.data.yearHigh} | 🔽 52‑Week Low:{" "}
                      {t.data.yearLow}
                    </div>
                    <div style={{ color: "#bbb" }}>
                      📊 Total Return: {t.data.totalReturn} | Price Return:{" "}
                      {t.data.priceReturn} | NAV: {t.data.nav}
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </div>
      )}

      {/* Main grid layout */}
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
        {/* Hamburger menu widget (icon only; panel opens on click) */}
        <div
          key="menu"
          style={{
            background: "#333",
            color: "#fff",
            padding: "10px",
            cursor: "pointer",
            position: "relative",
          }}
        >
          {/* ☰ icon toggles menuOpen */}
          <div onClick={() => setMenuOpen(!menuOpen)} style={{ fontSize: "24px" }}>
            ☰
          </div>

          {/* Popover panel only when open */}
          {menuOpen && (
            <div
              style={{
                position: "absolute",
                top: "40px",
                left: "0",
                background: "#444",
                padding: "10px",
                borderRadius: "4px",
                zIndex: 10,
                minWidth: "240px",
              }}
            >
              {/* Add ticker form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const symbol = e.currentTarget.elements.symbol.value.toUpperCase();
                  if (symbol) addTicker(symbol);
                  e.currentTarget.reset();
                }}
              >
                <input
                  type="text"
                  name="symbol"
                  placeholder="Enter ticker (e.g., AAPL)"
                  style={{ width: "100%", padding: "6px" }}
                />
                <button
                  type="submit"
                  style={{
                    marginTop: "6px",
                    width: "100%",
                    padding: "6px",
                    background: "#2d7ef7",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  ➕ Add Ticker
                </button>
              </form>

              {/* Open fullscreen compare view */}
              <button
                onClick={() => setFullscreenWidget({ type: "compare" })}
                style={{
                  marginTop: "10px",
                  width: "100%",
                  padding: "6px",
                  background: "#555",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                🔍 Compare Mode
              </button>

              {/* Future widget spawners (wire later) */}
              <button
                style={{
                  marginTop: "10px",
                  width: "100%",
                  padding: "6px",
                  background: "#555",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                📅 Add Calendar
              </button>
              <button
                style={{
                  marginTop: "10px",
                  width: "100%",
                  padding: "6px",
                  background: "#555",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                📰 Add News
              </button>
              <button
                style={{
                  marginTop: "10px",
                  width: "100%",
                  padding: "6px",
                  background: "#555",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                ✍️ Add Blog
              </button>
              <button
                style={{
                  marginTop: "10px",
                  width: "100%",
                  padding: "6px",
                  background: "#555",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                🔐 Login
              </button>
            </div>
          )}
        </div>

        {/* Render ticker widgets */}
        {tickers.map((t) => (
          <div
            key={t.id}
            style={{
              background: "#eee",
              padding: "10px",
              position: "relative",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Close button */}
            <button
              onClick={() => removeWidget(t.id)}
              style={{
                position: "absolute",
                top: "5px",
                right: "5px",
                background: "red",
                color: "white",
                border: "none",
                borderRadius: "3px",
                cursor: "pointer",
                padding: "4px 6px",
              }}
            >
              ✖
            </button>

            {/* Fullscreen button */}
            <button
              onClick={() =>
                setFullscreenWidget({ type: "ticker", data: t.data })
              }
              style={{
                position: "absolute",
                top: "5px",
                right: "35px",
                background: "#2d7ef7",
                color: "white",
                border: "none",
                borderRadius: "3px",
                cursor: "pointer",
                padding: "4px 6px",
              }}
            >
              ⛶
            </button>

            {/* Compare toggle */}
            <label style={{ marginBottom: "6px" }}>
              <input
                type="checkbox"
                checked={t.compare}
                onChange={() => toggleCompare(t.id)}
                style={{ marginRight: "6px" }}
              />
              Compare
            </label>

            {/* Company/fund name (smaller, expands to fit) */}
            <div style={{ fontSize: "14px", marginBottom: "4px" }}>
              {t.data.name}
            </div>

            {/* Ticker symbol (largest, bold) */}
            <div style={{ fontSize: "24px", fontWeight: "bold" }}>
              {t.data.symbol}
            </div>

            {/* Price details */}
            <div style={{ fontSize: "14px", marginTop: "8px" }}>
              💲 {t.data.price} | 📈 {t.data.dayHigh} | 📉 {t.data.dayLow}
              <br />
              🔼 {t.data.yearHigh} | 🔽 {t.data.yearLow}
            </div>
          </div>
        ))}
      </GridLayout>
    </>
  );
}
