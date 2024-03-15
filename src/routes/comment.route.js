import { Router } from "express";
import {
    addCommentToBlog,
    editBlogComment,
    deleteBlogComment,
    getBlogComments
} from '../controllers/comment.controller.js'
import {verityJWT} from '../middlewares/verityJWT.middleware.js'

const router = Router()


router.route("/blogs/:blogId")
.post(verityJWT, addCommentToBlog)
.get(getBlogComments)


router.route("/blogs/:blogId/:commentId")
.patch(verityJWT, editBlogComment)
.delete(verityJWT, deleteBlogComment)

export default router;

