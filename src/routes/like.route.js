import express from 'express'
import {verifyJWT} from '../middlewares/auth.middleware.js'
import {toggleVideoLike, toggleCommentLike, toggleTweetLike, likedVideos} from '../controllers/like.controller.js'

const router = express.Router();


router.use(verifyJWT);


router.route('/video/v/:videoId').post(toggleVideoLike)

router.route('/comment/c/:commentId').post(toggleCommentLike)


router.route('/tweet/v/:tweetId').post(toggleTweetLike)

router.route('/likedvideos').get(likedVideos)


export default router



