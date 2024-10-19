import { AsyncHandler } from '../utils/AsyncHandler.js';

import { Like } from '../models/like.model.js';

const toggleCommentLike = AsyncHandler(async (req, res) => {
  try {
    const commentlike = await Like.findOne({
      $and: [{ likedBy: req.user._id }, { comment: req.params.commentId }]
    });

    if (commentlike) {
      await Like.findByIdAndDelete(commentlike._id);
      return res.json({ message: 'Unliked' });
    }

    const newLike = await Like.create({
      likedBy: req.user._id,
      comment: req.params.commentId
    });

    return res.json({ message: 'Liked' });
  } catch (error) {
    res.json({ error: error.message });
  }
});

const toggleVideoLike = AsyncHandler(async (req, res) => {
  try {
    const videolike = await Like.findOne({
      $and: [{ likedBy: req.user._id }, { video: req.params.videoId }]
    });

    if (videolike) {
      await Like.findByIdAndDelete(videolike._id);
      return res.json({ message: 'Unliked' });
    }

    const newLike = await Like.create({
      likedBy: req.user._id,
      video: req.params.videoId
    });

    return res.json({ message: 'Liked' });
  } catch (error) {
    res.json({ error: error.message });
  }
});

const toggleTweetLike = AsyncHandler(async (req, res) => {
  try {
    const tweetlike = await Like.findOne({
      $and: [{ likedBy: req.user._id }, { tweet: req.params.tweetId }]
    });

    if (tweetlike) {
      await Like.findByIdAndDelete(tweetlike._id);
      return res.json({ message: 'Unliked' });
    }

    const newLike = await Like.create({
      likedBy: req.user._id,
      tweet: req.params.tweetId
    });

    return res.json({ message: 'Liked' });
  } catch (error) {
    res.json({ error: error.message });
  }
});

const likedVideos = AsyncHandler(async (req, res) => {
  try {
    const likedVideos = await Like.aggregate([
      {
        $match: {
          likedBy: req.user._id,
          video: { $exists: true }
        }
      },

      {
        $lookup: {
          from: 'videos',
          localField: 'video',
          foreignField: '_id',
          as: 'video',
          pipeline: [
            {
              $project: {
                videoFile: 1,
                title: 1,
                description: 1,
                duration: 1,
                views: 1
              }
            }
          ]
        }
      }
    ]);

    return res.json({ likedVideos });
  } catch (error) {
    res.json({ error: error.message });
  }
});

export { toggleCommentLike, toggleVideoLike, toggleTweetLike, likedVideos };
