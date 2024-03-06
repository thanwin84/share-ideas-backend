import express from "express";
import notFoundMiddleware from "./middlewares/notFound.middleware.js";
import cookieParser from "cookie-parser";


const app = express()


// parse incoming json request with a limit of 16kb
app.use(express.json({limit: "16kb"}))
//parse incoming URL-enconded data with extended options and limit of 16kb
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static('public'))
app.use(cookieParser())

// routes import
import userRoutes from './routes/user.routes.js'
import healthCheckRouter from './routes/healthCheck.route.js'

// routes declaration
app.use('/api/v1/healthCheck', healthCheckRouter)
app.use("/api/v1/users", userRoutes)


// error hanlder middlewares
app.use(notFoundMiddleware)

export default app