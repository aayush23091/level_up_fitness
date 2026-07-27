import { UserModel, IUser } from "../models/user.model";
import { WorkoutPlanModel, IWorkoutPlan } from "../models/workoutPlan.model";
import { WorkoutModel, IWorkout } from "../models/workout.model";
import { CoachClientModel } from "../models/coachClient.model";
import { AchievementModel, IAchievement } from "../models/achievement.model";

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

  async getCoaches(
    page: number,
    limit: number,
    search?: string
  ): Promise<{ coaches: any[]; total: number }> {
    const query: any = { role: "coach" };

    if (search) {
      const regex = new RegExp(search, "i");
      query.$or = [{ name: regex }, { email: regex }];
    }

    const skip = (page - 1) * limit;

    const [coaches, total] = await Promise.all([
      UserModel.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }).exec(),
      UserModel.countDocuments(query).exec()
    ]);

    // For each coach, get the count of clients and workout plans
    const coachesWithCounts = await Promise.all(
      coaches.map(async (coach) => {
        const coachObj = coach.toObject();
        const [clientCount, planCount] = await Promise.all([
          CoachClientModel.countDocuments({ coachId: coach._id, status: "active" }).exec(),
          WorkoutPlanModel.countDocuments({ coachId: coach._id }).exec()
        ]);
        return {
          ...coachObj,
          clientCount,
          planCount
        };
      })
    );

    return { coaches: coachesWithCounts, total };
  }

  async getCoachById(id: string): Promise<any | null> {
    const coach = await UserModel.findOne({ _id: id, role: "coach" }).exec();
    if (!coach) return null;

    const coachObj = coach.toObject();
    const [clientCount, planCount] = await Promise.all([
      CoachClientModel.countDocuments({ coachId: coach._id, status: "active" }).exec(),
      WorkoutPlanModel.countDocuments({ coachId: coach._id }).exec()
    ]);

    return {
      ...coachObj,
      clientCount,
      planCount
    };
  }

  async deleteCoach(id: string): Promise<boolean> {
    const coach = await UserModel.findOne({ _id: id, role: "coach" }).exec();
    if (!coach) return false;
    
    // Delete associated coach clients and workout plans
    await Promise.all([
      CoachClientModel.deleteMany({ coachId: id }).exec(),
      WorkoutPlanModel.deleteMany({ coachId: id }).exec()
    ]);

    const result = await UserModel.findByIdAndDelete(id).exec();
    return !!result;
  }

  async getWorkouts(
    page: number,
    limit: number,
    search?: string
  ): Promise<{ workouts: IWorkout[]; total: number }> {
    const query: any = {};

    if (search) {
      const regex = new RegExp(search, "i");
      query.$or = [{ title: regex }, { description: regex }];
    }

    const skip = (page - 1) * limit;

    const [workouts, total] = await Promise.all([
      WorkoutModel.find(query).populate("createdBy", "name username email role").skip(skip).limit(limit).sort({ createdAt: -1 }).exec(),
      WorkoutModel.countDocuments(query).exec(),
    ]);

    return { workouts, total };
  }

  async getWorkoutById(id: string): Promise<IWorkout | null> {
    return WorkoutModel.findById(id).populate("createdBy", "name username email role").exec();
  }

  async createWorkout(workoutData: Partial<IWorkout>): Promise<IWorkout> {
    return WorkoutModel.create(workoutData);
  }

  async updateWorkout(id: string, workoutData: Partial<IWorkout>): Promise<IWorkout | null> {
    return WorkoutModel.findByIdAndUpdate(id, workoutData, { new: true }).exec();
  }

  async deleteWorkout(id: string): Promise<boolean> {
    const result = await WorkoutModel.findByIdAndDelete(id).exec();
    return !!result;
  }

  async getAchievements(
    page: number,
    limit: number,
    search?: string,
    status?: string
  ): Promise<{ achievements: IAchievement[]; total: number }> {
    const query: any = {};

    if (search) {
      const regex = new RegExp(search, "i");
      query.$or = [{ title: regex }, { description: regex }];
    }

    if (status && status !== "all") {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const [achievements, total] = await Promise.all([
      AchievementModel.find(query)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      AchievementModel.countDocuments(query).exec(),
    ]);

    return { achievements, total };
  }

  async getAchievementById(id: string): Promise<IAchievement | null> {
    return AchievementModel.findById(id).exec();
  }

  async createAchievement(achievementData: Partial<IAchievement>): Promise<IAchievement> {
    return AchievementModel.create(achievementData);
  }

  async updateAchievement(id: string, achievementData: Partial<IAchievement>): Promise<IAchievement | null> {
    return AchievementModel.findByIdAndUpdate(id, achievementData, { new: true }).exec();
  }

  async deleteAchievement(id: string): Promise<boolean> {
    const result = await AchievementModel.findByIdAndDelete(id).exec();
    return !!result;
  }
}
