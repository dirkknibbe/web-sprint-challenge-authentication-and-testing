const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../secrets");
const User = require("../users/users-model");

const restrict = (req, res, next) => {
  const token = req.headers.authorization;
  if (token) {
    jwt.verify(token, JWT_SECRET, (err, decodedJwt) => {
      if (err) {
        next({ status: 401, message: "token invalid" });
      } else {
        req.decodedJwt = decodedJwt;
        next();
      }
    });
  } else {
    next({ status: 401, message: "token required" });
  }
};

const validateInput = (req, res, next) => {
  let user = req.body;

  if (!user.username || user.username.trim() === "") {
    res.status(422).json({ message: "username and password required" });
  } else if (!user.password) {
    res.status(422).json({ message: "username and password required" });
  } else {
    next();
  }
};

// for register endpoint
async function checkIfUsernameFree(req, res, next) {
  let [user] = await User.findBy({ username: req.body.username });
  if (user != null) {
    next({ status: 422, message: "username taken" });
  } else {
    next();
  }
}

// for login endpoint
const checkIfUsernameExists = async (req, res, next) => {
  try {
    let user = await User.findBy({ username: req.body.username });

    if (!user) {
      next({ status: 401, message: "invalid credentials" });
    } else {
      next();
    }
  } catch (err) {
    next(err);
  }
};

module.exports = {
  restrict,
  checkIfUsernameExists,
  checkIfUsernameFree,
  validateInput,
};

/*
    IMPLEMENT

    1- On valid token in the Authorization header, call next.

    2- On missing token in the Authorization header,
      the response body should include a string exactly as follows: "token required".

    3- On invalid or expired token in the Authorization header,
      the response body should include a string exactly as follows: "token invalid".
  */
