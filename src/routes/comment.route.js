import express from "express";

const router = express.Router()

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addComment, deleteComment, getAllComments, updateComment } from "../controllers/comment.controller.js";


router.use(verifyJWT);


router.route('/:videoId').post(addComment).get(getAllComments)
router.route('/c/:commentId').delete(deleteComment).patch(updateComment)

export default router;