import express from "express";
import notFoundMiddleware from "./middlewares/notFound.middleware.js";
import cookieParser from "cookie-parser";
import cors from 'cors'
import {corsOptions} from './config/corsOptions.js'

const app = express()


// parse incoming json request with a limit of 16kb
app.use(express.json({limit: "16kb"}))
//parse incoming URL-enconded data with extended options and limit of 16kb
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static('public'))
app.use(cookieParser())
app.use(cors(corsOptions))

// routes import
import authRouter from './routes/auth.route.js'
import healthCheckRouter from './routes/healthCheck.route.js'
import refreshAccessTokenRouter from './routes/refreshAccessToken.route.js'
import userRouter from './routes/user.routes.js'
import blogsRouter from './routes/blog.route.js'
import followingRouter from "./routes/following.route.js"
import commentRouter from './routes/comment.route.js'
import likeRouter from "./routes/like.route.js"

// routes declaration
app.use('/api/v1/healthCheck', healthCheckRouter)
app.use("/api/v1/users", authRouter)
app.use('/api/v1/refreshAccessToken', refreshAccessTokenRouter)
app.use("/api/v1/users", userRouter)
app.use("/api/v1/blogs", blogsRouter)
app.use("/api/v1/followings", followingRouter)
app.use("/api/v1/comments", commentRouter)
app.use("/api/v1/likes", likeRouter)

// error hanlder middlewares
app.use(notFoundMiddleware)

export default app