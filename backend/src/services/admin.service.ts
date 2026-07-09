import { AdminUserRepository } from "../repositories/admin.repository";
import { AdminCreateUserDTO, AdminUpdateUserDTO } from "../dtos/admin.dto";
import { IUser } from "../models/user.model";
import { IWorkout } from "../models/workout.model";
import { IAchievement } from "../models/achievement.model";
import { HttpException } from "../exceptions/http-exception";
import bcrypt from "bcryptjs";

const adminRepository = new AdminUserRepository();

export class AdminUserService {
  async getUsers(
    page: number,
    limit: number,
    search?: string
  ): Promise<{ users: IUser[]; total: number }> {
    return adminRepository.getUsers(page, limit, search);
  }

  async getUserById(id: string): Promise<IUser> {
    const user = await adminRepository.getUserById(id);
    if (!user) {
      throw new HttpException(404, "User not found");
    }
    return user;
  }

  async createUser(userData: AdminCreateUserDTO): Promise<IUser> {
    const existingEmail = await adminRepository.getUserByEmail(userData.email);
    if (existingEmail) {
      throw new HttpException(400, "Email already exists");
    }

    const existingUsername = await adminRepository.getUserByUsername(userData.username);
    if (existingUsername) {
      throw new HttpException(400, "Username already exists");
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const completeUserData: Partial<IUser> = {
      ...userData,
      password: hashedPassword,
    };

    return adminRepository.createUser(completeUserData);
  }

  async updateUser(id: string, updateData: AdminUpdateUserDTO): Promise<IUser> {
    const user = await adminRepository.getUserById(id);
    if (!user) {
      throw new HttpException(404, "User not found");
    }

    if (updateData.email) {
      const existingEmail = await adminRepository.getUserByEmail(updateData.email);
      if (existingEmail && existingEmail._id.toString() !== id) {
        throw new HttpException(400, "Email already exists");
      }
    }

    if (updateData.username) {
      const existingUsername = await adminRepository.getUserByUsername(updateData.username);
      if (existingUsername && existingUsername._id.toString() !== id) {
        throw new HttpException(400, "Username already exists");
      }
    }

    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    } else {
      delete updateData.password;
    }

    const updatedUser = await adminRepository.updateUser(id, updateData);
    if (!updatedUser) {
      throw new HttpException(500, "Failed to update user");
    }

    return updatedUser;
  }

  async deleteUser(id: string): Promise<void> {
    const user = await adminRepository.getUserById(id);
    if (!user) {
      throw new HttpException(404, "User not found");
    }

    const success = await adminRepository.deleteUser(id);
    if (!success) {
      throw new HttpException(500, "Failed to delete user");
    }
  }

  async getDashboardStats() {
    return adminRepository.getDashboardStats();
  }

  async getCoaches(page: number, limit: number, search?: string) {
    return adminRepository.getCoaches(page, limit, search);
  }

  async getCoachById(id: string) {
    const coach = await adminRepository.getCoachById(id);
    if (!coach) {
      throw new HttpException(404, "Coach not found");
    }
    return coach;
  }

  async deleteCoach(id: string): Promise<void> {
    const success = await adminRepository.deleteCoach(id);
    if (!success) {
      throw new HttpException(404, "Coach not found");
    }
  }

  async getWorkouts(
    page: number,
    limit: number,
    search?: string
  ): Promise<{ workouts: IWorkout[]; total: number }> {
    return adminRepository.getWorkouts(page, limit, search);
  }

  async getWorkoutById(id: string): Promise<IWorkout> {
    const workout = await adminRepository.getWorkoutById(id);
    if (!workout) {
      throw new HttpException(404, "Workout not found");
    }
    return workout;
  }

  async createWorkout(workoutData: Partial<IWorkout>): Promise<IWorkout> {
    return adminRepository.createWorkout(workoutData);
  }

  async updateWorkout(id: string, workoutData: Partial<IWorkout>): Promise<IWorkout> {
    const workout = await adminRepository.updateWorkout(id, workoutData);
    if (!workout) {
      throw new HttpException(404, "Workout not found");
    }
    return workout;
  }

  async deleteWorkout(id: string): Promise<void> {
    const success = await adminRepository.deleteWorkout(id);
    if (!success) {
      throw new HttpException(404, "Workout not found");
    }
  }

  async getAchievements(
    page: number,
    limit: number,
    search?: string,
    status?: string
  ): Promise<{ achievements: IAchievement[]; total: number }> {
    return adminRepository.getAchievements(page, limit, search, status);
  }

  async getAchievementById(id: string): Promise<IAchievement> {
    const achievement = await adminRepository.getAchievementById(id);
    if (!achievement) {
      throw new HttpException(404, "Achievement not found");
    }
    return achievement;
  }

  async createAchievement(achievementData: Partial<IAchievement>): Promise<IAchievement> {
    return adminRepository.createAchievement(achievementData);
  }

  async updateAchievement(id: string, achievementData: Partial<IAchievement>): Promise<IAchievement> {
    const achievement = await adminRepository.updateAchievement(id, achievementData);
    if (!achievement) {
      throw new HttpException(404, "Achievement not found");
    }
    return achievement;
  }

  async deleteAchievement(id: string): Promise<void> {
    const success = await adminRepository.deleteAchievement(id);
    if (!success) {
      throw new HttpException(404, "Achievement not found");
    }
  }
}
