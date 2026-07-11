import request from "supertest";
import app from "../../app";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserModel } from "../../models/user.model";
import { SECRET_KEY } from "../../configs/constant";

interface CreatedUser {
    user: any;
    token: string;
    password: string;
}

const generateToken = (user: any): string =>
    jwt.sign(
        { userId: user._id, email: user.email, role: user.role },
        SECRET_KEY,
        { expiresIn: "30d" }
    );

const createUser = async (overrides: Record<string, any> = {}): Promise<CreatedUser> => {
    const base = {
        name: "Test User",
        username: "testuser",
        email: "user@test.com",
        password: "password123",
        phoneNumber: "9800000000",
        gender: "male",
        role: "user",
        coins: 1000,
    };

    const password = overrides.password || base.password;
    const userData = { ...base, ...overrides, password: await bcrypt.hash(password, 10) };

    const user = await UserModel.create(userData);
    return { user, token: generateToken(user), password };
};

const createCoach = async (overrides: Record<string, any> = {}): Promise<CreatedUser> => {
    const base = {
        name: "Test Coach",
        username: "testcoach",
        email: "coach@test.com",
        password: "password123",
        phoneNumber: "9800000001",
        gender: "male",
        role: "coach",
        coachProfile: {
            bio: "Fitness coach",
            specialization: ["Strength"],
            experience: 5,
            hireCost: 100,
            availability: true,
        },
    };

    const password = overrides.password || base.password;
    const userData = { ...base, ...overrides, password: await bcrypt.hash(password, 10) };

    const user = await UserModel.create(userData);
    return { user, token: generateToken(user), password };
};

describe("Coach and Coach Hiring API", () => {
    // ─────────────────────────────────────────────
    // PUBLIC COACH HIRING ROUTES
    // ─────────────────────────────────────────────

    // 1
    test("GET /api/v1/coaches returns list of coaches (public)", async () => {
        await createCoach();

        const response = await request(app).get("/api/v1/coaches");

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.meta).toBeDefined();
    });

    // 2
    test("GET /api/v1/coaches/:id returns coach profile", async () => {
        const coach = await createCoach();

        const response = await request(app).get(`/api/v1/coaches/${coach.user._id}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.coachProfile).toBeDefined();
        expect(response.body.data.coachProfile.hireCost).toBeDefined();
        expect(response.body.data.coachProfile.availability).toBeDefined();
    });

    // 3
    test("GET /api/v1/coaches/:invalidId returns 404", async () => {
        const response = await request(app).get("/api/v1/coaches/invalidId");

        expect(response.status).toBe(404);
    });

    // ─────────────────────────────────────────────
    // COACH DASHBOARD ROUTES
    // ─────────────────────────────────────────────

    // 4
    test("GET /api/v1/coach/athletes with coach token returns athletes", async () => {
        const coach = await createCoach();

        const response = await request(app)
            .get("/api/v1/coach/athletes")
            .set("Authorization", `Bearer ${coach.token}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.meta).toBeDefined();
    });

    // 5
    test("GET /api/v1/coach/athletes without token returns 401", async () => {
        const response = await request(app).get("/api/v1/coach/athletes");

        expect(response.status).toBe(401);
    });

    // 6
    test("GET /api/v1/coach/athletes with normal user token returns 403", async () => {
        const user = await createUser();

        const response = await request(app)
            .get("/api/v1/coach/athletes")
            .set("Authorization", `Bearer ${user.token}`);

        expect(response.status).toBe(403);
    });

    // 7
    test("GET /api/v1/coach/dashboard/stats with coach token returns stats", async () => {
        const coach = await createCoach();

        const response = await request(app)
            .get("/api/v1/coach/dashboard/stats")
            .set("Authorization", `Bearer ${coach.token}`);

        expect(response.status).toBe(200);
        expect(response.body.data).toHaveProperty("totalAthletes");
        expect(response.body.data).toHaveProperty("totalWorkoutPlans");
        expect(response.body.data).toHaveProperty("publishedPlans");
    });

    // 8
    test("GET /api/v1/coach/analytics/overview with coach token returns overview", async () => {
        const coach = await createCoach();

        const response = await request(app)
            .get("/api/v1/coach/analytics/overview")
            .set("Authorization", `Bearer ${coach.token}`);

        expect(response.status).toBe(200);
        expect(response.body.data).toHaveProperty("totalRevenue");
        expect(response.body.data).toHaveProperty("recentActivities");
    });

    // 9
    test("GET /api/v1/coach/analytics/athletes with coach token returns array", async () => {
        const coach = await createCoach();

        const response = await request(app)
            .get("/api/v1/coach/analytics/athletes")
            .set("Authorization", `Bearer ${coach.token}`);

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body.data)).toBe(true);
    });

    // ─────────────────────────────────────────────
    // COACH HIRING
    // ─────────────────────────────────────────────

    // 10
    test("POST /api/v1/coaches/:coachId/hire successfully hires coach", async () => {
        const athlete = await createUser();
        const coach = await createCoach();

        const response = await request(app)
            .post(`/api/v1/coaches/${coach.user._id}/hire`)
            .set("Authorization", `Bearer ${athlete.token}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.remainingCoins).toBeDefined();
    });

    // 11
    test("POST /api/v1/coaches/:coachId/hire without token returns 401", async () => {
        const coach = await createCoach();

        const response = await request(app).post(`/api/v1/coaches/${coach.user._id}/hire`);

        expect(response.status).toBe(401);
    });

    // 12
    test("POST /api/v1/coaches/:coachId/hire with insufficient coins returns 400", async () => {
        const athlete = await createUser({ coins: 10 });
        const coach = await createCoach({ coachProfile: { hireCost: 100, availability: true } });

        const response = await request(app)
            .post(`/api/v1/coaches/${coach.user._id}/hire`)
            .set("Authorization", `Bearer ${athlete.token}`);

        expect(response.status).toBe(400);
        expect(response.body.message.toLowerCase()).toContain("insufficient coins");
    });

    // 13
    test("POST /api/v1/coaches/:coachId/hire duplicate hiring returns 400", async () => {
        const athlete = await createUser();
        const coach = await createCoach();

        await request(app)
            .post(`/api/v1/coaches/${coach.user._id}/hire`)
            .set("Authorization", `Bearer ${athlete.token}`);

        const response = await request(app)
            .post(`/api/v1/coaches/${coach.user._id}/hire`)
            .set("Authorization", `Bearer ${athlete.token}`);

        expect(response.status).toBe(400);
    });

    // 14
    test("POST /api/v1/coaches/:coachId/hire using coach account returns 403", async () => {
        const coachRequester = await createCoach({ email: "coach2@test.com", username: "testcoach2" });
        const coachTarget = await createCoach({ email: "coach3@test.com", username: "testcoach3" });

        const response = await request(app)
            .post(`/api/v1/coaches/${coachTarget.user._id}/hire`)
            .set("Authorization", `Bearer ${coachRequester.token}`);

        expect(response.status).toBe(403);
    });
});
