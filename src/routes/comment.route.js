import { Router } from "express";
import {
    
} from '../controllers/comment.controller.js'
import {verityJWT} from '../middlewares/verityJWT.middleware.js'

const router = Router()

router.use(verityJWT)



export default Router;