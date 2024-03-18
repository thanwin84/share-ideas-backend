import { ApiError, Api404Error,Api500Error } from "../utils/ApiError.js"
const errorHandler = (error, req, res, next)=>{
    res.status(error.statusCode || 500).json(
        {
            success: false,
            message: error.message || "Internel server error"
        }
    )
}

export {
    errorHandler
}