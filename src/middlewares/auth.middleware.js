import { User } from '../models/user.model.js';
import { apiError } from '../utils/apiError.js';
import { AsyncHandler } from '../utils/AsyncHandler.js';
import jwt from 'jsonwebtoken';

export const verifyJWT = AsyncHandler(async (req, res, next) => {
  // verify JWT token here
  // if valid, add user to req.user
  // if not, send an error response

  const token =
    req.cookies?.accessToken ||
    req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    throw new apiError('401', 'UnAuthorized Access');
  }

  const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

  if (!decoded) {
    throw new apiError('401', 'UnAuthorized Access');
  }

  const user = await User.findById(decoded._id).select(
    '-password -refreshToken'
  );

  if (!user) {
    throw new apiError('404', 'User not found');
  }

  req.user = user;

  next();
});


