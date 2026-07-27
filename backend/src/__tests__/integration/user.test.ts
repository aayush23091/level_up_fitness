import request from "supertest";
import app from "../../app";

jest.mock("../../middlewares/upload.middleware", () => ({
    __esModule: true,
    profileUploadMiddleware: jest.fn((req: any, res: any, next: any) => next()),
    avatarUploadMiddleware: jest.fn((req: any, res: any, next: any) => next()),
    workoutCoverUploadMiddleware: jest.fn((req: any, res: any, next: any) => next()),
    workoutThumbnailUploadMiddleware: jest.fn((req: any, res: any, next: any) => next()),
    coachProfileUploadMiddleware: jest.fn((req: any, res: any, next: any) => next()),
}));

describe("User API", () => {
    const baseUser = {
        name: "Test User",
        username: "testuser",
        email: "test@example.com",
        password: "password123",
        phoneNumber: "9800000000",
        gender: "male",
    };

    const registerAndLogin = async (): Promise<string> => {
        await request(app).post("/api/auth/register").send(baseUser);
        const response = await request(app)
            .post("/api/auth/login")
            .send({ email: baseUser.email, password: baseUser.password });

        return response.body.data.token;
    };

    describe("Profile Tests", () => {
        test("GET /api/auth/whoami with valid token", async () => {
            const token = await registerAndLogin();

            const response = await request(app)
                .get("/api/auth/whoami")
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty("_id");
            expect(response.body.data.email).toBe(baseUser.email);
        });

        test("GET /api/auth/whoami without token", async () => {
            const response = await request(app).get("/api/auth/whoami");

            expect(response.status).toBe(401);
        });
    });

    describe("Update Profile Tests", () => {
        test("PUT /api/auth/update should update user basic information", async () => {
            const token = await registerAndLogin();

            const response = await request(app)
                .put("/api/auth/update")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    name: "Updated User",
                    phoneNumber: "9811111111",
                    gender: "male",
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.name).toBe("Updated User");
            expect(response.body.data.phoneNumber).toBe("9811111111");
        });

        test("PUT /api/auth/update should update fitness measurements", async () => {
            const token = await registerAndLogin();

            const response = await request(app)
                .put("/api/auth/update")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    height: "68",
                    weight: "75",
                    chest: "43",
                    waist: "32",
                    arms: "16",
                    shoulders: "50",
                    legs: "25",
                    calves: "15",
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.height).toBe(68);
            expect(response.body.data.weight).toBe(75);
            expect(response.body.data.chest).toBe(43);
            expect(response.body.data.waist).toBe(32);
            expect(response.body.data.arms).toBe(16);
            expect(response.body.data.shoulders).toBe(50);
            expect(response.body.data.legs).toBe(25);
            expect(response.body.data.calves).toBe(15);
        });

        test("PUT /api/auth/update should reject username conflict", async () => {
            const token1 = await registerAndLogin();

            await request(app).post("/api/auth/register").send({
                ...baseUser,
                username: "seconduser",
                email: "second@example.com",
            });

            const response = await request(app)
                .put("/api/auth/update")
                .set("Authorization", `Bearer ${token1}`)
                .send({ username: "seconduser" });

            expect(response.status).toBe(400);
        });
    });

    describe("Dashboard / Analytics Tests", () => {
        test("GET /api/users/dashboard with valid token", async () => {
            const token = await registerAndLogin();

            const response = await request(app)
                .get("/api/users/dashboard")
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty("user");
            expect(response.body.data).toHaveProperty("streak");
            expect(response.body.data).toHaveProperty("workouts");
        });

        test("GET /api/users/dashboard without token", async () => {
            const response = await request(app).get("/api/users/dashboard");

            expect(response.status).toBe(401);
        });

        test("GET /api/users/analytics with valid token", async () => {
            const token = await registerAndLogin();

            const response = await request(app)
                .get("/api/users/analytics")
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
        });
    });

    describe("Streak / Achievements", () => {
        test("GET /api/users/streak with valid token", async () => {
            const token = await registerAndLogin();

            const response = await request(app)
                .get("/api/users/streak")
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.data).toHaveProperty("currentStreak");
            expect(response.body.data).toHaveProperty("longestStreak");
        });

        test("GET /api/users/achievements with valid token", async () => {
            const token = await registerAndLogin();

            const response = await request(app)
                .get("/api/users/achievements")
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body.data)).toBe(true);
        });
    });
});
