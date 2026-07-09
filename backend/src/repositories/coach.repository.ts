import { UserModel, IUser } from "../models/user.model";
import { CoachClientModel, ICoachClient } from "../models/coachClient.model";
import { WorkoutPlanModel } from "../models/workoutPlan.model";
import { AssignedWorkoutPlanModel } from "../models/assignedWorkoutPlan.model";

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

    // Extract users from populated relationships and attach coachClient data
    let users = coachClients
      .map((cc: any) => {
        if (!cc.athleteId) return null;
        const user = cc.athleteId.toObject ? cc.athleteId.toObject() : cc.athleteId;
        // Attach coachClient data to user object
        user.coachClient = {
          status: cc.status,
          hiredAt: cc.hiredAt,
        };
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
}
