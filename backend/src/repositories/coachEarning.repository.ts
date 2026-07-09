import { Types } from "mongoose";
import { CoachEarningModel, ICoachEarning } from "../models/coachEarning.model";
import { UserModel } from "../models/user.model";

export interface CoachEarningTransaction {
  _id: string;
  athleteName: string;
  amount: number;
  type: string;
  date: string;
}

export class CoachEarningRepository {
  async createCoachEarning(
    coachId: string,
    athleteId: string,
    amount: number,
    type: string = "coach_hire",
    status: string = "completed"
  ): Promise<ICoachEarning> {
    return CoachEarningModel.create({
      coachId,
      athleteId,
      amount,
      type,
      status,
    });
  }

  async getCoachEarnings(coachId: string): Promise<{
    totalEarnings: number;
    totalTransactions: number;
    transactions: CoachEarningTransaction[];
  }> {
    const coachObjectId = new Types.ObjectId(coachId);

    const [totalEarningsResult, totalTransactions, transactions] =
      await Promise.all([
        CoachEarningModel.aggregate([
          { $match: { coachId: coachObjectId, status: "completed" } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
        CoachEarningModel.countDocuments({
          coachId: coachObjectId,
          status: "completed",
        }).exec(),
        CoachEarningModel.find({ coachId: coachObjectId, status: "completed" })
          .populate("athleteId", "name")
          .sort({ createdAt: -1 })
          .exec(),
      ]);

    const totalEarnings = totalEarningsResult.length > 0 ? totalEarningsResult[0].total : 0;

    const formattedTransactions = transactions.map((tx: any) => {
      const athlete = tx.athleteId;
      return {
        _id: tx._id.toString(),
        athleteName: athlete?.name || "Unknown Athlete",
        amount: tx.amount,
        type: tx.type,
        date: tx.createdAt,
      };
    });

    return {
      totalEarnings,
      totalTransactions,
      transactions: formattedTransactions,
    };
  }
}
