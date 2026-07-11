import request from "supertest";
import app from "../../app";

jest.mock("../../services/email.service", () => ({
    __esModule: true,
    default: jest.fn().mockResolvedValue(undefined)
}));

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

    // ─────────────────────────────────────────────
    // WHOAMI TESTS
    // ─────────────────────────────────────────────

    // 11
    test("should get current user information with valid JWT token", async () => {
        // Register user and extract token
        const registerResponse = await request(app)
            .post("/api/auth/register")
            .send(testUser);

        const token = registerResponse.body.data.token;

        // Request user info with valid token
        const response = await request(app)
            .get("/api/auth/whoami")
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty("_id");
        expect(response.body.data.email).toBe(testUser.email);
        expect(response.body.data.name).toBe(testUser.name);
    });

    // 12
    test("should reject whoami without authorization header", async () => {
        const response = await request(app)
            .get("/api/auth/whoami");

        expect(response.status).toBe(401);
    });

    // 13
    test("should reject whoami with invalid JWT token", async () => {
        const response = await request(app)
            .get("/api/auth/whoami")
            .set("Authorization", "Bearer invalidtoken");

        expect(response.status).toBe(401);
    });

    // ─────────────────────────────────────────────
    // CHANGE PASSWORD TESTS
    // ─────────────────────────────────────────────

    // 14
    test("should change password successfully", async () => {
        // Register user
        const registerResponse = await request(app)
            .post("/api/auth/register")
            .send(testUser);

        const token = registerResponse.body.data.token;

        // Change password
        const response = await request(app)
            .patch("/api/auth/change-password")
            .set("Authorization", `Bearer ${token}`)
            .send({
                currentPassword: "password123",
                newPassword: "newpassword123"
            });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);

        // Verify login with new password works
        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({ email: testUser.email, password: "newpassword123" });

        expect(loginResponse.status).toBe(200);
        expect(loginResponse.body.success).toBe(true);
        expect(loginResponse.body.data).toHaveProperty("token");
    });

    // 15
    test("should reject password change with wrong current password", async () => {
        // Register user
        const registerResponse = await request(app)
            .post("/api/auth/register")
            .send(testUser);

        const token = registerResponse.body.data.token;

        const response = await request(app)
            .patch("/api/auth/change-password")
            .set("Authorization", `Bearer ${token}`)
            .send({
                currentPassword: "wrongpassword",
                newPassword: "newpassword123"
            });

        expect(response.status).toBe(400);
        expect(response.body.message.toLowerCase()).toContain("current password is incorrect");
    });

    // 16
    test("should reject password change without authentication", async () => {
        const response = await request(app)
            .patch("/api/auth/change-password")
            .send({
                currentPassword: "password123",
                newPassword: "newpassword123"
            });

        expect(response.status).toBe(401);
    });

    // 17
    test("should reject short new password", async () => {
        // Register user
        const registerResponse = await request(app)
            .post("/api/auth/register")
            .send(testUser);

        const token = registerResponse.body.data.token;

        const response = await request(app)
            .patch("/api/auth/change-password")
            .set("Authorization", `Bearer ${token}`)
            .send({
                currentPassword: "password123",
                newPassword: "123"
            });

        expect(response.status).toBe(400);
    });

    // ─────────────────────────────────────────────
    // FORGOT PASSWORD TESTS
    // ─────────────────────────────────────────────

    // 18
    test("should request password reset successfully", async () => {
        // Register user
        await request(app).post("/api/auth/register").send(testUser);

        const response = await request(app)
            .post("/api/auth/forgot-password")
            .send({ email: testUser.email });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);

        // Verify database has reset tokens
        const UserModel = (await import("../../models/user.model")).UserModel;
        const userInDb = await UserModel.findOne({ email: testUser.email });
        expect(userInDb?.resetPasswordToken).toBeDefined();
        expect(userInDb?.resetPasswordExpires).toBeDefined();
    });

    // 19
    test("should fail forgot password for unknown email", async () => {
        const response = await request(app)
            .post("/api/auth/forgot-password")
            .send({ email: "unknown@example.com" });

        expect(response.status).toBe(404);
        expect(response.body.message.toLowerCase()).toContain("user not found");
    });
});
