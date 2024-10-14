import { User } from '../models/user.model.js';
import { apiError } from '../utils/apiError.js';
import { AsyncHandler } from '../utils/AsyncHandler.js';
import fs from 'fs';
import { savetoCloudinary } from '../utils/cloudinary.js';
import { Video } from '../models/video.model.js';
import { apiResponse } from '../utils/apiResponse.js';

const addVideo = AsyncHandler(async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      throw new apiError(401, 'Enter title and description');
    }

    const userId = req.user._id;

    const user = await User.findById(userId);

    if (!user) {
      throw new apiError(401, 'User not found');
    }

    const videoLocalPath = req.files?.videoFile[0]?.path;

    if (!videoLocalPath) {
      throw new apiError(401, 'Video file is required');
    }

    const thumbnailLoaclPath = req.files?.thumbnail[0].path;

    if (!thumbnailLoaclPath) {
      throw new apiError(401, 'Thumbnail is required');
    }

    const video = await savetoCloudinary(videoLocalPath);

    if (!video.url) {
      req.files && fs.unlinkSync(req.files?.videoFile[0]?.path);
      throw new apiError(500, 'Error uploading video');
    }

    const thumbnail = await savetoCloudinary(thumbnailLoaclPath);

    if (!thumbnail.url) {
      req.files && fs.unlinkSync(req.files?.thumbnail[0].path);
      throw new apiError(500, 'Error uploading thumbnail');
    }

    const newVideo = await Video.create({
      videoFile: video.url,
      thumbnail: thumbnail.url,
      title,
      description,
      duration: video.duration,
      owner: user._id
    });

    return res
      .status(200)
      .json(new apiResponse(201, 'video added successfully', newVideo));
  } catch (error) {
    throw new apiError(500, error.message);
  }
});

const deleteVideo = AsyncHandler(async (req, res) => {
  if (!req.params.videoId) {
    throw new apiError(400, 'Video id is required');
  }

  const result = await Video.findByIdAndDelete(req.params.videoId);

  return res
    .status(200)
    .json(new apiResponse(201, 'video deleted successfully', result));
});

const getAllvideos = AsyncHandler(async (req, res) => {
  const videos = await Video.find({});

  if (videos.length == 0) {
    throw new apiError(404, 'No videos found');
  }

  return res
    .status(200)
    .json(new apiResponse(201, 'videos fetched successfully', videos));
});

const updateVideo = AsyncHandler(async (req, res) => {
  const { title, description } = req.body;

  if (!title || !description) {
    throw new apiError(400, 'Title and description are required');
  }

  const thumbnailLocalpath = req.file && req.file.path;

  const thumbnail = await savetoCloudinary(thumbnailLocalpath);

  if (!thumbnail) {
    throw new apiError(500, 'Error uploading thumbnail');
  }

  const video = await Video.findByIdAndUpdate(
    req.params.videoId,
    {
      title,
      description,
      thumbnail: thumbnail.url || ''
    },
    { new: true }
  );

  return res
    .status(200)
    .json(new apiResponse(201, 'video updated successfully', video));
});

const getVideoById = AsyncHandler(async (req, res) => {
  if (!req.params.videoId) {
    throw new apiError(400, 'Video id is required');
  }

  const video = await Video.findById(req.params.videoId);

  if (!video) {
    throw new apiError(404, 'Video not found');
  }

  return res
    .status(200)
    .json(new apiResponse(201, 'video fetched successfully', video));
});

const togglePublishStatus = AsyncHandler(async (req, res) => {
  if (!req.params.videoId) {
    throw new apiError(400, 'Video id is required');
  }

  const videoOne = await Video.findById(req.params.videoId)

  if (!videoOne) {
    throw new apiError(404, 'Video not found');
  }



  const video = await Video.findByIdAndUpdate(
    req.params.videoId,

   {
    $set:{
        isPublished:!videoOne.isPublished
       
        
    }
   },

   
    { new: true }
  );

  return res
    .status(200)
    .json(new apiResponse(201, 'video status updated successfully', video));
});

export {
  addVideo,
  deleteVideo,
  getAllvideos,
  updateVideo,
  getVideoById,
  togglePublishStatus
};
