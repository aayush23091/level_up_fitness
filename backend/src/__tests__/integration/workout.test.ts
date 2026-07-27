import request from "supertest";
import app from "../../app";

// ─────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────

async function registerAndLogin(payload: Record<string, any>): Promise<string> {
    await request(app).post("/api/v1/auth/register").send(payload);
    const loginRes = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: payload.email, password: payload.password });
    return loginRes.body.data.token;
}

async function createNormalUser(): Promise<string> {
    return registerAndLogin({
        name: "Normal User",
        username: "normaluser",
        email: "normal@test.com",
        password: "password123",
        phoneNumber: "9800000000",
        gender: "male",
        role: "user",
    });
}

async function createCoach(): Promise<string> {
    return registerAndLogin({
        name: "Coach User",
        username: "coachuser",
        email: "coach@test.com",
        password: "password123",
        phoneNumber: "9800000001",
        gender: "male",
        role: "coach",
    });
}

async function createAdmin(): Promise<string> {
    return registerAndLogin({
        name: "Admin User",
        username: "adminuser",
        email: "admin@test.com",
        password: "password123",
        phoneNumber: "9800000002",
        gender: "male",
        role: "admin",
    });
}

// Valid workout payload (thumbnail required by schema)
const validWorkout = {
    title: "Push Workout",
    description: "Chest and shoulders workout",
    category: "Strength",
    difficulty: "Beginner",
    duration: 60,
    xpReward: 20,
    coinReward: 10,
    thumbnail: "https://example.com/push.jpg",
};

// Valid exercise payload
const validExercise = {
    name: "Bench Press",
    category: "Strength",
    bodyPart: "Chest",
    equipment: "Barbell",
    difficulty: "Beginner",
    description: "Lie on a bench and press the barbell up",
    instructions: "Lower the bar to your chest then press back up",
    thumbnail: "https://example.com/bench.jpg",
};

async function createWorkoutAsCoach(coachToken: string): Promise<any> {
    const res = await request(app)
        .post("/api/v1/workouts")
        .set("Authorization", `Bearer ${coachToken}`)
        .send(validWorkout);
    return res.body.data;
}

async function createExerciseAsAdmin(adminToken: string): Promise<any> {
    const res = await request(app)
        .post("/api/v1/exercises")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(validExercise);
    return res.body.data;
}

// ─────────────────────────────────────────────
// WORKOUT AND EXERCISE INTEGRATION TESTS
// ─────────────────────────────────────────────

describe("Workout and Exercise API", () => {
    // ─────────────────────────────────────────
    // WORKOUT TESTS
    // ─────────────────────────────────────────

    // 1
    test("GET /api/v1/workouts with authenticated user", async () => {
        const token = await createNormalUser();

        const res = await request(app)
            .get("/api/v1/workouts")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.meta).toBeDefined();
    });

    // 2
    test("GET /api/v1/workouts without token", async () => {
        const res = await request(app).get("/api/v1/workouts");

        expect(res.status).toBe(401);
    });

    // 3
    test("POST /api/v1/workouts as coach", async () => {
        const coachToken = await createCoach();

        const res = await request(app)
            .post("/api/v1/workouts")
            .set("Authorization", `Bearer ${coachToken}`)
            .send(validWorkout);

        expect(res.status).toBe(201);
        expect(res.body.data).toBeDefined();
        expect(res.body.data.createdBy).toBeDefined();
    });

    // 4
    test("POST /api/v1/workouts as normal user", async () => {
        const userToken = await createNormalUser();

        const res = await request(app)
            .post("/api/v1/workouts")
            .set("Authorization", `Bearer ${userToken}`)
            .send(validWorkout);

        expect(res.status).toBe(403);
    });

    // 5
    test("POST /api/v1/workouts invalid payload", async () => {
        const coachToken = await createCoach();

        const res = await request(app)
            .post("/api/v1/workouts")
            .set("Authorization", `Bearer ${coachToken}`)
            .send({ title: "x" });

        expect(res.status).toBe(400);
    });

    // 6
    test("GET /api/v1/workouts/:id", async () => {
        const coachToken = await createCoach();
        const created = await createWorkoutAsCoach(coachToken);

        const res = await request(app)
            .get(`/api/v1/workouts/${created._id}`)
            .set("Authorization", `Bearer ${coachToken}`);

        expect(res.status).toBe(200);
        expect(res.body.data._id).toBe(created._id);
        expect(res.body.data.title).toBe(validWorkout.title);
    });

    // 7
    test("PUT /api/v1/workouts/:id as owner coach", async () => {
        const coachToken = await createCoach();
        const created = await createWorkoutAsCoach(coachToken);

        const res = await request(app)
            .put(`/api/v1/workouts/${created._id}`)
            .set("Authorization", `Bearer ${coachToken}`)
            .send({
                title: "Updated Push Workout",
                description: "Updated chest and shoulders workout",
                category: "Strength",
                difficulty: "Intermediate",
                duration: 45,
                xpReward: 25,
                coinReward: 12,
                thumbnail: "https://example.com/push-updated.jpg",
            });

        expect(res.status).toBe(200);
        expect(res.body.data.title).toBe("Updated Push Workout");
        expect(res.body.data.difficulty).toBe("Intermediate");
    });

    // 8
    test("PUT /api/v1/workouts/:id as normal user", async () => {
        const coachToken = await createCoach();
        const userToken = await createNormalUser();
        const created = await createWorkoutAsCoach(coachToken);

        const res = await request(app)
            .put(`/api/v1/workouts/${created._id}`)
            .set("Authorization", `Bearer ${userToken}`)
            .send({ title: "Hacked Workout" });

        expect(res.status).toBe(403);
    });

    // 9
    test("DELETE /api/v1/workouts/:id as owner coach", async () => {
        const coachToken = await createCoach();
        const created = await createWorkoutAsCoach(coachToken);

        const res = await request(app)
            .delete(`/api/v1/workouts/${created._id}`)
            .set("Authorization", `Bearer ${coachToken}`);

        expect(res.status).toBe(200);
    });

    // 10
    test("GET invalid workout id", async () => {
        const token = await createNormalUser();

        const res = await request(app)
            .get("/api/v1/workouts/not-a-valid-id")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).not.toBe(200);
        expect(res.body.success).toBe(false);
    });

    // ─────────────────────────────────────────
    // EXERCISE TESTS
    // ─────────────────────────────────────────

    // 11
    test("POST /api/v1/exercises as admin", async () => {
        const adminToken = await createAdmin();

        const res = await request(app)
            .post("/api/v1/exercises")
            .set("Authorization", `Bearer ${adminToken}`)
            .send(validExercise);

        expect(res.status).toBe(201);
        expect(res.body.data).toBeDefined();
        expect(res.body.data.name).toBe(validExercise.name);
    });

    // 12
    test("POST /api/v1/exercises as coach", async () => {
        const coachToken = await createCoach();

        const res = await request(app)
            .post("/api/v1/exercises")
            .set("Authorization", `Bearer ${coachToken}`)
            .send(validExercise);

        expect(res.status).toBe(403);
    });

    // 13
    test("GET /api/v1/exercises as admin", async () => {
        const adminToken = await createAdmin();
        await createExerciseAsAdmin(adminToken);

        const res = await request(app)
            .get("/api/v1/exercises")
            .set("Authorization", `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.meta).toBeDefined();
    });

    // 14
    test("PUT /api/v1/exercises/:id as admin", async () => {
        const adminToken = await createAdmin();
        const created = await createExerciseAsAdmin(adminToken);

        const res = await request(app)
            .put(`/api/v1/exercises/${created._id}`)
            .set("Authorization", `Bearer ${adminToken}`)
            .send({
                name: "Incline Bench Press",
                description: "Incline variation of the bench press",
                instructions: "Set bench to incline and press the barbell",
            });

        expect(res.status).toBe(200);
        expect(res.body.data.name).toBe("Incline Bench Press");
    });

    // 15
    test("DELETE /api/v1/exercises/:id as admin", async () => {
        const adminToken = await createAdmin();
        const created = await createExerciseAsAdmin(adminToken);

        const res = await request(app)
            .delete(`/api/v1/exercises/${created._id}`)
            .set("Authorization", `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
    });

    // ─────────────────────────────────────────
    // WORKOUT COMPLETION TESTS
    // ─────────────────────────────────────────

    // 16
    test("POST /api/v1/users/workouts/:id/complete", async () => {
        const userToken = await createNormalUser();
        const coachToken = await createCoach();
        const workout = await createWorkoutAsCoach(coachToken);

        const res = await request(app)
            .post(`/api/v1/user/workouts/${workout._id}/complete`)
            .set("Authorization", `Bearer ${userToken}`)
            .send({ duration: 45 });

        expect(res.status).toBe(200);
        expect(res.body.data).toBeDefined();
        expect(res.body.data.xpEarned).toBe(validWorkout.xpReward);
        expect(res.body.data.coinsEarned).toBe(validWorkout.coinReward);
        expect(res.body.data.newXp).toBe(validWorkout.xpReward);
        expect(res.body.data.newCoins).toBe(validWorkout.coinReward);
    });

    // 17
    test("POST completion without duration", async () => {
        const userToken = await createNormalUser();
        const coachToken = await createCoach();
        const workout = await createWorkoutAsCoach(coachToken);

        const res = await request(app)
            .post(`/api/v1/user/workouts/${workout._id}/complete`)
            .set("Authorization", `Bearer ${userToken}`)
            .send({});

        expect(res.status).toBe(400);
    });

    // 18
    test("GET /api/v1/users/workout-completions", async () => {
        const userToken = await createNormalUser();
        const coachToken = await createCoach();
        const workout = await createWorkoutAsCoach(coachToken);

        await request(app)
            .post(`/api/v1/users/workouts/${workout._id}/complete`)
            .set("Authorization", `Bearer ${userToken}`)
            .send({ duration: 45 });

        const res = await request(app)
            .get("/api/v1/user/workout-completions")
            .set("Authorization", `Bearer ${userToken}`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
    });
});
