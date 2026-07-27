import request from "supertest";
import app from "../../app";

describe("App", () => {
    it("should return 404 for an invalid route", async () => {
        const response = await request(app).get("/invalid-route");

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("API not found");
    });
});
