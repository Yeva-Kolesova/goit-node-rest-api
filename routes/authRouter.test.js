import mongoose from "mongoose";
import request from "supertest";
import "dotenv/config";

import app from "../app.js";

// import User from "../models/User.js";

const { TEST_DB_HOST, PORT = 4000 } = process.env;

describe("test /users/login", () => {
    let server = null;
    beforeAll(async () => {
        await mongoose.connect(TEST_DB_HOST);
        server = app.listen(PORT);
    });

    afterAll(async () => {
        await mongoose.connection.close();
        server.close();
    });

    //   beforeEach(()=> {})

    //   afterEach(async () => await User.deleteMany({}))

    test("test with correct data", async () => {
        const signinData = {
            email: "qwerty5@db.com",
            password: "12345",
        };

        const { statusCode, body } = await request(app)
            .post("/users/login")
            .send(signinData);
        expect(statusCode).toBe(200);
        expect(body.token).not.toBeNull();
        expect(Object.keys(body.user)).toHaveLength(2);
        expect(body.user.email).toEqual(expect.any(String));
        expect(body.user.subscription).toEqual(expect.any(String));
    });
});