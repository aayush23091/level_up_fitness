import { TransactionRepository } from "../repositories/transaction.repository";
import { HttpException } from "../exceptions/http-exception";

const transactionRepository = new TransactionRepository();

export interface CoachEarningResponse {
  totalEarnings: number;
  totalTransactions: number;
  transactions: {
    _id: string;
    athleteName: string;
    amount: number;
    coachEarning: number;
    type: string;
    date: string;
  }[];
}

export class CoachEarningService {
  async getCoachEarnings(coachId: string): Promise<CoachEarningResponse> {
    if (!coachId) {
      throw new HttpException(401, "Unauthorized: Coach ID not found");
    }

    return transactionRepository.getCoachTransactions(coachId);
  }
}
