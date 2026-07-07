import axios, { AxiosError } from "axios";
import Cookies from "js-cookie";
import { AuthResponse } from "../../backend/src/types/user.type";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Automatically attach JWT token
apiClient.interceptors.request.use((config) => {
  const token = Cookies.get("authToken");

  console.log("JWT Token:", token);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  console.log("Authorization:", config.headers.Authorization);

  return config;
});

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  name: string;
  username?: string;
  email: string;
  password: string;
  phoneNumber?: string;
  gender?: string;
  role?: "user" | "coach";
}

export interface User {
  _id?: string;
  id?: string;
  name: string;
  username: string;
  email: string;
  phoneNumber: string;
  gender: string;
  role: string;
  profilePhoto?: string;
}

interface WhoAmIResponse {
  status: number;
  success: boolean;
  message: string;
  data: User;
}

export const authAPI = {
  register: async (data: RegisterPayload): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<AuthResponse>(
        "/api/v1/auth/register",
        data
      );

      console.log("Register Response:", response.data);

      const token = response.data.data.token;

      if (token) {
        Cookies.set("authToken", token, {
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

      console.log("Login Response:", response.data);

      const token = response.data.data.token;

      if (token) {
        Cookies.set("authToken", token, {
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

      console.log("WhoAmI Response:", response.data);

      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<any>;

      throw new Error(
        axiosError.response?.data?.message || "Unable to fetch user"
      );
    }
  },

  updateProfile: async (
    formData: FormData
  ): Promise<WhoAmIResponse> => {
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

      console.log("Update Profile Response:", response.data);

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

export interface PaginatedUsersResponse {
  status: number;
  success: boolean;
  message: string;
  data: User[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SingleUserResponse {
  status: number;
  success: boolean;
  message: string;
  data: User;
}

export interface AdminCreateUserPayload {
  name: string;
  username: string;
  email: string;
  password?: string;
  phoneNumber: string;
  gender: string;
  role?: string;
}

export type AdminUpdateUserPayload = Partial<AdminCreateUserPayload>;

export const adminAPI = {
  getUsers: async (
    page: number = 1,
    limit: number = 10,
    search?: string
  ): Promise<PaginatedUsersResponse> => {
    try {
      const params: Record<string, any> = { page, limit };
      if (search) {
        params.search = search;
      }

      const response = await apiClient.get<PaginatedUsersResponse>(
        "/api/v1/admin/users",
        { params }
      );

      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to fetch users"
      );
    }
  },

  getUser: async (id: string): Promise<SingleUserResponse> => {
    try {
      const response = await apiClient.get<SingleUserResponse>(
        `/api/v1/admin/users/${id}`
      );

      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to fetch user"
      );
    }
  },

  createUser: async (
    data: AdminCreateUserPayload
  ): Promise<SingleUserResponse> => {
    try {
      const response = await apiClient.post<SingleUserResponse>(
        "/api/v1/admin/users",
        data
      );

      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to create user"
      );
    }
  },

  updateUser: async (
    id: string,
    data: AdminUpdateUserPayload
  ): Promise<SingleUserResponse> => {
    try {
      const response = await apiClient.put<SingleUserResponse>(
        `/api/v1/admin/users/${id}`,
        data
      );

      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to update user"
      );
    }
  },

  deleteUser: async (
    id: string
  ): Promise<{ status: number; success: boolean; message: string }> => {
    try {
      const response = await apiClient.delete<{
        status: number;
        success: boolean;
        message: string;
      }>(`/api/v1/admin/users/${id}`);

      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to delete user"
      );
    }
  },
};

export const coachAPI = {
  getAthletes: async (
    page: number = 1,
    limit: number = 10,
    search?: string
  ): Promise<PaginatedUsersResponse> => {
    try {
      const params: Record<string, any> = { page, limit };
      if (search) {
        params.search = search;
      }

      const response = await apiClient.get<PaginatedUsersResponse>(
        "/api/v1/coach/athletes",
        { params }
      );

      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to fetch athletes"
      );
    }
  },
};

export interface Workout {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  thumbnail: string;
  category: string;
  difficulty: string;
  duration: number;
  xpReward: number;
  coinReward: number;
  isPremium: boolean;
  createdBy?: string;
  assignedUsers?: string[];
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginatedWorkoutsResponse {
  status: number;
  success: boolean;
  message: string;
  data: Workout[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SingleWorkoutResponse {
  status: number;
  success: boolean;
  message: string;
  data: Workout;
}

export const workoutAPI = {
  getWorkouts: async (
    page: number = 1,
    limit: number = 10,
    search?: string,
    category?: string,
    difficulty?: string
  ): Promise<PaginatedWorkoutsResponse> => {
    try {
      const params: Record<string, any> = { page, limit };
      if (search) params.search = search;
      if (category && category !== "all") params.category = category;
      if (difficulty && difficulty !== "all") params.difficulty = difficulty;

      const response = await apiClient.get<PaginatedWorkoutsResponse>(
        "/api/v1/workouts",
        { params }
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to fetch workouts"
      );
    }
  },

  getWorkout: async (id: string): Promise<SingleWorkoutResponse> => {
    try {
      const response = await apiClient.get<SingleWorkoutResponse>(
        `/api/v1/workouts/${id}`
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to fetch workout details"
      );
    }
  },

  createWorkout: async (
    data: Partial<Workout>
  ): Promise<SingleWorkoutResponse> => {
    try {
      const response = await apiClient.post<SingleWorkoutResponse>(
        "/api/v1/workouts",
        data
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to create workout"
      );
    }
  },

  updateWorkout: async (
    id: string,
    data: Partial<Workout>
  ): Promise<SingleWorkoutResponse> => {
    try {
      const response = await apiClient.put<SingleWorkoutResponse>(
        `/api/v1/workouts/${id}`,
        data
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to update workout"
      );
    }
  },

  deleteWorkout: async (id: string): Promise<{ status: number; success: boolean; message: string }> => {
    try {
      const response = await apiClient.delete<{
        status: number;
        success: boolean;
        message: string;
      }>(`/api/v1/workouts/${id}`);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to delete workout"
      );
    }
  },
};

export default apiClient;