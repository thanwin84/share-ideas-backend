import { Router } from "express";
import {
    register,
    login,
    logout,
    sendVerificationCode,
    checkVerificationCode
} from '../controllers/auth.controller.js'
import { upload } from "../middlewares/multer.middleware.js";
import { verityJWT } from "../middlewares/verityJWT.middleware.js";


const router = Router()

router.route("/")
.post(upload.single('avatar'), register)

router.route("/login")
.post(login)

router.route('/logout')
.post(verityJWT, logout)

router.route("/send-verification-code").post(verityJWT, sendVerificationCode)
router.route("/check-verification-code").post(verityJWT, checkVerificationCode)


export default router