// utils/axiosInstance.js
import axios from "axios";
import { useContext } from "react";
import { refreshAccessToken } from "../services/authService";

const API_URL = `${import.meta.env.VITE_API_URL}/`;

const createAxiosInstance = (setToken) => {
  const axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true,
  });

  // Interceptor to handle 401 and refresh token
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (
        (error.response?.status === 401 || error.response?.status === 403) &&
        !originalRequest._retry
      ) {
        originalRequest._retry = true;

        try {
          const res = await refreshAccessToken();
          const newAccessToken = res.data.accessToken;

          // Update token in context
          setToken(newAccessToken);

          // Update headers
          axiosInstance.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${newAccessToken}`;
          originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

          // Retry original request
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          console.error(
            "Refresh token failed. Redirecting to Home Page.",
            refreshError
          );
          setToken(null);
          window._authFailed = true;
          window.location.href = "/";
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );

  return axiosInstance;
};

export default createAxiosInstance;
