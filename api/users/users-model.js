const db = require("../../data/dbConfig.js");

/**
  resolves to an ARRAY with all users, each user having { id, username }
 */
function find() {
  return db("users").select("id", "username");
}

/**
  resolves to an ARRAY with all users that match the filter condition
 */
function findBy(filter) {
  return db("users").where(filter);
}

/**
  resolves to the user { id, username } with the given id
 */
function findById(id) {
  return db("users").where({ id }).first();
}

/**
  resolves to the newly inserted user { id, username }
 */
async function add(user) {
  const [id] = await db("users").insert(user);

  return findById(id);
}

module.exports = {
  add,
  find,
  findBy,
  findById,
};
