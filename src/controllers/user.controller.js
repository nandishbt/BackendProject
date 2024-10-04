import { User } from '../models/user.model.js';
import { AsyncHandler } from '../utils/AsyncHandler.js';
import { apiError } from '../utils/apiError.js';
import { apiResponse } from '../utils/apiResponse.js';
import { savetoCloudinary } from '../utils/cloudinary.js';
import jwt from 'jsonwebtoken';

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
  const { email, username, password } = req.body;

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

  const options = {  //make sure that only server can set and alter cookies
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
      $set: {
        refreshToken: ''
      }
    },
    {
      new: true
    }
  );

  const options = {
    httpOnly: true,
    secure: true
  };

  return res
    .status(200)
    .clearCookie('accessToken', options)
    .clearCookie('refreshToken', options)
    .json(new apiResponse(200, 'user logged out successfully', ''));
});

const genRefreshToken = AsyncHandler(async (req, res) => {
  const Token = req.cookies?.refreshToken || req.body?.refreshToken;

  if (!Token) {
    throw new apiError(401, 'no refresh token');
  }

  const decodedToken = jwt.verify(Token, process.env.REFRESH_TOKEN_SECRET);

  if (!decodedToken) {
    throw new apiError(401, 'invalid decoded token');
  }

  const user = await User.findById(decodedToken._id);

  if (!user) {
    throw new apiError(401, 'user not found');
  }

  if (Token !== user?.refreshToken) {
    throw new apiError(401, 'invalid refresh token');
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  return res
    .status(200)
    .cookie('accessToken', accessToken)
    .cookie('refreshToken', refreshToken)
    .json(
      new apiResponse(200, 'token refreshed successfully', {
        accessToken,
        refreshToken
      })
    );
});

const changeCurrentPassword = AsyncHandler(async (req, res) => {
  const { newpassword, oldpassword } = req.body;

  const user = await User.findById(req.user._id);

  if (!user) {
    throw new apiError(401, 'user not found');
  }

  const isPasswordCorrect = await user.isPasswordCorrect(oldpassword);

  if (!isPasswordCorrect) {
    throw new apiError(401, 'old password is incorrect');
  }

  user.password = newpassword;

  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new apiResponse(200, 'password changed successfully', user));
});

const getCurrentUser = AsyncHandler(async (req, res) => {
  res
    .status(200)
    .json(new apiResponse(201, 'üser fetched successfully ', req.user));
});

const updateUser = AsyncHandler(async (req, res) => {
  const { email, username, fullName } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        email,
        username,
        fullName
      }
    },
    { new: true }
  ).select('-password -refreshToken');

  if (!user) {
    throw new apiError(401, 'user not found');
  }

  res.status(200).json(new apiResponse(201, 'User Updated Successfully', user));
});

const updateUserAvatar = AsyncHandler(async (req, res) => {
  const avatarLocalpath = req.file ? req.file?.path : '';

  if (!avatarLocalpath) {
    throw new apiError(400, 'please upload avatar');
  }

  const avatar = await savetoCloudinary(avatarLocalpath);

  if (!avatar.url) {
    throw new apiError(500, 'error uploading avatar');
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        avatar: avatar.url
      }
    },
    { new: true }
  ).select('-password -refreshToken');

  res
    .status(200)
    .json(new apiResponse(201, 'User Avatar Updated Successfully', user));
});

const updateUserCoverImage = AsyncHandler(async (req, res) => {
  const coverImageLocalpath = req.file ? req.file?.path : '';

  if (!coverImageLocalpath) {
    throw new apiError(400, 'please upload cover image');
  }

  const coverImage = await savetoCloudinary(coverImageLocalpath);

  if (!coverImage.url) {
    throw new apiError(500, 'error uploading avatar');
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        coverImage: coverImage.url
      }
    },
    { new: true }
  ).select('-password -refreshToken');

  res
    .status(200)
    .json(new apiResponse(201, 'User Cover Image Updated Successfully', user));
});

const channel = AsyncHandler(async (req,res)=>{
  const {username} = req.params

  if(!username){
    throw new apiError(400, 'Please provide a username')
  }

  const channel = await User.aggregate([
    {
      $match : {
        username
      }
    },

    {
      $lookup :{
        from : 'subscriptions',
        localField : '_id',
        foreignField : 'owner',
        as : 'subscribers'
      }
    },

    {
      $lookup :{
        from : 'subscriptions',
        localField : '_id',
        foreignField : 'subscriber',
        as : 'SubscribedTo'
      }
    },


    {
      $addFields :{
        "noOfSubcribers":{
          $size : "$subscribers"
        },

        "subscribedTo" : {
          $size : "$SubscribedTo"
        },

        "isSubscribed":{
          $cond:{


            if :{
              $in:[req.user?._id,"$subscribers.subscriber"],  /////match :{subscribers :{$elemmatch : {subscriber : req.user._id} }
              then:true,
              else:false
              
            }

          }
        }
      }
    },

    {
      $project:{
        fullName:1,
        username:1,
        avatar:1,
        coverImage:1,
        noOfSubcribers:1,
        subscribedTo:1,
        isSubscribed:1
      }
    }








  ])


  if(!channel?.length){
    throw new apiError(404, 'User not found')
  }

  return res.status(200).json(new apiResponse(201, 'Channel fetched successfully', channel[0]))
})




export {
  registerUser,
  loginUser,
  logoutUser,
  genRefreshToken,
  changeCurrentPassword,
  getCurrentUser,
  updateUser,
  updateUserAvatar,
  updateUserCoverImage,
  channel
};
