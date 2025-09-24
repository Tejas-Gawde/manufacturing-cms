import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

export const http = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

http.interceptors.response.use(
  (res) => res,
  async (error) => {
    return Promise.reject(error);
  }
);
