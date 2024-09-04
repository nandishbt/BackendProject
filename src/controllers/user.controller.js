import { User } from '../models/user.model.js';
import { AsyncHandler } from '../utils/AsyncHandler.js';
import { apiError } from '../utils/apiError.js';
import { apiResponse } from '../utils/apiResponse.js';
import { savetoCloudinary } from '../utils/cloudinary.js';

const registerUser = AsyncHandler(async (req, res) => {
  // get user details from frontend
  // validation - not empty
  // check if user already exists: username, email
  // check for images, check for avatar
  // upload them to cloudinary, avatar
  // create user object - create entry in db
  // remove password and refresh token field from response
  // check for user creation
  // return res

  const { username, fullName, email, password } = req.body;

  // validation
  if (!username || !fullName || !email || !password) {
    throw new apiError(400, 'all required fields');
  }

  // check if user already exists
  const existingUser = await User.findOne({
    $or: [{ username }, { email }]
  });

  if (existingUser) {
    throw new apiError(400, 'user already exists');
  }

  // store images
  const avatarLocalPath =
    req.files && Array.isArray(req.files.avatar) && req.files.avatar.length > 0
      ? req.files.avatar[0].path
      : '';
  const coverImageLocalPath =
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
      ? req.files.coverImage[0].path
      : '';

  if (!avatarLocalPath) {
    throw new apiError(400, 'please upload avatar');
  }

  const avatar = await savetoCloudinary(avatarLocalPath);

  if (!avatar) {
    throw new apiError(500, 'error uploading avatar');
  }

  const coverImage = coverImageLocalPath
    ? await savetoCloudinary(coverImageLocalPath)
    : '';

  // create user object
  const user = await User.create({
    username,
    fullName,
    email,
    password,
    avatar: avatar.url,
    coverImage: coverImage ? coverImage.url : ''
  });

  const createdUser = await User.findById(user._id).select(
    '-password -refreshToken'
  );

  if (!createdUser) {
    throw new apiError(500, 'error creating user');
  }

  return res
    .status(201)
    .json(new apiResponse(200, 'user created successfully', createdUser));
});

export { registerUser };
