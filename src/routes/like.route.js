import { Router } from "express";
import {
    toggleBlogLike,
    toggleCommentLike
} from '../controllers/like.controller.js'
import {verityJWT} from '../middlewares/verityJWT.middleware.js'

const router = Router()

router.use(verityJWT)

router.route("/comments/:commentId/like").post(toggleCommentLike)
router.route("/blogs/:blogId/like").post(toggleBlogLike)


export default router;