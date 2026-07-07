import { CoachRepository } from "../repositories/coach.repository";
import { IUser } from "../models/user.model";

const coachRepository = new CoachRepository();

export class CoachService {
  async getAthletes(
    page: number,
    limit: number,
    search?: string
  ): Promise<{ users: IUser[]; total: number }> {
    return coachRepository.getAthletes(page, limit, search);
  }
}
