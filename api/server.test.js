// Write your tests here
const request = require("supertest");
const server = require("./server.js");
const db = require("../data/dbConfig.js");
const bcrypt = require("bcryptjs");
const jwtDecode = require("jwt-decode");

beforeAll(async () => {
  await db.migrate.rollback();
  await db.migrate.latest();
});
beforeEach(async () => {
  await db("users").truncate();
});
afterAll(async () => {
  await db.destroy();
});

test("sanity", () => {
  expect(true).toBe(true);
});
describe("[POST] /api/auth/register", () => {
  test("[1] Has the correct status and message on missing registration info", async () => {
    let res = await request(server)
      .post("/api/auth/register")
      .send({ password: "1234" });
    expect(res.body.message).toMatch(/username and password required/i);
    expect(res.status).toBe(422);
    res = await request(server)
      .post("/api/auth/register")
      .send({ username: "bob" });
    expect(res.body.message).toMatch(/username and password required/i);
    expect(res.status).toBe(422);
  }, 750);
});
