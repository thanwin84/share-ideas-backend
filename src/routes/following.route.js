import { Router } from "express";
import {
    toggleFollowing,
    getFollowers,
    getFollwings,
    getFollowersAndFollowingCount
} from '../controllers/following.controller.js'
import {verityJWT} from '../middlewares/verityJWT.middleware.js'

const router = Router()

/// public route
router.route("/:userId").get(getFollwings)
router.route("/followers/:bloggerId").get(getFollowers)
router.route("/followersAndFollowings/count/:userId").get(getFollowersAndFollowingCount)

// protected route
router.use(verityJWT)

router.route("/follow/:bloggerId").post(toggleFollowing)


export default router;
