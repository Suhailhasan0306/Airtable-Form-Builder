import React from "react";
import { Outlet, Link } from "react-router-dom";

export default function App() {
  return (
    <div style={{ padding: 20, fontFamily: "Arial, sans-serif" }}>
      <header style={{ marginBottom: 20 }}>
        <h1>Airtable Form Builder (MVP)</h1>
        <nav style={{ display: "flex", gap: 10 }}>
          <Link to="/">Login</Link>
          <Link to="/builder">Form Builder</Link>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
