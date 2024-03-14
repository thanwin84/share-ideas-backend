import { Router } from "express";
import {
    toggleFollowing,
    getFollowers
} from '../controllers/following.controller.js'
import {verityJWT} from '../middlewares/verityJWT.middleware.js'

const router = Router()

/// public route
router.route("/users/:userId")
.get(getFollowers)

// protected route
router.use(verityJWT)

router.route("/:bloggerId").post(toggleFollowing)


export default router;