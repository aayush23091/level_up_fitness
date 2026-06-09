import axios, { AxiosError } from "axios";
import Cookies from "js-cookie";
import { AuthResponse } from "../../backend/src/types/user.type";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = Cookies.get("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  email: string;
  password: string;
  name: string;
}

export const authAPI = {
  register: async (data: RegisterPayload): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<AuthResponse>("/api/auth/register", data);
      
      // Store token in cookie
      if (response.data.token) {
        Cookies.set("authToken", response.data.token, {
          expires: 7,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
        });
      }
      
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<AuthResponse>;
      throw new Error(axiosError.response?.data?.message || "Registration failed");
    }
  },

  login: async (data: LoginPayload): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<AuthResponse>("/api/auth/login", data);
      
      // Store token in cookie
      if (response.data.token) {
        Cookies.set("authToken", response.data.token, {
          expires: 7,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
        });
      }
      
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<AuthResponse>;
      throw new Error(axiosError.response?.data?.message || "Login failed");
    }
  },

  logout: () => {
    Cookies.remove("authToken");
  },

  getToken: (): string | undefined => {
    return Cookies.get("authToken");
  },
};
