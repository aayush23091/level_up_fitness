/// <reference types="jest" />
import { UserMongoRepository, IUserRepository } from "../../../repositories/user.repository";
import { UserModel } from "../../../models/user.model";

jest.mock("../../../models/user.model", () => {
    return {
        UserModel: {
            findOne: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            findByIdAndDelete: jest.fn()
        }
    };
});

const mockedUserModel = UserModel as jest.Mocked<typeof UserModel>;

const repo: IUserRepository = new UserMongoRepository();

const mockUser: any = {
    _id: "507f1f77bcf86cd799439011",
    name: "Test User",
    username: "testuser",
    email: "test@example.com",
    password: "hashedpassword",
    phoneNumber: "1234567890",
    gender: "male",
    role: "user",
    resetPasswordToken: "reset-token-123"
};

describe("UserRepository", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("getUserById returns user when found", async () => {
        mockedUserModel.findOne.mockResolvedValue(mockUser);

        const result = await repo.getUserById("507f1f77bcf86cd799439011");

        expect(mockedUserModel.findOne).toHaveBeenCalledWith({
            _id: "507f1f77bcf86cd799439011"
        });
        expect(result).toEqual(mockUser);
    });

    test("getUserById returns null when no user exists", async () => {
        mockedUserModel.findOne.mockResolvedValue(null);

        const result = await repo.getUserById("507f1f77bcf86cd799439011");

        expect(mockedUserModel.findOne).toHaveBeenCalledWith({
            _id: "507f1f77bcf86cd799439011"
        });
        expect(result).toBeNull();
    });

    test("getUserByEmail returns correct user", async () => {
        mockedUserModel.findOne.mockResolvedValue(mockUser);

        const result = await repo.getUserByEmail("test@example.com");

        expect(mockedUserModel.findOne).toHaveBeenCalledWith({
            email: "test@example.com"
        });
        expect(result).toEqual(mockUser);
    });

    test("getUserByUsername returns correct user", async () => {
        mockedUserModel.findOne.mockResolvedValue(mockUser);

        const result = await repo.getUserByUsername("testuser");

        expect(mockedUserModel.findOne).toHaveBeenCalledWith({
            username: "testuser"
        });
        expect(result).toEqual(mockUser);
    });

    test("getUserByResetPasswordToken returns user", async () => {
        mockedUserModel.findOne.mockResolvedValue(mockUser);

        const result = await repo.getUserByResetPasswordToken("reset-token-123");

        expect(mockedUserModel.findOne).toHaveBeenCalledWith({
            resetPasswordToken: "reset-token-123"
        });
        expect(result).toEqual(mockUser);
    });

    test("createUser calls UserModel.create and returns created user", async () => {
        mockedUserModel.create.mockResolvedValue(mockUser);

        const input: Partial<any> = {
            name: "Test User",
            email: "test@example.com"
        };
        const result = await repo.createUser(input);

        expect(mockedUserModel.create).toHaveBeenCalledWith(input);
        expect(result).toEqual(mockUser);
    });

    test("update returns updated user", async () => {
        const updatedUser = { ...mockUser, name: "Updated Name" };
        mockedUserModel.findByIdAndUpdate.mockResolvedValue(updatedUser);

        const updateData: Partial<any> = { name: "Updated Name" };
        const result = await repo.update("507f1f77bcf86cd799439011", updateData);

        expect(mockedUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
            "507f1f77bcf86cd799439011",
            updateData,
            { new: true }
        );
        expect(result).toEqual(updatedUser);
    });

    test("delete returns true when document deleted", async () => {
        mockedUserModel.findByIdAndDelete.mockResolvedValue(mockUser);

        const result = await repo.delete("507f1f77bcf86cd799439011");

        expect(mockedUserModel.findByIdAndDelete).toHaveBeenCalledWith(
            "507f1f77bcf86cd799439011"
        );
        expect(result).toBe(true);
    });

    test("delete returns false when document does not exist", async () => {
        mockedUserModel.findByIdAndDelete.mockResolvedValue(null);

        const result = await repo.delete("507f1f77bcf86cd799439011");

        expect(mockedUserModel.findByIdAndDelete).toHaveBeenCalledWith(
            "507f1f77bcf86cd799439011"
        );
        expect(result).toBe(false);
    });

    test("getAll returns users array", async () => {
        const userTwo: any = { ...mockUser, _id: "507f1f77bcf86cd799439012", email: "two@example.com" };
        mockedUserModel.find.mockResolvedValue([mockUser, userTwo]);

        const result = await repo.getAll();

        expect(mockedUserModel.find).toHaveBeenCalledTimes(1);
        expect(result).toEqual([mockUser, userTwo]);
        expect(result.length).toBe(2);
    });
});
