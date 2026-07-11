import request from "supertest";
import app from "../../app";

describe("Authentication API", () => {
    // Valid test user data reset before each test
    let testUser: {
        name: string;
        username: string;
        email: string;
        password: string;
        phoneNumber: string;
        gender: string;
    };

    beforeEach(() => {
        testUser = {
            name: "Test User",
            username: "testuser",
            email: "test@example.com",
            password: "password123",
            phoneNumber: "9800000000",
            gender: "male",
        };
    });

    // ─────────────────────────────────────────────
    // REGISTER TESTS
    // ─────────────────────────────────────────────

    // 1
    test("should register a user successfully", async () => {
        const response = await request(app)
            .post("/api/auth/register")
            .send(testUser);

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty("token");
        expect(response.body.data).toHaveProperty("user");
    });

    // 2
    test("should fail when email is missing", async () => {
        const { email, ...userWithoutEmail } = testUser;

        const response = await request(app)
            .post("/api/auth/register")
            .send(userWithoutEmail);

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBeDefined();
    });

    // 3
    test("should fail when password is missing", async () => {
        const { password, ...userWithoutPassword } = testUser;

        const response = await request(app)
            .post("/api/auth/register")
            .send(userWithoutPassword);

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
    });

    // 4
    test("should fail when username is missing", async () => {
        const { username, ...userWithoutUsername } = testUser;

        const response = await request(app)
            .post("/api/auth/register")
            .send(userWithoutUsername);

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
    });

    // 5
    test("should prevent duplicate email registration", async () => {
        // Create user
        await request(app).post("/api/auth/register").send(testUser);

        // Register same email again (different username to isolate email conflict)
        const response = await request(app)
            .post("/api/auth/register")
            .send({ ...testUser, username: "differentuser" });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message.toLowerCase()).toContain("email already exists");
    });

    // 6
    test("should prevent duplicate username registration", async () => {
        // Create first user
        await request(app).post("/api/auth/register").send(testUser);

        // Register second user with same username (different email)
        const response = await request(app)
            .post("/api/auth/register")
            .send({ ...testUser, email: "another@example.com" });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
    });

    // ─────────────────────────────────────────────
    // LOGIN TESTS
    // ─────────────────────────────────────────────

    // 7
    test("should login successfully", async () => {
        // Register user first
        await request(app).post("/api/auth/register").send(testUser);

        // Login with credentials
        const response = await request(app)
            .post("/api/auth/login")
            .send({ email: testUser.email, password: testUser.password });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty("token");
        expect(response.body.data.token).toBeDefined();
    });

    // 8
    test("should reject invalid email", async () => {
        // Register user first
        await request(app).post("/api/auth/register").send(testUser);

        const response = await request(app)
            .post("/api/auth/login")
            .send({ email: "wrong@example.com", password: testUser.password });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
    });

    // 9
    test("should reject incorrect password", async () => {
        // Register user
        await request(app).post("/api/auth/register").send(testUser);

        // Login wrong password
        const response = await request(app)
            .post("/api/auth/login")
            .send({ email: testUser.email, password: "wrongpassword" });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
    });

    // 10
    test("should reject missing login fields", async () => {
        const response = await request(app)
            .post("/api/auth/login")
            .send({});

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
    });
});
