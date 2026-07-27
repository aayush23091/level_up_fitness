/// <reference types="jest" />
import { WorkoutRepository } from "../../../repositories/workout.repository";
import { WorkoutModel } from "../../../models/workout.model";

jest.mock("../../../models/workout.model", () => {
    return {
        WorkoutModel: {
            find: jest.fn(),
            findById: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            findByIdAndDelete: jest.fn(),
            create: jest.fn(),
            countDocuments: jest.fn()
        }
    };
});

const mockedWorkoutModel = WorkoutModel as jest.Mocked<typeof WorkoutModel>;
const repo = new WorkoutRepository();

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
    return {
        exec: jest.fn().mockResolvedValue(resolvedValue)
    };
}

describe("WorkoutRepository", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("getWorkouts returns paginated workouts and total", async () => {
        const workouts: any = [{ _id: "w1", title: "Morning Workout" }];
        const chain = buildQueryChain(workouts);
        mockedWorkoutModel.find.mockReturnValue(chain as any);
        mockedWorkoutModel.countDocuments.mockReturnValue(buildCountChain(1) as any);

        const result = await repo.getWorkouts(1, 10);

        expect(mockedWorkoutModel.find).toHaveBeenCalledWith({});
        expect(mockedWorkoutModel.countDocuments).toHaveBeenCalledWith({});
        expect(chain.populate).toHaveBeenCalledWith("createdBy", "name username email role");
        expect(chain.skip).toHaveBeenCalledWith(0);
        expect(chain.limit).toHaveBeenCalledWith(10);
        expect(chain.sort).toHaveBeenCalledWith({ createdAt: -1 });
        expect(result).toEqual({ workouts, total: 1 });
    });

    test("getWorkouts applies search filter query", async () => {
        const workouts: any = [];
        const chain = buildQueryChain(workouts);
        mockedWorkoutModel.find.mockReturnValue(chain as any);
        mockedWorkoutModel.countDocuments.mockReturnValue(buildCountChain(0) as any);

        const result = await repo.getWorkouts(1, 10, "push");

        expect(mockedWorkoutModel.find).toHaveBeenCalledWith(
            expect.objectContaining({ $or: expect.any(Array) })
        );
        expect(result).toEqual({ workouts, total: 0 });
    });

    test("getWorkoutById returns populated workout", async () => {
        const workout: any = { _id: "w1", title: "Morning Workout" };
        const chain = { populate: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue(workout) };
        mockedWorkoutModel.findById.mockReturnValue(chain as any);

        const result = await repo.getWorkoutById("w1");

        expect(mockedWorkoutModel.findById).toHaveBeenCalledWith("w1");
        expect(chain.populate).toHaveBeenCalledWith("createdBy", "name username email role");
        expect(result).toEqual(workout);
    });

    test("createWorkout calls WorkoutModel.create and returns created workout", async () => {
        const created: any = { _id: "w1", title: "New Workout" };
        mockedWorkoutModel.create.mockResolvedValue(created);

        const input: Partial<any> = { title: "New Workout" };
        const result = await repo.createWorkout(input);

        expect(mockedWorkoutModel.create).toHaveBeenCalledWith(input);
        expect(result).toEqual(created);
    });

    test("updateWorkout returns updated workout", async () => {
        const updated: any = { _id: "w1", title: "Updated Workout" };
        const chain = { exec: jest.fn().mockResolvedValue(updated) };
        mockedWorkoutModel.findByIdAndUpdate.mockReturnValue(chain as any);

        const updateData: Partial<any> = { title: "Updated Workout" };
        const result = await repo.updateWorkout("w1", updateData);

        expect(mockedWorkoutModel.findByIdAndUpdate).toHaveBeenCalledWith("w1", updateData, { new: true });
        expect(result).toEqual(updated);
    });

    test("deleteWorkout returns true when deleted", async () => {
        const chain = { exec: jest.fn().mockResolvedValue({ _id: "w1" }) };
        mockedWorkoutModel.findByIdAndDelete.mockReturnValue(chain as any);

        const result = await repo.deleteWorkout("w1");

        expect(mockedWorkoutModel.findByIdAndDelete).toHaveBeenCalledWith("w1");
        expect(result).toBe(true);
    });

    test("deleteWorkout returns false when not found", async () => {
        const chain = { exec: jest.fn().mockResolvedValue(null) };
        mockedWorkoutModel.findByIdAndDelete.mockReturnValue(chain as any);

        const result = await repo.deleteWorkout("w1");

        expect(result).toBe(false);
    });
});
