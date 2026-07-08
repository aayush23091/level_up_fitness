import { UserModel, IUser } from "../models/user.model";
import { CoachClientModel, ICoachClient } from "../models/coachClient.model";

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

    // Extract users from populated relationships
    let users = coachClients
      .map((cc: any) => cc.athleteId)
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
}
