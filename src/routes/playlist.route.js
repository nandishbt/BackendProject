import express from 'express';

const router = express.Router();

import { verifyJWT } from '../middlewares/auth.middleware.js';

import {
  createPlaylist,
  getPlaylistById,
  updatePlaylist,
  deletePlaylist,
  addVideoToPlaylist,
  deleteVideoFromPlaylist,
  getPlaylists
} from '../controllers/playlist.controller.js';

router.use(verifyJWT);

router.route('/createplaylist').post(createPlaylist);

router
  .route('/:playlistId')
  .post(getPlaylistById)
  .patch(updatePlaylist)
  .delete(deletePlaylist)

  router.route('/add/:videoId/:playlistId').post(addVideoToPlaylist)
  router.route('/delete/:videoId/:playlistId').post(deleteVideoFromPlaylist)

  router.route('/getplaylists').get(getPlaylists)


  export default router;
