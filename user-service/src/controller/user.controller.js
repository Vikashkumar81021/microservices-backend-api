import { getProfileService } from "../service/user.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { BadRequestError } from "../utils/error.js";

const getProfileController = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  if (!userId) {
    throw new BadRequestError("User ID is missing");
  }
  const user = await getProfileService(userId);
  return res.status(200).json({
    success: true,
    message: " fetched user profile Successfully",
    data: user,
  });
});
export { getProfileController };
