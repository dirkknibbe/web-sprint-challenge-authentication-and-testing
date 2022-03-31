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
  });
  test("[2] Saves the user with a bcrypted password instead of plain text", async () => {
    await request(server)
      .post("/api/auth/register")
      .send({ username: "doopy", password: "1234" });
    const doopy = await db("users").where("username", "doopy").first();
    expect(bcrypt.compareSync("1234", doopy.password)).toBeTruthy();
  });
  test("[3] Has the correct user object structure", async () => {
    const res = await request(server)
      .post("/api/auth/register")
      .send({ username: "doopy", password: "1234" });
    const doopy = await db("users").where("username", "doopy").first();
    expect(res.body).toMatchObject({
      id: 1,
      username: "doopy",
      password: doopy.password,
    });
  });
});
describe("[POST] /api/auth/login", () => {
  test("[4] Has the correct messages on missing username or password", async () => {
    let res = await request(server)
      .post("/api/auth/login")
      .send({ password: "1234" });
    expect(res.body.message).toMatch(/username and password required/i);
    expect(res.status).toBe(422);
    res = await request(server)
      .post("/api/auth/login")
      .send({ username: "doopy" });
    expect(res.body.message).toMatch(/username and password required/i);
    expect(res.status).toBe(422);
  });
  test("[5] Has a token with correct structure: { subject, username, iat, exp }", async () => {
    //register doopy
    await request(server)
      .post("/api/auth/register")
      .send({ username: "doopy", password: "1234" });

    //login with doopy
    let res = await request(server)
      .post("/api/auth/login")
      .send({ username: "doopy", password: "1234" });

    //check doopy's token structure
    let decoded = jwtDecode(res.body.token);
    expect(decoded).toHaveProperty("iat");
    expect(decoded).toHaveProperty("exp");
    expect(decoded).toMatchObject({
      subject: 1,
      username: "doopy",
    });
  });
});
describe("[GET] /api/jokes", () => {
  test("[6] Requests with a valid token obtain the jokes", async () => {
    //register the user
    await request(server)
      .post("/api/auth/register")
      .send({ username: "doopy", password: "1234" });

    //login the user
    let res = await request(server)
      .post("/api/auth/login")
      .send({ username: "doopy", password: "1234" });

    // get request the jokes with token
    res = await request(server)
      .get("/api/jokes")
      .set("Authorization", res.body.token);
    expect(res.body).toEqual([
      {
        id: "0189hNRf2g",
        joke: "I'm tired of following my dreams. I'm just going to ask them where they are going and meet up with them later.",
      },
      {
        id: "08EQZ8EQukb",
        joke: "Did you hear about the guy whose whole left side was cut off? He's all right now.",
      },
      {
        id: "08xHQCdx5Ed",
        joke: "Why didn't the skeleton cross the road? Because he had no guts.",
      },
    ]);
  });
});
