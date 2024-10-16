import mongoose from 'mongoose';
import { Video } from '../models/video.model.js';
import { AsyncHandler } from '../utils/AsyncHandler.js';
import { Subscription } from '../models/subscription.model.js';
import { apiResponse } from '../utils/apiResponse.js';

const channelStats = AsyncHandler(async (req, res) => {
  //total subscribers, total likes, total videos, total views,total duration

  try {
    const data = await Video.aggregate([
      {
        $match: {
          owner: new mongoose.Types.ObjectId(req.user._id)
        }
      },

      {
        $lookup: {
          from: 'likes',
          localField: '_id',
          foreignField: 'video',
          as: 'likes'
        }
      },

      {
        $addFields: {
          likescount: {
            $size: '$likes'
          }
        }
      },

      {
        $group: {
          _id: null,
          totalvideos: {
            $sum: 1
          },

          totallikes: {
            $sum: '$likescount'
          },

          totalduration: {
            $sum: '$duration'
          },

          totalviews: {
            $sum: '$views'
          }
        }
      }
    ]);

    const totalsubscribers = await Subscription.aggregate([
      {
        $match: {
          owner: new mongoose.Types.ObjectId(req.user._id)
        }
      },
      {
        $count: 'totalsubscribers'
      }
    ]);

    if (totalsubscribers.length == 0) {
      data[0].totalsubscribers = 0;
    }

    if (totalsubscribers.length > 0) {
      data[0].totalsubscribers = totalsubscribers[0].totalsubscribers;
    }

    return res
      .status(200)
      .json(
        new apiResponse(201, 'data fetched successfully', [
          ...data,
          ...totalsubscribers
        ])
      );
  } catch (error) {
    console.error(error);
    return res.status(500).json(new apiResponse(500, 'error fetching data'));
  }
});

const channelVideos = AsyncHandler(async (req, res) => {
  //all videos uploaded by channel

  const videos = await Video.find({ owner: req.user._id });

  return res
    .status(200)
    .json(new apiResponse(201, 'videos fetched successfully', videos));
});

export { channelStats, channelVideos };
