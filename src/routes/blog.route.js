import {Router} from 'express'
import { verityJWT } from '../middlewares/verityJWT.middleware.js'
import { upload } from '../middlewares/multer.middleware.js'
import {
    createBlog,
    deleteBlog,
    updateBlog,
    togglePublishBlog,
    togglePremiumBlog,
    getCurrentUserBlogs,
    getBlogById,
    getBlogsByUserId,
    getAllUserBlogs
} from '../controllers/blog.controller.js'

const router = Router()

// *********public route
router.route("/")
.get(getAllUserBlogs)

router.route("/:blogId")
.get(getBlogById)

router.route("users/:userId")
.get(getBlogsByUserId)

//*********protected routes
router.use(verityJWT)

router.route("/")
.post(upload.single("coverPhoto"),createBlog)
.get(getCurrentUserBlogs)

router.route("/:blogId")
.delete(deleteBlog)
.patch(upload.single("coverPhoto"),updateBlog)

router.route("/toggle-publish/:blogId").patch(togglePublishBlog)
router.route("/toggle-premium/:blogId").patch(togglePremiumBlog)



export default router