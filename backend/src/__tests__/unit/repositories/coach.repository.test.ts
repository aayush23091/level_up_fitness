/// <reference types="jest" />
import { CoachRepository } from "../../../repositories/coach.repository";
import { UserModel } from "../../../models/user.model";
import { CoachClientModel } from "../../../models/coachClient.model";
import { WorkoutPlanModel } from "../../../models/workoutPlan.model";
import { AssignedWorkoutPlanModel } from "../../../models/assignedWorkoutPlan.model";

jest.mock("../../../models/user.model", () => {
    return { UserModel: { findById: jest.fn() } };
});
jest.mock("../../../models/coachClient.model", () => {
    return { CoachClientModel: { countDocuments: jest.fn(), find: jest.fn() } };
});
jest.mock("../../../models/workoutPlan.model", () => {
    return { WorkoutPlanModel: { countDocuments: jest.fn(), find: jest.fn() } };
});
jest.mock("../../../models/assignedWorkoutPlan.model", () => {
    return { AssignedWorkoutPlanModel: { countDocuments: jest.fn(), find: jest.fn(), aggregate: jest.fn() } };
});
jest.mock("../../../models/workoutCompletion.model", () => {
    return { WorkoutCompletionModel: { aggregate: jest.fn() } };
});

const mockedUserModel = UserModel as jest.Mocked<typeof UserModel>;
const mockedCoachClientModel = CoachClientModel as jest.Mocked<typeof CoachClientModel>;
const mockedWorkoutPlanModel = WorkoutPlanModel as jest.Mocked<typeof WorkoutPlanModel>;
const mockedAssignedWorkoutPlanModel = AssignedWorkoutPlanModel as jest.Mocked<typeof AssignedWorkoutPlanModel>;
const repo = new CoachRepository();

function buildQueryChain(resolvedValue: any) {
    return {
        populate: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(resolvedValue)
    };
}

function buildCountChain(resolvedValue: number) {
    return { exec: jest.fn().mockResolvedValue(resolvedValue) };
}

describe("CoachRepository", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("getAthletes returns users and total from active coach-client relationships", async () => {
        const coachClients: any = [
            {
                athleteId: { _id: "a1", name: "Athlete One", email: "a1@test.com", level: 5 },
                status: "active",
                hiredAt: new Date("2024-01-01")
            }
        ];
        mockedCoachClientModel.countDocuments.mockReturnValue(buildCountChain(1) as any);
        mockedCoachClientModel.find.mockReturnValue(buildQueryChain(coachClients) as any);

        const result = await repo.getAthletes("coach1", 1, 10);

        expect(mockedCoachClientModel.countDocuments).toHaveBeenCalledWith({ coachId: "coach1", status: "active" });
        expect(mockedCoachClientModel.find).toHaveBeenCalledWith({ coachId: "coach1", status: "active" });
        expect(result.total).toBe(1);
        expect(result.users.length).toBe(1);
        expect(result.users[0]._id).toBe("a1");
        expect((result.users[0] as any).coachClient.status).toBe("active");
    });

    test("getAthleteById returns user", async () => {
        const user: any = { _id: "a1", name: "Athlete One" };
        const chain = { exec: jest.fn().mockResolvedValue(user) };
        mockedUserModel.findById.mockReturnValue(chain as any);

        const result = await repo.getAthleteById("a1");

        expect(mockedUserModel.findById).toHaveBeenCalledWith("a1");
        expect(result).toEqual(user);
    });

    test("getDashboardStats returns aggregated stats", async () => {
        mockedCoachClientModel.countDocuments.mockReturnValue(buildCountChain(5) as any);
        mockedWorkoutPlanModel.countDocuments
            .mockReturnValueOnce(buildCountChain(3) as any)
            .mockReturnValueOnce(buildCountChain(2) as any);
        mockedAssignedWorkoutPlanModel.countDocuments
            .mockReturnValueOnce(buildCountChain(4) as any)
            .mockReturnValueOnce(buildCountChain(1) as any);
        mockedCoachClientModel.find.mockReturnValue(buildQueryChain([]) as any);

        const result = await repo.getDashboardStats("coach1");

        expect(result).toEqual({
            totalAthletes: 5,
            totalWorkoutPlans: 3,
            publishedPlans: 2,
            assignedPlans: 4,
            totalCompletedWorkouts: 1,
            averageAthleteLevel: 0
        });
    });

    test("getAnalyticsOverview returns overview with zeroed revenue and activities", async () => {
        mockedCoachClientModel.countDocuments.mockReturnValue(buildCountChain(0) as any);
        mockedWorkoutPlanModel.countDocuments.mockReturnValue(buildCountChain(0) as any);
        mockedAssignedWorkoutPlanModel.countDocuments.mockReturnValue(buildCountChain(0) as any);
        mockedUserModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue({ coachProfile: { hireCost: 100 } }) } as any);
        mockedCoachClientModel.find.mockReturnValue(buildQueryChain([]) as any);
        mockedWorkoutPlanModel.find.mockReturnValue(buildQueryChain([]) as any);
        mockedAssignedWorkoutPlanModel.find.mockReturnValue(buildQueryChain([]) as any);

        const result = await repo.getAnalyticsOverview("507f1f77bcf86cd799439099");

        expect(result.totalAthletes).toBe(0);
        expect(result.activeAthletes).toBe(0);
        expect(result.totalRevenue).toBe(0);
        expect(result.averageAthleteLevel).toBe(0);
        expect(result.recentActivities).toEqual([]);
    });

    test("getAnalyticsAthletes returns empty array when no clients or assignments", async () => {
        mockedCoachClientModel.find.mockReturnValue(buildQueryChain([]) as any);
        mockedAssignedWorkoutPlanModel.aggregate.mockResolvedValue([]);

        const result = await repo.getAnalyticsAthletes("507f1f77bcf86cd799439099");

        expect(result).toEqual([]);
    });
});
