import { Types } from "mongoose";
import { TransactionModel, ITransaction } from "../models/transaction.model";

export interface CoachTransaction {
  _id: string;
  athleteName: string;
  amount: number;
  coachEarning: number;
  type: string;
  date: string;
}

export interface AdminTransaction {
  _id: string;
  athleteName: string;
  coachName: string;
  amount: number;
  adminCommission: number;
  coachEarning: number;
  type: string;
  status: string;
  date: string;
}

export class TransactionRepository {
  async createTransaction(
    userId: string,
    coachId: string,
    amount: number,
    adminCommission: number,
    coachEarning: number,
    type: string = "coach_hire",
    status: string = "completed"
  ): Promise<ITransaction> {
    return TransactionModel.create({
      userId,
      coachId,
      amount,
      adminCommission,
      coachEarning,
      type,
      status,
    });
  }

  async getCoachTransactions(coachId: string): Promise<{
    totalEarnings: number;
    totalTransactions: number;
    transactions: CoachTransaction[];
  }> {
    const coachObjectId = new Types.ObjectId(coachId);

    const [totalEarningsResult, totalTransactions, transactions] =
      await Promise.all([
        TransactionModel.aggregate([
          { $match: { coachId: coachObjectId, status: "completed" } },
          { $group: { _id: null, total: { $sum: "$coachEarning" } } },
        ]),
        TransactionModel.countDocuments({
          coachId: coachObjectId,
          status: "completed",
        }).exec(),
        TransactionModel.find({ coachId: coachObjectId, status: "completed" })
          .populate("userId", "name")
          .sort({ createdAt: -1 })
          .exec(),
      ]);

    const totalEarnings = totalEarningsResult.length > 0 ? totalEarningsResult[0].total : 0;

    const formattedTransactions = transactions.map((tx: any) => {
      const user = tx.userId;
      return {
        _id: tx._id.toString(),
        athleteName: user?.name || "Unknown Athlete",
        amount: tx.amount,
        coachEarning: tx.coachEarning,
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

  async getAdminTransactions(): Promise<{
    totalRevenue: number;
    adminCommission: number;
    transactionCount: number;
    transactions: AdminTransaction[];
  }> {
    const [totalRevenueResult, adminCommissionResult, transactionCount, transactions] =
      await Promise.all([
        TransactionModel.aggregate([
          { $match: { status: "completed" } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
        TransactionModel.aggregate([
          { $match: { status: "completed" } },
          { $group: { _id: null, total: { $sum: "$adminCommission" } } },
        ]),
        TransactionModel.countDocuments({ status: "completed" }).exec(),
        TransactionModel.find({ status: "completed" })
          .populate("userId", "name")
          .populate("coachId", "name")
          .sort({ createdAt: -1 })
          .exec(),
      ]);

    const totalRevenue = totalRevenueResult.length > 0 ? totalRevenueResult[0].total : 0;
    const adminCommission = adminCommissionResult.length > 0 ? adminCommissionResult[0].total : 0;

    const formattedTransactions = transactions.map((tx: any) => {
      const user = tx.userId;
      const coach = tx.coachId;
      return {
        _id: tx._id.toString(),
        athleteName: user?.name || "Unknown Athlete",
        coachName: coach?.name || "Unknown Coach",
        amount: tx.amount,
        adminCommission: tx.adminCommission,
        coachEarning: tx.coachEarning,
        type: tx.type,
        status: tx.status,
        date: tx.createdAt,
      };
    });

    return {
      totalRevenue,
      adminCommission,
      transactionCount,
      transactions: formattedTransactions,
    };
  }
}
