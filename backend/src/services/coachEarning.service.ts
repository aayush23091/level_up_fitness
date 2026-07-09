import { CoachEarningRepository } from "../repositories/coachEarning.repository";
import { HttpException } from "../exceptions/http-exception";

const coachEarningRepository = new CoachEarningRepository();

export interface CoachEarningResponse {
  totalEarnings: number;
  totalTransactions: number;
  transactions: {
    _id: string;
    athleteName: string;
    amount: number;
    type: string;
    date: string;
  }[];
}

export class CoachEarningService {
  async getCoachEarnings(coachId: string): Promise<CoachEarningResponse> {
    if (!coachId) {
      throw new HttpException(401, "Unauthorized: Coach ID not found");
    }

    return coachEarningRepository.getCoachEarnings(coachId);
  }
}
