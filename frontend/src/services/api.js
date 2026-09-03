import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
  timeout: 60000
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("ai_coding_assistant_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function apiError(error, fallback = "Something went wrong.") {
  const detail = error?.response?.data?.detail;
  if (Array.isArray(detail)) {
    return detail.map((item) => item.msg).join(" ");
  }
  return detail || error?.message || fallback;
}

