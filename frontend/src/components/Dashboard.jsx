// Import React and hooks
import React, { useState, useEffect } from "react";
import GridLayout from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

/**
 * Helper: fetch ticker data from Yahoo Finance API (unauthenticated endpoint).
 * Swap to your preferred paid/source later.
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
      symbol: symbol.toUpperCase(),
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
    name: quote.longName || quote.shortName || symbol.toUpperCase(),
    symbol: quote.symbol || symbol.toUpperCase(),
    price: quote.regularMarketPrice ?? "—",
    dayHigh: quote.regularMarketDayHigh ?? "—",
    dayLow: quote.regularMarketDayLow ?? "—",
    yearHigh: quote.fiftyTwoWeekHigh ?? "—",
    yearLow: quote.fiftyTwoWeekLow ?? "—",
    // Placeholders for future compare metrics
    totalReturn: "N/A",
    priceReturn: "N/A",
    nav: "N/A",
  };
}

export default function Dashboard() {
  // Persisted grid layout (only menu icon widget by default)
  const [layout, setLayout] = useState(() => {
    const saved = localStorage.getItem("dashboard-layout");
    return saved ? JSON.parse(saved) : [{ i: "menu", x: 0, y: 0, w: 1, h: 1 }];
  });

  // Persisted ticker widgets
  const [tickers, setTickers] = useState(() => {
    const saved = localStorage.getItem("dashboard-tickers");
    return saved ? JSON.parse(saved) : [];
  });

  // Fullscreen overlay state: { type: "ticker" | "compare", data?: {...} }
  const [fullscreenWidget, setFullscreenWidget] = useState(null);

  // Slide-in drawer (hamburger menu) toggle
  const [drawerOpen, setDrawerOpen] = useState(false);

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
      { i: id, x: 0, y: Infinity, w: 3, h: 2 }, // auto place at bottom
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

          {fullscreenWidget.type === "compare" && (
            <>
              <h2 style={{ marginTop: 0 }}>Comparison View</h2>

              {/* Add/remove tickers inside compare view */}
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const symbol = e.currentTarget.elements.symbol.value.toUpperCase();
                  if (!symbol) return;
                  const data = await fetchTickerData(symbol);
                  const id = `ticker-${data.symbol}-${Date.now()}`;
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

              {/* Metric selector (placeholders; wire real calculations later) */}
              <div style={{ marginBottom: "12px" }}>
                <strong>Metrics:</strong>
                <div style={{ marginTop: "6px" }}>
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
                        onClick={() =>
                          setTickers((prev) =>
                            prev.map((x) =>
                              x.id === t.id ? { ...x, compare: false } : x
                            )
                          )
                        }
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

      {/* Slide-in drawer (global, independent of grid) */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: drawerOpen ? 0 : -280, // slide in/out
          width: 280,
          height: "100vh",
          background: "#1f1f1f",
          color: "#fff",
          boxShadow: "2px 0 10px rgba(0,0,0,0.4)",
          zIndex: 900,
          transition: "left 220ms ease",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Drawer header with close */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "12px 12px 8px",
            borderBottom: "1px solid #333",
          }}
        >
          <span style={{ fontSize: 20, marginRight: 8 }}>☰</span>
          <strong>Menu</strong>
          <button
            onClick={() => setDrawerOpen(false)}
            style={{
              marginLeft: "auto",
              background: "transparent",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              fontSize: 18,
            }}
            aria-label="Close menu"
          >
            ✖
          </button>
        </div>

        {/* Drawer content */}
        <div style={{ padding: "12px" }}>
          {/* Add ticker form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const symbol = e.currentTarget.elements.symbol.value.toUpperCase();
              if (symbol) addTicker(symbol);
              e.currentTarget.reset();
            }}
          >
            <label style={{ fontSize: 12, color: "#bbb" }}>Add ticker</label>
            <input
              type="text"
              name="symbol"
              placeholder="e.g., AAPL"
              style={{
                width: "100%",
                padding: "8px",
                marginTop: "6px",
                borderRadius: 4,
                border: "1px solid #333",
                background: "#2a2a2a",
                color: "#fff",
              }}
            />
            <button
              type="submit"
              style={{
                marginTop: "8px",
                width: "100%",
                padding: "8px",
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
              marginTop: "12px",
              width: "100%",
              padding: "8px",
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
              marginTop: "12px",
              width: "100%",
              padding: "8px",
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
              marginTop: "12px",
              width: "100%",
              padding: "8px",
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
              marginTop: "12px",
              width: "100%",
              padding: "8px",
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
              marginTop: "12px",
              width: "100%",
              padding: "8px",
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
      </div>

      {/* Backdrop (click to close drawer) */}
      {drawerOpen && (
        <div
          onClick={() => setDrawerOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
            zIndex: 850,
          }}
        />
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
        {/* Minimal hamburger menu widget (icon only) */}
        <div
          key="menu"
          style={{
            background: "#333",
            color: "#fff",
            padding: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            userSelect: "none",
          }}
          onClick={() => setDrawerOpen(true)}
          title="Open menu"
        >
          ☰
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
              aria-label="Close widget"
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
              aria-label="Fullscreen"
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
