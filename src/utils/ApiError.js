import { httpStatusCodes } from "../constants/index.js"

class ApiError extends Error{
    constructor(
        message = "Something went wrong",
        statusCode,
        description,
        errors = [],
        stack = ""
    ){
        super(message)
        this.statusCode = statusCode
        this.errors  = errors
        this.message = message
        this.success = false
        this.data = null
        this.description = description
        if (stack){
            this.stack = stack
        } else {
            Error.captureStackTrace(this, this.constructor)
        }
    }
    
}

class Api400Error extends ApiError{
    constructor(
        message,
        statusCode = httpStatusCodes.BAD_REQUEST,
        description = "Bad request"
    ){
        super(message, statusCode, description)
    }
}

class Api404Error extends ApiError{
    constructor(
        message,
        statusCode = httpStatusCodes.NOT_FOUND,
        description = "Not Found"
    ){
        super(message, statusCode, description)
    }
}
class Api500Error extends ApiError{
    constructor(
        message,
        statusCode = httpStatusCodes.INTERNAL_SERVER_ERROR,
        description = "Internal server error"
    ){
        super(message, statusCode, description)
    }
}
class Api401Error extends ApiError{
    constructor(
        message,
        statusCode = httpStatusCodes.UNAUTHORIZED,
        description = "Unauthorized"
    ) {
        super(message, statusCode, description)
    }
}
class Api403Error extends ApiError{
    constructor(
        message, 
        statusCode = httpStatusCodes.FORBIDDEN,
        description = "Forbidden"
    ){
        super(message, statusCode, description)
    }
}
class Api409Error extends ApiError{
    constructor(
        message, 
        statusCode = httpStatusCodes.CONFLICT,
        description = "Conflict"
    ){
        super(message, statusCode, description)
    }
}
export {
    ApiError,
    Api400Error,
    Api403Error,
    Api404Error,
    Api409Error,
    Api500Error,
    Api401Error
}
