import { UnauthorizedError } from "../../../api-gateway/src/utils/error.js";

function getUserContext(req, res, next) {
  const userId = req.headers["x-user-id"];
  if (!userId) {
    return next(
      new UnauthorizedError("User contenxt missing  must come through gatway"),
    );
  }
  req.user = { id: userId };
  next();
}

export { getUserContext };
