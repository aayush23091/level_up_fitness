/// <reference types="jest" />
import { CoachHiringRepository } from "../../../repositories/coachHiring.repository";
import { UserModel } from "../../../models/user.model";
import { CoachClientModel } from "../../../models/coachClient.model";
import { CoachProfileModel } from "../../../models/coachProfile.model";

jest.mock("../../../models/user.model", () => {
    return {
        UserModel: {
            findById: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            countDocuments: jest.fn()
        }
    };
});
jest.mock("../../../models/coachClient.model", () => {
    return { CoachClientModel: { create: jest.fn(), findOne: jest.fn() } };
});
jest.mock("../../../models/coachProfile.model", () => {
    return { CoachProfileModel: {} };
});

const mockedUserModel = UserModel as jest.Mocked<typeof UserModel>;
const mockedCoachClientModel = CoachClientModel as jest.Mocked<typeof CoachClientModel>;
const repo = new CoachHiringRepository();

function buildQueryChain(resolvedValue: any) {
    return {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(resolvedValue)
    };
}

function buildCountChain(resolvedValue: number) {
    return { exec: jest.fn().mockResolvedValue(resolvedValue) };
}

describe("CoachHiringRepository", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("getAllCoaches returns coaches and total filtered by role coach", async () => {
        const coaches: any = [{ _id: "c1", name: "Coach One", role: "coach" }];
        mockedUserModel.find.mockReturnValue(buildQueryChain(coaches) as any);
        mockedUserModel.countDocuments.mockReturnValue(buildCountChain(1) as any);

        const result = await repo.getAllCoaches(1, 10);

        expect(mockedUserModel.find).toHaveBeenCalledWith({ role: "coach" });
        expect(mockedUserModel.countDocuments).toHaveBeenCalledWith({ role: "coach" });
        expect(result).toEqual({ coaches, total: 1 });
    });

    test("getCoachById returns coach by id and role", async () => {
        const coach: any = { _id: "c1", role: "coach" };
        const chain = { exec: jest.fn().mockResolvedValue(coach) };
        mockedUserModel.findOne.mockReturnValue(chain as any);

        const result = await repo.getCoachById("c1");

        expect(mockedUserModel.findOne).toHaveBeenCalledWith({ _id: "c1", role: "coach" });
        expect(result).toEqual(coach);
    });

    test("getCoachByUserId returns coach by id and role", async () => {
        const coach: any = { _id: "c1", role: "coach" };
        const chain = { exec: jest.fn().mockResolvedValue(coach) };
        mockedUserModel.findOne.mockReturnValue(chain as any);

        const result = await repo.getCoachByUserId("c1");

        expect(mockedUserModel.findOne).toHaveBeenCalledWith({ _id: "c1", role: "coach" });
        expect(result).toEqual(coach);
    });

    test("createCoachClient calls CoachClientModel.create with active status", async () => {
        const created: any = { coachId: "c1", athleteId: "a1", status: "active" };
        mockedCoachClientModel.create.mockResolvedValue(created);

        const result = await repo.createCoachClient("c1", "a1", "txn1");

        expect(mockedCoachClientModel.create).toHaveBeenCalledWith({
            coachId: "c1",
            athleteId: "a1",
            transactionId: "txn1",
            hiredAt: expect.any(Date),
            status: "active"
        });
        expect(result).toEqual(created);
    });

    test("getCoachClientRelationship returns active relationship", async () => {
        const relationship: any = { coachId: "c1", athleteId: "a1", status: "active" };
        const chain = { exec: jest.fn().mockResolvedValue(relationship) };
        mockedCoachClientModel.findOne.mockReturnValue(chain as any);

        const result = await repo.getCoachClientRelationship("c1", "a1");

        expect(mockedCoachClientModel.findOne).toHaveBeenCalledWith({
            coachId: "c1",
            athleteId: "a1",
            status: "active"
        });
        expect(result).toEqual(relationship);
    });

    test("getUserById returns user", async () => {
        const user: any = { _id: "u1", name: "User One" };
        const chain = { exec: jest.fn().mockResolvedValue(user) };
        mockedUserModel.findById.mockReturnValue(chain as any);

        const result = await repo.getUserById("u1");

        expect(mockedUserModel.findById).toHaveBeenCalledWith("u1");
        expect(result).toEqual(user);
    });

    test("updateUserCoins calls findByIdAndUpdate with coins", async () => {
        const updated: any = { _id: "u1", coins: 50 };
        const chain = { exec: jest.fn().mockResolvedValue(updated) };
        mockedUserModel.findByIdAndUpdate.mockReturnValue(chain as any);

        const result = await repo.updateUserCoins("u1", 50);

        expect(mockedUserModel.findByIdAndUpdate).toHaveBeenCalledWith("u1", { coins: 50 }, { new: true });
        expect(result).toEqual(updated);
    });

    test("incrementCoachTotalClients returns coach by id", async () => {
        const coach: any = { _id: "c1", role: "coach" };
        const chain = { exec: jest.fn().mockResolvedValue(coach) };
        mockedUserModel.findById.mockReturnValue(chain as any);

        const result = await repo.incrementCoachTotalClients("c1");

        expect(mockedUserModel.findById).toHaveBeenCalledWith("c1");
        expect(result).toEqual(coach);
    });
});
