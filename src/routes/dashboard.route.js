import express from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { channelStats,channelVideos } from '../controllers/dashboard.controller.js';

const router = express.Router()

router.use(verifyJWT)

router.route('/stats').get(channelStats)

router.route('/videos').get(channelVideos)

export default router;