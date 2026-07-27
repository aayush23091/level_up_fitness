/// <reference types="jest" />
import { WorkoutCompletionRepository } from "../../../repositories/workoutCompletion.repository";
import { WorkoutCompletionModel } from "../../../models/workoutCompletion.model";

jest.mock("../../../models/workoutCompletion.model", () => {
    return {
        WorkoutCompletionModel: {
            create: jest.fn(),
            findById: jest.fn(),
            find: jest.fn()
        }
    };
});

const mockedWorkoutCompletionModel = WorkoutCompletionModel as jest.Mocked<typeof WorkoutCompletionModel>;
const repo = new WorkoutCompletionRepository();

function buildQueryChain(resolvedValue: any) {
    return {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(resolvedValue)
    };
}

describe("WorkoutCompletionRepository", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("createWorkoutCompletion calls WorkoutCompletionModel.create and returns created completion", async () => {
        const created: any = { _id: "wc1", userId: "u1", workoutId: "w1" };
        mockedWorkoutCompletionModel.create.mockResolvedValue(created);

        const input: Partial<any> = { userId: "u1", workoutId: "w1" };
        const result = await repo.createWorkoutCompletion(input);

        expect(mockedWorkoutCompletionModel.create).toHaveBeenCalledWith(input);
        expect(result).toEqual(created);
    });

    test("getWorkoutCompletionById returns populated completion", async () => {
        const completion: any = { _id: "wc1", userId: "u1" };
        const chain = { populate: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue(completion) };
        mockedWorkoutCompletionModel.findById.mockReturnValue(chain as any);

        const result = await repo.getWorkoutCompletionById("wc1");

        expect(mockedWorkoutCompletionModel.findById).toHaveBeenCalledWith("wc1");
        expect(chain.populate).toHaveBeenCalledWith("userId", "name username email role level xp coins");
        expect(chain.populate).toHaveBeenCalledWith("workoutId", "title description category difficulty duration");
        expect(result).toEqual(completion);
    });

    test("getWorkoutCompletionsByUserId returns completions sorted by completedAt", async () => {
        const completions: any = [{ _id: "wc1", userId: "u1" }];
        const chain = buildQueryChain(completions);
        mockedWorkoutCompletionModel.find.mockReturnValue(chain as any);

        const result = await repo.getWorkoutCompletionsByUserId("u1");

        expect(mockedWorkoutCompletionModel.find).toHaveBeenCalledWith({ userId: "u1" });
        expect(chain.populate).toHaveBeenCalledWith("workoutId", "title description category difficulty duration");
        expect(chain.sort).toHaveBeenCalledWith({ completedAt: -1 });
        expect(result).toEqual(completions);
    });
});
