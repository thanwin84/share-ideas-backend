import { Router } from "express";
import {
    register,
    login,
    logout
} from '../controllers/user.controller.js'
import { upload } from "../middlewares/multer.middleware.js";
import { verityJWT } from "../middlewares/verityJWT.middleware.js";


const router = Router()

router.route("/")
.post(upload.single('avatar'), register)

router.route("/login")
.post(login)

router.route('/logout')
.post(verityJWT, logout)

export default router