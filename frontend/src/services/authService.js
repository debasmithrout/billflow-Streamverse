import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log("[API STATUS]", error.response?.status);
    console.log("[API URL]", error.config?.url);

    if (error.response && error.response.status === 401) {
      const url = error.config.url || "";
      if (!url.includes('/auth/login') && !url.includes('/auth/register')) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("current_user");
        window.location.href = "/login?reason=deleted";
      }
    }
    return Promise.reject(error);
  }
);

export const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const getCurrentUser = async (token) => {
  const response = await api.get('/auth/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
