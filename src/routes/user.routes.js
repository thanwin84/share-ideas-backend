import { Router } from "express";
import {
    register,
    login
} from '../controllers/user.controller.js'
import { upload } from "../middlewares/multer.middleware.js";
const router = Router()

router.route("/")
.post(upload.single('avatar'), register)

router.route("/login")
.post(login)

export default router