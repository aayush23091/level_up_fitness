import { Types } from "mongoose";
import { UserModel, IUser } from "../models/user.model";
import { CoachClientModel, ICoachClient } from "../models/coachClient.model";
import { WorkoutPlanModel } from "../models/workoutPlan.model";
import { AssignedWorkoutPlanModel } from "../models/assignedWorkoutPlan.model";
import { WorkoutCompletionModel } from "../models/workoutCompletion.model";
import { TransactionModel } from "../models/transaction.model";

export interface RecentActivity {
  type: "client_hire" | "plan_created" | "plan_assigned" | "earnings";
  title: string;
  description: string;
  date: Date;
}

export interface AnalyticsAthlete {
  name: string;
  username: string;
  level: number;
  xp: number;
  coins: number;
  assignedPlans: number;
  joinedDate: Date;
}

export interface AnalyticsPlan {
  title: string;
  difficulty: string;
  status: string;
  exerciseCount: number;
  assignedCount: number;
  createdAt: Date;
}

export class CoachRepository {
  async getAthletes(
    coachId: string,
    page: number,
    limit: number,
    search?: string
  ): Promise<{ users: IUser[]; total: number }> {
    const skip = (page - 1) * limit;

    // Build base query for active CoachClient relationships
    const coachClientQuery: any = { coachId, status: "active" };

    // Get total count of active relationships
    const total = await CoachClientModel.countDocuments(coachClientQuery).exec();

    // Get paginated active relationships and populate athlete info
    const coachClients = await CoachClientModel
      .find(coachClientQuery)
      .skip(skip)
      .limit(limit)
      .populate("athleteId")
      .sort({ createdAt: -1 })
      .exec();

    // Extract user IDs for batch aggregation queries
    const athleteIds = coachClients
      .map((cc: any) => cc.athleteId)
      .filter((id: any) => id != null);

    // Batch count total assigned workouts per athlete
    const assignedCounts: Record<string, number> = {};
    if (athleteIds.length > 0) {
      const assignedAgg = await AssignedWorkoutPlanModel.aggregate([
        { $match: { athleteId: { $in: athleteIds } } },
        { $group: { _id: "$athleteId", count: { $sum: 1 } } },
      ]) || [];
      assignedAgg.forEach((item: any) => {
        assignedCounts[item._id.toString()] = item.count;
      });
    }

    // Batch count completed workouts per athlete
    const completedCounts: Record<string, number> = {};
    if (athleteIds.length > 0) {
      const completedAgg = await WorkoutCompletionModel.aggregate([
        { $match: { userId: { $in: athleteIds } } },
        { $group: { _id: "$userId", count: { $sum: 1 } } },
      ]) || [];
      completedAgg.forEach((item: any) => {
        completedCounts[item._id.toString()] = item.count;
      });
    }

    // Extract users from populated relationships and attach coachClient data
    let users = coachClients
      .map((cc: any) => {
        if (!cc.athleteId) return null;
        const user = cc.athleteId.toObject ? cc.athleteId.toObject() : cc.athleteId;
        const athleteIdStr = user._id.toString();
        // Attach coachClient data to user object
        user.coachClient = {
          status: cc.status,
          hiredAt: cc.hiredAt,
        };
        user.completedWorkouts = completedCounts[athleteIdStr] || 0;
        user.totalAssignedWorkouts = assignedCounts[athleteIdStr] || 0;
        return user;
      })
      .filter((user: any) => user !== null && user !== undefined);

    // Apply search filter if provided
    if (search) {
      const regex = new RegExp(search, "i");
      users = users.filter((user: any) =>
        regex.test(user.name) || regex.test(user.email)
      );
    }

    return { users, total };
  }

  async getAthleteById(id: string): Promise<IUser | null> {
    return UserModel.findById(id).exec();
  }

  async getDashboardStats(coachId: string) {
    // Count active coach-client relationships (total athletes)
    const totalAthletes = await CoachClientModel.countDocuments({
      coachId,
      status: "active"
    }).exec();

    // Count workout plans created by this coach
    const totalWorkoutPlans = await WorkoutPlanModel.countDocuments({
      coachId
    }).exec();

    // Count published workout plans
    const publishedPlans = await WorkoutPlanModel.countDocuments({
      coachId,
      status: "Published"
    }).exec();

    // Count active assigned workout plans
    const assignedPlans = await AssignedWorkoutPlanModel.countDocuments({
      coachId,
      status: "active"
    }).exec();

    // Count completed assigned workout plans
    const totalCompletedWorkouts = await AssignedWorkoutPlanModel.countDocuments({
      coachId,
      status: "completed"
    }).exec();

    // Calculate average athlete level from connected athletes
    const coachClients = await CoachClientModel.find({
      coachId,
      status: "active"
    }).populate("athleteId").exec();

    let totalLevel = 0;
    let athleteCount = 0;

    for (const cc of coachClients) {
      const athlete = cc.athleteId as any;
      if (athlete && athlete.level !== undefined && athlete.level !== null) {
        totalLevel += athlete.level;
        athleteCount++;
      }
    }

    const averageAthleteLevel = athleteCount > 0 ? Math.round(totalLevel / athleteCount) : 0;

    return {
      totalAthletes,
      totalWorkoutPlans,
      publishedPlans,
      assignedPlans,
      totalCompletedWorkouts,
      averageAthleteLevel
    };
  }

  async getAnalyticsOverview(coachId: string) {
    const coachObjectId = new Types.ObjectId(coachId);

    const [
      totalAthletes,
      activeAthletes,
      totalWorkoutPlans,
      publishedPlans,
      draftPlans,
      assignedPlans,
      totalCompletedWorkouts,
      coach,
    ] = await Promise.all([
      CoachClientModel.countDocuments({ coachId, status: "active" }).exec(),
      CoachClientModel.countDocuments({ coachId, status: "active" }).exec(),
      WorkoutPlanModel.countDocuments({ coachId }).exec(),
      WorkoutPlanModel.countDocuments({ coachId, status: "Published" }).exec(),
      WorkoutPlanModel.countDocuments({ coachId, status: "Draft" }).exec(),
      AssignedWorkoutPlanModel.countDocuments({ coachId, status: "active" }).exec(),
      AssignedWorkoutPlanModel.countDocuments({ coachId, status: "completed" }).exec(),
      UserModel.findById(coachId).exec(),
    ]);

    const totalRevenueResult = await TransactionModel.aggregate([
      { $match: { coachId: coachObjectId, status: "completed" } },
      { $group: { _id: null, total: { $sum: "$coachEarning" } } },
    ]);
    const totalRevenue = totalRevenueResult.length > 0 ? totalRevenueResult[0].total : 0;

    const coachClients = await CoachClientModel.find({
      coachId,
      status: "active",
    }).populate("athleteId").exec();

    let totalLevel = 0;
    let athleteCount = 0;

    for (const cc of coachClients) {
      const athlete = cc.athleteId as any;
      if (athlete && athlete.level !== undefined && athlete.level !== null) {
        totalLevel += athlete.level;
        athleteCount++;
      }
    }

    const averageAthleteLevel = athleteCount > 0 ? Math.round(totalLevel / athleteCount) : 0;

    const [newClients, plans, assignments, recentTransactions] = await Promise.all([
      CoachClientModel.find({ coachId, status: "active" })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate("athleteId", "name")
        .exec(),
      WorkoutPlanModel.find({ coachId }).sort({ createdAt: -1 }).limit(10).exec(),
      AssignedWorkoutPlanModel.find({ coachId })
        .sort({ assignedAt: -1 })
        .limit(10)
        .populate("athleteId", "name")
        .populate("workoutPlanId", "title")
        .exec(),
      TransactionModel.find({ coachId: coachObjectId, status: "completed" })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate("userId", "name")
        .exec(),
    ]);

    const activities: RecentActivity[] = [];

    for (const cc of newClients) {
      const athlete = (cc.athleteId as any);
      activities.push({
        type: "client_hire",
        title: `New athlete hired: ${athlete?.name || "Athlete"}`,
        description: `${athlete?.name || "An athlete"} started working with you`,
        date: cc.createdAt,
      });
    }

    for (const plan of plans) {
      activities.push({
        type: "plan_created",
        title: `Workout plan created: ${plan.title}`,
        description: `A new ${plan.difficulty} plan was added`,
        date: plan.createdAt,
      });
    }

    for (const assignment of assignments) {
      const athlete = (assignment.athleteId as any);
      const plan = (assignment.workoutPlanId as any);
      activities.push({
        type: "plan_assigned",
        title: `Plan assigned: ${plan?.title || "Plan"}`,
        description: `Assigned to ${athlete?.name || "an athlete"}`,
        date: assignment.assignedAt,
      });
    }

    for (const tx of recentTransactions) {
      const athlete = (tx as any).userId;
      activities.push({
        type: "earnings",
        title: `Earnings: ${athlete?.name || "Athlete"}`,
        description: `Earned $${tx.coachEarning} from ${athlete?.name || "an athlete"}`,
        date: tx.createdAt,
      });
    }

    activities.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const recentActivities = activities.slice(0, 10);

    return {
      totalAthletes,
      activeAthletes,
      totalWorkoutPlans,
      publishedPlans,
      draftPlans,
      assignedPlans,
      totalCompletedWorkouts,
      totalRevenue,
      averageAthleteLevel,
      recentActivities,
    };
  }

  async getAnalyticsAthletes(coachId: string): Promise<AnalyticsAthlete[]> {
    const coachClients = await CoachClientModel.find({
      coachId,
      status: "active",
    })
      .populate("athleteId")
      .sort({ createdAt: -1 })
      .exec();

    const assignmentCounts = await AssignedWorkoutPlanModel.aggregate([
      { $match: { coachId: new Types.ObjectId(coachId), status: "active" } },
      { $group: { _id: "$athleteId", count: { $sum: 1 } } },
    ]);

    const assignedMap: Record<string, number> = {};
    assignmentCounts.forEach((item: any) => {
      assignedMap[item._id.toString()] = item.count;
    });

    const athletes: AnalyticsAthlete[] = [];

    for (const cc of coachClients) {
      const athlete = cc.athleteId as any;
      if (!athlete) continue;

      athletes.push({
        name: athlete.name,
        username: athlete.username,
        level: athlete.level || 0,
        xp: athlete.xp || 0,
        coins: athlete.coins || 0,
        assignedPlans: assignedMap[athlete._id.toString()] || 0,
        joinedDate: (cc as any).hiredAt || athlete.createdAt,
      });
    }

    return athletes;
  }

  async getAnalyticsPlans(coachId: string): Promise<AnalyticsPlan[]> {
    const plans = await WorkoutPlanModel.find({ coachId })
      .sort({ createdAt: -1 })
      .exec();

    const assignmentCounts = await AssignedWorkoutPlanModel.aggregate([
      { $match: { coachId: new Types.ObjectId(coachId) } },
      { $group: { _id: "$workoutPlanId", count: { $sum: 1 } } },
    ]);

    const assignedMap: Record<string, number> = {};
    assignmentCounts.forEach((item: any) => {
      assignedMap[item._id.toString()] = item.count;
    });

    return plans.map((plan) => ({
      title: plan.title,
      difficulty: plan.difficulty,
      status: plan.status,
      exerciseCount: plan.exercises?.length || 0,
      assignedCount: assignedMap[plan._id.toString()] || 0,
      createdAt: plan.createdAt,
    }));
  }
}
