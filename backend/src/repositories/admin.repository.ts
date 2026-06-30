import { UserModel, IUser } from "../models/user.model";

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
}
