import React, { useState } from "react";
import API from "../api/api";

export default function Login() {
  const [token, setToken] = useState("");
  const [userId, setUserId] = useState(localStorage.getItem("userId")||"");

  const createDevUser = async () => {
    if (!token) return alert("Paste your Airtable personal token for dev");
    const r = await API.post("/auth/dev-create", { accessToken: token });
    if (r.data?.userId) {
      localStorage.setItem("userId", r.data.userId);
      setUserId(r.data.userId);
      alert("Dev user created. userId saved in localStorage.");
    }
  };

  const logout = () => {
    localStorage.removeItem("userId");
    setUserId("");
    alert("Logged out (dev)");
  };

  return (
    <div>
      <h2>Login (Dev helper)</h2>
      <p>For testing: paste your Airtable personal access token and click "Create Dev User".</p>
      <input style={{width: "100%"}} placeholder="Airtable personal token" value={token} onChange={e=>setToken(e.target.value)} />
      <div style={{marginTop:10}}>
        <button onClick={createDevUser}>Create Dev User</button>
        <button onClick={logout} style={{marginLeft:10}}>Logout</button>
      </div>
      <div style={{marginTop:20}}>
        <strong>Current userId:</strong> <span>{userId || "none"}</span>
      </div>
    </div>
  );
}
