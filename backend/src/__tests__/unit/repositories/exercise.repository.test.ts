/// <reference types="jest" />
import { ExerciseRepository } from "../../../repositories/exercise.repository";
import { ExerciseModel } from "../../../models/exercise.model";

jest.mock("../../../models/exercise.model", () => {
    return {
        ExerciseModel: {
            find: jest.fn(),
            findOne: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            findByIdAndDelete: jest.fn(),
            create: jest.fn(),
            countDocuments: jest.fn()
        }
    };
});

const mockedExerciseModel = ExerciseModel as jest.Mocked<typeof ExerciseModel>;
const repo = new ExerciseRepository();

function buildQueryChain(resolvedValue: any) {
    return {
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

describe("ExerciseRepository", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("getExercises returns paginated exercises and total with isActive filter", async () => {
        const exercises: any = [{ _id: "e1", name: "Push Up" }];
        const chain = buildQueryChain(exercises);
        mockedExerciseModel.find.mockReturnValue(chain as any);
        mockedExerciseModel.countDocuments.mockReturnValue(buildCountChain(1) as any);

        const result = await repo.getExercises(1, 10);

        expect(mockedExerciseModel.find).toHaveBeenCalledWith({ isActive: true });
        expect(mockedExerciseModel.countDocuments).toHaveBeenCalledWith({ isActive: true });
        expect(chain.skip).toHaveBeenCalledWith(0);
        expect(chain.limit).toHaveBeenCalledWith(10);
        expect(chain.sort).toHaveBeenCalledWith({ createdAt: -1 });
        expect(result).toEqual({ exercises, total: 1 });
    });

    test("getExercises applies search filter query", async () => {
        const exercises: any = [];
        const chain = buildQueryChain(exercises);
        mockedExerciseModel.find.mockReturnValue(chain as any);
        mockedExerciseModel.countDocuments.mockReturnValue(buildCountChain(0) as any);

        const result = await repo.getExercises(1, 10, "push");

        expect(mockedExerciseModel.find).toHaveBeenCalledWith(
            expect.objectContaining({ $or: expect.any(Array) })
        );
        expect(result).toEqual({ exercises, total: 0 });
    });

    test("getExerciseById returns exercise filtered by isActive", async () => {
        const exercise: any = { _id: "e1", name: "Push Up" };
        const chain = { exec: jest.fn().mockResolvedValue(exercise) };
        mockedExerciseModel.findOne.mockReturnValue(chain as any);

        const result = await repo.getExerciseById("e1");

        expect(mockedExerciseModel.findOne).toHaveBeenCalledWith({ _id: "e1", isActive: true });
        expect(result).toEqual(exercise);
    });

    test("createExercise calls ExerciseModel.create and returns created exercise", async () => {
        const created: any = { _id: "e1", name: "Push Up" };
        mockedExerciseModel.create.mockResolvedValue(created);

        const input: Partial<any> = { name: "Push Up" };
        const result = await repo.createExercise(input);

        expect(mockedExerciseModel.create).toHaveBeenCalledWith(input);
        expect(result).toEqual(created);
    });

    test("updateExercise returns updated exercise", async () => {
        const updated: any = { _id: "e1", name: "Pull Up" };
        const chain = { exec: jest.fn().mockResolvedValue(updated) };
        mockedExerciseModel.findByIdAndUpdate.mockReturnValue(chain as any);

        const updateData: Partial<any> = { name: "Pull Up" };
        const result = await repo.updateExercise("e1", updateData);

        expect(mockedExerciseModel.findByIdAndUpdate).toHaveBeenCalledWith("e1", updateData, { new: true });
        expect(result).toEqual(updated);
    });

    test("deleteExercise returns true when deleted", async () => {
        const chain = { exec: jest.fn().mockResolvedValue({ _id: "e1" }) };
        mockedExerciseModel.findByIdAndDelete.mockReturnValue(chain as any);

        const result = await repo.deleteExercise("e1");

        expect(mockedExerciseModel.findByIdAndDelete).toHaveBeenCalledWith("e1");
        expect(result).toBe(true);
    });

    test("deleteExercise returns false when not found", async () => {
        const chain = { exec: jest.fn().mockResolvedValue(null) };
        mockedExerciseModel.findByIdAndDelete.mockReturnValue(chain as any);

        const result = await repo.deleteExercise("e1");

        expect(result).toBe(false);
    });
});
