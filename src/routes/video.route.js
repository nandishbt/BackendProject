import express from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import {
  addVideo,
  deleteVideo,
  getAllvideos,
  getVideoById,
  updateVideo,
  togglePublishStatus
} from '../controllers/video.controller.js';
import { upload } from '../middlewares/multer.middleware.js';

const router = express.Router();

router.route('/allvideos').get(getAllvideos);

router.route('/postvideo').post(
  verifyJWT,
  upload.fields([
    { name: 'videoFile', maxCount: 1 },
    {
      name: 'thumbnail',
      maxCount: 1
    }
  ]),
  addVideo
);

router
  .route('/:videoId')
  .delete(verifyJWT, deleteVideo)
  .patch(verifyJWT, upload.single('thumbnail'), updateVideo)
  .get(getVideoById);

router.route('/toggle/publish/:videoId').patch(togglePublishStatus);

export default router;
