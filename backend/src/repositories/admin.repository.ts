import { UserModel, IUser } from "../models/user.model";
import { WorkoutPlanModel, IWorkoutPlan } from "../models/workoutPlan.model";

interface DashboardStats {
  totalUsers: number;
  totalCoaches: number;
  totalAdmins: number;
  totalWorkoutPlans: number;
  totalPublishedPlans: number;
  recentUsers: IUser[];
  recentCoaches: IUser[];
}

export class AdminUserRepository {
  async getUsers(
    page: number,
    limit: number,
    search?: string
  ): Promise<{ users: IUser[]; total: number }> {
    const query: any = {};

    if (search) {
      const regex = new RegExp(search, "i");
      query.$or = [{ name: regex }, { email: regex }];
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      UserModel.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }).exec(),
      UserModel.countDocuments(query).exec(),
    ]);

    return { users, total };
  }

  async getUserById(id: string): Promise<IUser | null> {
    return UserModel.findById(id).exec();
  }

  async createUser(userData: Partial<IUser>): Promise<IUser> {
    return UserModel.create(userData);
  }

  async updateUser(id: string, userData: Partial<IUser>): Promise<IUser | null> {
    return UserModel.findByIdAndUpdate(id, userData, { new: true }).exec();
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await UserModel.findByIdAndDelete(id).exec();
    return !!result;
  }

  async getUserByEmail(email: string): Promise<IUser | null> {
    return UserModel.findOne({ email }).exec();
  }

  async getUserByUsername(username: string): Promise<IUser | null> {
    return UserModel.findOne({ username }).exec();
  }

  async getDashboardStats(): Promise<DashboardStats> {
    const [
      totalUsers,
      totalCoaches,
      totalAdmins,
      totalWorkoutPlans,
      totalPublishedPlans,
      recentUsers,
      recentCoaches
    ] = await Promise.all([
      UserModel.countDocuments({ role: "user" }).exec(),
      UserModel.countDocuments({ role: "coach" }).exec(),
      UserModel.countDocuments({ role: "admin" }).exec(),
      WorkoutPlanModel.countDocuments().exec(),
      WorkoutPlanModel.countDocuments({ status: "Published" }).exec(),
      UserModel.find({ role: "user" }).sort({ createdAt: -1 }).limit(5).exec(),
      UserModel.find({ role: "coach" }).sort({ createdAt: -1 }).limit(5).exec()
    ]);

    return {
      totalUsers,
      totalCoaches,
      totalAdmins,
      totalWorkoutPlans,
      totalPublishedPlans,
      recentUsers,
      recentCoaches
    };
  }
}
