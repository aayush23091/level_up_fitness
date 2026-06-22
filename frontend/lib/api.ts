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

// Automatically attach JWT token
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
  username?: string;
  phoneNumber?: string;
  gender?: string;
}

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  phoneNumber: string;
  gender: string;
  role: string;
  profilePhoto?: string;
}

interface WhoAmIResponse {
  success: boolean;
  message: string;
  user: User;
}

export const authAPI = {
  register: async (data: RegisterPayload): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<AuthResponse>(
        "/api/v1/auth/register",
        data
      );

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
      throw new Error(
        axiosError.response?.data?.message || "Registration failed"
      );
    }
  },

  login: async (data: LoginPayload): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<AuthResponse>(
        "/api/v1/auth/login",
        data
      );

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
      throw new Error(
        axiosError.response?.data?.message || "Login failed"
      );
    }
  },

  whoAmI: async (): Promise<WhoAmIResponse> => {
    try {
      const response = await apiClient.get<WhoAmIResponse>(
        "/api/v1/auth/whoami"
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      throw new Error(
        axiosError.response?.data?.message || "Unable to fetch user"
      );
    }
  },

  updateProfile: async (formData: FormData): Promise<WhoAmIResponse> => {
    try {
      const response = await apiClient.put<WhoAmIResponse>(
        "/api/v1/auth/update",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      throw new Error(
        axiosError.response?.data?.message || "Profile update failed"
      );
    }
  },

  logout: () => {
    Cookies.remove("authToken");
  },

  getToken: (): string | undefined => {
    return Cookies.get("authToken");
  },
};

export default apiClient;
