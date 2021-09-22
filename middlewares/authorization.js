import jwt from "jsonwebtoken";
import HttpError from "http-errors";

const { JWT_SECRET } = process.env;

const EXCLUDE = [
  '/users/login',
  '/users/register',
]

export default function authorization(req, res, next) {
  try {
    const { authorization = '' } = req.headers;
    if (EXCLUDE.includes(req.path)) {
      next();
      return;
    }
    const token = authorization.replace('Bearer ', '');
    let userId;
    try {
      const data = jwt.verify(token, JWT_SECRET);
      userId = data.userId;
    } catch (e) {

    }
    if (!userId) {
      throw HttpError(401);
    }

    req.userId = userId;

    next();
  } catch (e) {
    next(e);
  }
}
