import {
    getBloggerActivityStatistic
} from '../controllers/dashboard.controller.js'
import {verityJWT} from "../middlewares/verityJWT.middleware.js"
import {Router} from 'express'

const router = Router()

router.use(verityJWT)

router.route("/").get(getBloggerActivityStatistic)

export default router;