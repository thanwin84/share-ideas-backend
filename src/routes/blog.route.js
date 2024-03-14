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
    getBlogs,
    getPersonalizedBlogs
} from '../controllers/blog.controller.js'

const router = Router()

// *********public route
router.route("/").get(getBlogs)
router.route("/:blogId").get(getBlogById)


//*********protected routes
router.use(verityJWT)

router.route('/blog/personalized-blogs/').get(getPersonalizedBlogs)

router.route("/").post(upload.single("coverPhoto"),createBlog)

router.route("/users/current-user").get(getCurrentUserBlogs)

router.route("/:blogId")
.delete(deleteBlog)
.patch(upload.single("coverPhoto"), updateBlog)

router.route("/:blogId/toggle-publish").patch(togglePublishBlog)
router.route("/:blogId/toggle-premium").patch(togglePremiumBlog)



export default router