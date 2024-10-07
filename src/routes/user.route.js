import { Router } from 'express';
import {
  registerUser,
  loginUser,
  logoutUser,
  genRefreshToken,
  changeCurrentPassword,
  getCurrentUser,
  updateUser,
  updateUserAvatar,
  updateUserCoverImage,
  channel,
  watchHistory
} from '../controllers/user.controller.js';
import { upload } from '../middlewares/multer.middleware.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';


const router = Router();

router.route('/register').post(
  upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 }
  ]),

  registerUser
);

router.route('/login').post(loginUser);

//secure routes

router.route('/logout').post(verifyJWT, logoutUser);

router.route('/refreshToken').post(genRefreshToken);

router.route('/newpassword').post(verifyJWT, changeCurrentPassword);

router.route('/getuser').get(verifyJWT, getCurrentUser);

router.route('/updateuser').post(verifyJWT, updateUser);

router
  .route('/updateuseravatar')
  .post(verifyJWT, upload.single('avatar'), updateUserAvatar);

router
  .route('/updateusercoverimage')
  .post(verifyJWT, upload.single('coverImage'), updateUserCoverImage);

router.route('/channel/:username').get(verifyJWT,channel)

router.route('/watchhistory').get(verifyJWT,watchHistory)


export default router;
