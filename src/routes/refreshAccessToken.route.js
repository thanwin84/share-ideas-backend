import {refreshAccessToken} from '../controllers/refreshAccessToken.controller.js'
import { verityJWT } from '../middlewares/verityJWT.middleware.js'
import {Router} from 'express'

const router = Router()

router.route('/')
.post(verityJWT, refreshAccessToken)

export default router