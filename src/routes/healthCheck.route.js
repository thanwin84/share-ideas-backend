import {getSampleData} from '../controllers/healthCheck.controller.js'
import { Router } from 'express'

const router = Router()

router.route("/")
.get(getSampleData)

export default router