import { UserModel, IUser } from "../models/user.model";

export class CoachRepository {
  async getAthletes(
    page: number,
    limit: number,
    search?: string
  ): Promise<{ users: IUser[]; total: number }> {
    const query: any = { role: "user" };

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
}
