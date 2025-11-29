import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";

const API = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" }
});

API.interceptors.request.use((cfg) => {
  const uid = localStorage.getItem("userId");
  if (uid) cfg.headers["x-user-id"] = uid;
  return cfg;
});

export default API;
