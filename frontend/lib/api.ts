import axios, { AxiosError } from "axios";
import Cookies from "js-cookie";
import { AuthResponse } from "../../backend/src/types/user.type";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "";

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

export interface CoachProfile {
  bio?: string;
  specialization?: string[];
  experience?: number;
  hireCost?: number;
  availability?: boolean;
  category?: string;
  rating?: number;
  profileImage?: string;
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
  coins?: number;
  level?: number;
  xp?: number;
  status?: string;
  hiredAt?: string;
  createdAt?: string;
  coachProfile?: CoachProfile;
  height?: number;
  weight?: number;
  chest?: number;
  waist?: number;
  arms?: number;
  shoulders?: number;
  legs?: number;
  calves?: number;
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

  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<{ status: number; success: boolean; message: string }> => {
    try {
      const response = await apiClient.patch<{
        status: number;
        success: boolean;
        message: string;
      }>("/api/v1/auth/change-password", data);

      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<any>;

      throw new Error(
        axiosError.response?.data?.message || "Failed to update password"
      );
    }
  },

  forgotPassword: async (data: { email: string }): Promise<{
    status: number;
    success: boolean;
    message: string;
  }> => {
    try {
      const response = await apiClient.post<{
        status: number;
        success: boolean;
        message: string;
      }>("/api/v1/auth/forgot-password", data);

      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<any>;

      throw new Error(
        axiosError.response?.data?.message || "Failed to send reset email"
      );
    }
  },

  resetPassword: async (token: string, data: { password: string }): Promise<{
    status: number;
    success: boolean;
    message: string;
  }> => {
    try {
      const response = await apiClient.post<{
        status: number;
        success: boolean;
        message: string;
      }>(`/api/v1/auth/reset-password/${token}`, data);

      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<any>;

      throw new Error(
        axiosError.response?.data?.message || "Failed to reset password"
      );
    }
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

export interface AdminDashboardStatsResponse {
  status: number;
  success: boolean;
  message: string;
  data: {
    totalUsers: number;
    totalCoaches: number;
    totalAdmins: number;
    totalWorkoutPlans: number;
    totalPublishedPlans: number;
    recentUsers: User[];
    recentCoaches: User[];
  };
}

export interface Achievement {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  conditionType: "workout_completed" | "xp_earned" | "level_reached" | "streak_days";
  conditionValue: number;
  xpReward: number;
  coinReward: number;
  badgeImage?: string;
  status: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}

export interface UserAchievementWithProgress {
  achievement: Achievement;
  unlocked: boolean;
  unlockedAt?: string;
  progress: number;
}

export interface PaginatedAchievementsResponse {
  status: number;
  success: boolean;
  message: string;
  data: Achievement[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SingleAchievementResponse {
  status: number;
  success: boolean;
  message: string;
  data: Achievement;
}

export const adminAPI = {
  getDashboardStats: async (): Promise<AdminDashboardStatsResponse> => {
    try {
      const response = await apiClient.get<AdminDashboardStatsResponse>(
        "/api/v1/admin/dashboard/stats"
      );

      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to fetch dashboard stats"
      );
    }
  },

  getAchievements: async (
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: string
  ): Promise<PaginatedAchievementsResponse> => {
    try {
      const params: Record<string, any> = { page, limit };
      if (search) params.search = search;
      if (status && status !== "all") params.status = status;

      const response = await apiClient.get<PaginatedAchievementsResponse>(
        "/api/v1/admin/achievements",
        { params }
      );

      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to fetch achievements"
      );
    }
  },

  getAchievement: async (id: string): Promise<SingleAchievementResponse> => {
    try {
      const response = await apiClient.get<SingleAchievementResponse>(
        `/api/v1/admin/achievements/${id}`
      );

      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to fetch achievement"
      );
    }
  },

  createAchievement: async (
    data: Partial<Achievement>
  ): Promise<SingleAchievementResponse> => {
    try {
      const response = await apiClient.post<SingleAchievementResponse>(
        "/api/v1/admin/achievements",
        data
      );

      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to create achievement"
      );
    }
  },

  updateAchievement: async (
    id: string,
    data: Partial<Achievement>
  ): Promise<SingleAchievementResponse> => {
    try {
      const response = await apiClient.put<SingleAchievementResponse>(
        `/api/v1/admin/achievements/${id}`,
        data
      );

      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to update achievement"
      );
    }
  },

  deleteAchievement: async (
    id: string
  ): Promise<{ status: number; success: boolean; message: string }> => {
    try {
      const response = await apiClient.delete<{
        status: number;
        success: boolean;
        message: string;
      }>(`/api/v1/admin/achievements/${id}`);

      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to delete achievement"
      );
    }
  },

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

  getCoaches: async (
    page: number = 1,
    limit: number = 10,
    search?: string
  ): Promise<PaginatedCoachesResponse> => {
    try {
      const params: Record<string, any> = { page, limit };
      if (search) {
        params.search = search;
      }

      const response = await apiClient.get<PaginatedCoachesResponse>(
        "/api/v1/admin/coaches",
        { params }
      );

      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to fetch coaches"
      );
    }
  },

  getCoach: async (id: string): Promise<SingleCoachResponse> => {
    try {
      const response = await apiClient.get<SingleCoachResponse>(
        `/api/v1/admin/coaches/${id}`
      );

      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to fetch coach"
      );
    }
  },

  deleteCoach: async (
    id: string
  ): Promise<{ status: number; success: boolean; message: string }> => {
    try {
      const response = await apiClient.delete<{
        status: number;
        success: boolean;
        message: string;
      }>(`/api/v1/admin/coaches/${id}`);

      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to delete coach"
      );
    }
  },

  getWorkouts: async (
    page: number = 1,
    limit: number = 10,
    search?: string
  ): Promise<PaginatedWorkoutsResponse> => {
    try {
      const params: Record<string, any> = { page, limit };
      if (search) params.search = search;

      const response = await apiClient.get<PaginatedWorkoutsResponse>(
        "/api/v1/admin/workouts",
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
        `/api/v1/admin/workouts/${id}`
      );

      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to fetch workout"
      );
    }
  },

  createWorkout: async (
    data: Partial<Workout> | FormData
  ): Promise<SingleWorkoutResponse> => {
    try {
      const response = await apiClient.post<SingleWorkoutResponse>(
        "/api/v1/admin/workouts",
        data,
        {
          headers: data instanceof FormData ? { "Content-Type": "multipart/form-data" } : undefined
        }
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
    data: Partial<Workout> | FormData
  ): Promise<SingleWorkoutResponse> => {
    try {
      const response = await apiClient.put<SingleWorkoutResponse>(
        `/api/v1/admin/workouts/${id}`,
        data,
        {
          headers: data instanceof FormData ? { "Content-Type": "multipart/form-data" } : undefined
        }
      );

      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to update workout"
      );
    }
  },

  deleteWorkout: async (
    id: string
  ): Promise<{ status: number; success: boolean; message: string }> => {
    try {
      const response = await apiClient.delete<{
        status: number;
        success: boolean;
        message: string;
      }>(`/api/v1/admin/workouts/${id}`);

      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to delete workout"
      );
    }
  },

  getTransactions: async (): Promise<AdminTransactionsResponse> => {
    try {
      const response = await apiClient.get<AdminTransactionsResponse>(
        "/api/v1/admin/transactions"
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to fetch transactions"
      );
    }
  },
};

export interface Coach {
  _id?: string;
  id?: string;
  name: string;
  username: string;
  email: string;
  phoneNumber: string;
  gender: string;
  role: string;
  profilePhoto?: string;
  coachProfile?: CoachProfile;
  // Used by public coach profile page
  bio?: string;
  specialization?: string[];
  experience?: number;
  hireCost?: number;
  availability?: boolean;
  category?: string;
  rating?: number;
  isHired?: boolean;
}

export interface PaginatedCoachesResponse {
  status: number;
  success: boolean;
  message: string;
  data: Coach[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SingleCoachResponse {
  status: number;
  success: boolean;
  message: string;
  data: Coach;
}

export interface HireCoachResponse {
  status: number;
  success: boolean;
  message: string;
  data: {
    coach: Coach;
    user: User;
  };
}

export interface DashboardStatsResponse {
  status: number;
  success: boolean;
  message: string;
  data: {
    totalAthletes: number;
    totalWorkoutPlans: number;
    publishedPlans: number;
    assignedPlans: number;
    totalCompletedWorkouts: number;
    averageAthleteLevel: number;
  };
}

export interface RecentActivity {
  type: "client_hire" | "plan_created" | "plan_assigned";
  title: string;
  description: string;
  date: string;
}

export interface AnalyticsOverviewResponse {
  status: number;
  success: boolean;
  message: string;
  data: {
    totalAthletes: number;
    activeAthletes: number;
    totalWorkoutPlans: number;
    publishedPlans: number;
    draftPlans: number;
    assignedPlans: number;
    totalRevenue: number;
    averageAthleteLevel: number;
    recentActivities: RecentActivity[];
  };
}

export interface AnalyticsAthlete {
  name: string;
  username: string;
  level: number;
  xp: number;
  coins: number;
  assignedPlans: number;
  joinedDate: string;
}

export interface AnalyticsAthletesResponse {
  status: number;
  success: boolean;
  message: string;
  data: AnalyticsAthlete[];
}

export interface AnalyticsPlan {
  title: string;
  difficulty: string;
  status: string;
  exerciseCount: number;
  assignedCount: number;
  createdAt: string;
}

export interface AnalyticsPlansResponse {
  status: number;
  success: boolean;
  message: string;
  data: AnalyticsPlan[];
}

export interface CoachEarningsResponse {
  status: number;
  success: boolean;
  message: string;
  data: {
    totalEarnings: number;
    totalTransactions: number;
    transactions: {
      _id: string;
      athleteName: string;
      amount: number;
      coachEarning: number;
      type: string;
      date: string;
    }[];
  };
}

export interface AdminTransaction {
  _id: string;
  athleteName: string;
  coachName: string;
  amount: number;
  adminCommission: number;
  coachEarning: number;
  type: string;
  status: string;
  date: string;
}

export interface AdminTransactionsResponse {
  status: number;
  success: boolean;
  message: string;
  data: {
    totalRevenue: number;
    adminCommission: number;
    transactionCount: number;
    transactions: AdminTransaction[];
  };
}

export const coachAPI = {
  getDashboardStats: async (): Promise<DashboardStatsResponse> => {
    try {
      const response = await apiClient.get<DashboardStatsResponse>(
        "/api/v1/coach/dashboard/stats"
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to fetch dashboard stats"
      );
    }
  },

  getAnalyticsOverview: async (): Promise<AnalyticsOverviewResponse> => {
    try {
      const response = await apiClient.get<AnalyticsOverviewResponse>(
        "/api/v1/coach/analytics/overview"
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to fetch analytics overview"
      );
    }
  },

  getAnalyticsAthletes: async (): Promise<AnalyticsAthletesResponse> => {
    try {
      const response = await apiClient.get<AnalyticsAthletesResponse>(
        "/api/v1/coach/analytics/athletes"
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to fetch analytics athletes"
      );
    }
  },

  getAnalyticsPlans: async (): Promise<AnalyticsPlansResponse> => {
    try {
      const response = await apiClient.get<AnalyticsPlansResponse>(
        "/api/v1/coach/analytics/plans"
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to fetch analytics plans"
      );
    }
  },

  getEarnings: async (): Promise<CoachEarningsResponse> => {
    try {
      const response = await apiClient.get<CoachEarningsResponse>(
        "/api/v1/coach/earnings"
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to fetch earnings"
      );
    }
  },

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

  getCoaches: async (
    page: number = 1,
    limit: number = 10,
    search?: string,
    specialization?: string
  ): Promise<PaginatedCoachesResponse> => {
    try {
      const params: Record<string, any> = { page, limit };
      if (search) params.search = search;
      if (specialization && specialization !== "all") params.specialization = specialization;

      const response = await apiClient.get<PaginatedCoachesResponse>(
        "/api/v1/coaches",
        { params }
      );

      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to fetch coaches"
      );
    }
  },

  getCoach: async (id: string): Promise<SingleCoachResponse> => {
    try {
      const response = await apiClient.get<SingleCoachResponse>(
        `/api/v1/coaches/${id}`
      );

      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to fetch coach"
      );
    }
  },

  hireCoach: async (id: string): Promise<HireCoachResponse> => {
    try {
      const response = await apiClient.post<HireCoachResponse>(
        `/api/v1/coaches/${id}/hire`
      );

      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to hire coach"
      );
    }
  },
};

export interface Exercise {
  _id?: string;
  id?: string;
  name: string;
  category: "Strength" | "Cardio" | "Mobility" | "Core" | "HIIT";
  bodyPart: "Chest" | "Back" | "Legs" | "Arms" | "Shoulders" | "Core" | "Full Body";
  equipment: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  description: string;
  instructions: string;
  thumbnail?: string;
  videoUrl?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginatedExercisesResponse {
  status: number;
  success: boolean;
  message: string;
  data: Exercise[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SingleExerciseResponse {
  status: number;
  success: boolean;
  message: string;
  data: Exercise;
}

export const exerciseAPI = {
  getExercises: async (
    page: number = 1,
    limit: number = 50,
    search?: string,
    category?: string,
    bodyPart?: string,
    difficulty?: string
  ): Promise<PaginatedExercisesResponse> => {
    try {
      const params: Record<string, any> = { page, limit };
      if (search) params.search = search;
      if (category && category !== "all") params.category = category;
      if (bodyPart && bodyPart !== "all") params.bodyPart = bodyPart;
      if (difficulty && difficulty !== "all") params.difficulty = difficulty;

      const response = await apiClient.get<PaginatedExercisesResponse>(
        "/api/v1/exercises",
        { params }
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to fetch exercises"
      );
    }
  },

  getExercise: async (id: string): Promise<SingleExerciseResponse> => {
    try {
      const response = await apiClient.get<SingleExerciseResponse>(
        `/api/v1/exercises/${id}`
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to fetch exercise"
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

export interface WorkoutPlanExercise {
  exerciseId?: string; // Optional for backward compatibility
  exerciseName?: string; // For inline exercises
  category?: string; // For inline exercises
  exerciseCategory?: string; // For backward compatibility
  exerciseBodyPart?: string; // For backward compatibility
  exerciseEquipment?: string; // For backward compatibility
  exerciseDifficulty?: string; // For backward compatibility
  sets: number;
  reps: string;
  restSeconds: number;
  notes?: string;
  order: number;
}

export interface WorkoutPlan {
  _id?: string;
  id?: string;
  coachId?: string;
  title: string;
  description: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimatedDuration: number;
  status: "Draft" | "Published";
  exercises: WorkoutPlanExercise[];
  coverImage?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginatedWorkoutPlansResponse {
  status: number;
  success: boolean;
  message: string;
  data: WorkoutPlan[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SingleWorkoutPlanResponse {
  status: number;
  success: boolean;
  message: string;
  data: WorkoutPlan;
}

export const workoutPlanAPI = {
  getWorkoutPlans: async (
    page: number = 1,
    limit: number = 10,
    status?: string
  ): Promise<PaginatedWorkoutPlansResponse> => {
    try {
      const params: Record<string, any> = { page, limit };
      if (status && status !== "all") params.status = status;

      const response = await apiClient.get<PaginatedWorkoutPlansResponse>(
        "/api/v1/coach/workout-plans",
        { params }
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to fetch workout plans"
      );
    }
  },

  getWorkoutPlan: async (id: string): Promise<SingleWorkoutPlanResponse> => {
    try {
      const response = await apiClient.get<SingleWorkoutPlanResponse>(
        `/api/v1/coach/workout-plans/${id}`
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to fetch workout plan"
      );
    }
  },

  createWorkoutPlan: async (
    data: Partial<WorkoutPlan> | FormData
  ): Promise<SingleWorkoutPlanResponse> => {
    try {
      const response = await apiClient.post<SingleWorkoutPlanResponse>(
        "/api/v1/coach/workout-plans",
        data,
        {
          headers: data instanceof FormData ? { "Content-Type": "multipart/form-data" } : undefined
        }
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to create workout plan"
      );
    }
  },

  updateWorkoutPlan: async (
    id: string,
    data: Partial<WorkoutPlan> | FormData
  ): Promise<SingleWorkoutPlanResponse> => {
    try {
      const response = await apiClient.put<SingleWorkoutPlanResponse>(
        `/api/v1/coach/workout-plans/${id}`,
        data,
        {
          headers: data instanceof FormData ? { "Content-Type": "multipart/form-data" } : undefined
        }
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to update workout plan"
      );
    }
  },

  deleteWorkoutPlan: async (id: string): Promise<{ status: number; success: boolean; message: string }> => {
    try {
      const response = await apiClient.delete<{
        status: number;
        success: boolean;
        message: string;
      }>(`/api/v1/coach/workout-plans/${id}`);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to delete workout plan"
      );
    }
  },

  publishWorkoutPlan: async (id: string): Promise<SingleWorkoutPlanResponse> => {
    try {
      const response = await apiClient.patch<SingleWorkoutPlanResponse>(
        `/api/v1/coach/workout-plans/${id}/publish`
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to publish workout plan"
      );
    }
  },

  assignWorkoutPlan: async (planId: string, athleteId: string): Promise<SingleWorkoutPlanResponse> => {
    try {
      const response = await apiClient.post<SingleWorkoutPlanResponse>(
        `/api/v1/coach/workout-plans/${planId}/assign`,
        { athleteId }
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to assign workout plan"
      );
    }
  },

  getCoachAssignedPlans: async (): Promise<any> => {
    try {
      const response = await apiClient.get<any>(
        "/api/v1/coach/assigned-plans"
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to fetch assigned plans"
      );
    }
  },

  getUserWorkoutPlans: async (): Promise<any> => {
    try {
      const response = await apiClient.get<any>(
        "/api/v1/user/workout-plans"
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to fetch workout plans"
      );
    }
  },
};

export interface CompleteWorkoutResponse {
  status: number;
  success: boolean;
  message: string;
  data: {
    xpEarned: number;
    coinsEarned: number;
    newXp: number;
    newLevel: number;
    newCoins: number;
  };
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastWorkoutDate: string | undefined;
  streakActive: boolean;
}

export const userAPI = {
  completeWorkout: async (workoutId: string, duration: number): Promise<CompleteWorkoutResponse> => {
    try {
      const response = await apiClient.post<CompleteWorkoutResponse>(
        `/api/v1/user/workouts/${workoutId}/complete`,
        { duration }
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to complete workout"
      );
    }
  },

  getWorkoutCompletions: async (): Promise<any> => {
    try {
      const response = await apiClient.get<any>(
        "/api/v1/user/workout-completions"
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to fetch workout completions"
      );
    }
  },

  getAchievements: async (): Promise<{
    status: number;
    success: boolean;
    message: string;
    data: UserAchievementWithProgress[];
  }> => {
    try {
      const response = await apiClient.get<{
        status: number;
        success: boolean;
        message: string;
        data: UserAchievementWithProgress[];
      }>("/api/v1/user/achievements");
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to fetch achievements"
      );
    }
  },

  getStreak: async (): Promise<{
    status: number;
    success: boolean;
    message: string;
    data: StreakData;
  }> => {
    try {
      const response = await apiClient.get<{
        status: number;
        success: boolean;
        message: string;
        data: StreakData;
      }>("/api/v1/user/streak");
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to fetch streak"
      );
    }
  },

  getDashboard: async (): Promise<{
    status: number;
    success: boolean;
    message: string;
    data: any;
  }> => {
    try {
      const response = await apiClient.get<{
        status: number;
        success: boolean;
        message: string;
        data: any;
      }>("/api/v1/user/dashboard");
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to fetch dashboard data"
      );
    }
  },

  getAnalytics: async (): Promise<{
    status: number;
    success: boolean;
    message: string;
    data: any;
  }> => {
    try {
      const response = await apiClient.get<{
        status: number;
        success: boolean;
        message: string;
        data: any;
      }>("/api/v1/user/analytics");
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to fetch analytics data"
      );
    }
  },

  chatWithAI: async (message: string): Promise<{
    status: number;
    success: boolean;
    message: string;
    data: { reply: string };
  }> => {
    try {
      const response = await apiClient.post<{
        status: number;
        success: boolean;
        message: string;
        data: { reply: string };
      }>("/api/v1/user/chatbot", { message });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to get AI response"
      );
    }
  },
};

export default apiClient;