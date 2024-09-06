import { User } from '../models/user.model.js';
import { AsyncHandler } from '../utils/AsyncHandler.js';
import { apiError } from '../utils/apiError.js';
import { apiResponse } from '../utils/apiResponse.js';
import { savetoCloudinary } from '../utils/cloudinary.js';

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    // if (!user) return new apiError(404, 'User not found');
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.refreshAccessToken();

    user.refreshToken = refreshToken;

    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new apiError(401, "can't generate access token and refresh token");
  }
};

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

const loginUser = AsyncHandler(async (req, res) => {
  const { email, username, password } = req.body

  // console.log(email);
  

  if (!email && !username) {
    throw new apiError(404, 'please enter email or username');
  }

  if (!password) {
    throw new apiError(404, 'please enter password');
  }

  const user = await User.findOne({
    $or: [{ username }, { email }]
  });

  if (!user) {
    throw new apiError(404, 'Invalid username/email or password');
  }

  const isPasswordCorrect = await user.isPasswordCorrect(password);

  if (!isPasswordCorrect) {
    throw new apiError(401, 'Password is incorrect');
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    '-password -refreshToken'
  );

  const options = {
    httpOnly: true,
    secure: true
  };

  return res
    .status(200)
    .cookie('accessToken', accessToken, options)
    .cookie('refreshToken', refreshToken, options)
    .json(
      new apiResponse(201, 'user logged in successfully', {
        accessToken,
        refreshToken,
        user: loggedInUser
      })
    );
});

const logoutUser = AsyncHandler(async (req, res) => {

  //find user
  //set refresh token to empty string
  //clear cookies
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set:{
        refreshToken: ''
      }

    },
    {
      new: true
    }

    
  )


  const options = {
    httpOnly: true,
    secure: true
  }

  return res.status(200)
  .clearCookie("accessToken",options)
  .clearCookie("refreshToken",options)
  .json(new apiResponse(200, 'user logged out successfully',''))
})

export { registerUser, loginUser ,logoutUser };
