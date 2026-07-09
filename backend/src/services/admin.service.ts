import { AdminUserRepository } from "../repositories/admin.repository";
import { AdminCreateUserDTO, AdminUpdateUserDTO } from "../dtos/admin.dto";
import { IUser } from "../models/user.model";
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
}
