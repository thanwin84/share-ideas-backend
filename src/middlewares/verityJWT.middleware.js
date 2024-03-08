import jwt from 'jsonwebtoken'
import {httpStatusCodes} from '../constants/index.js'
import { ApiError } from '../utils/ApiError.js'


function verityJWT(req, res, next){
    
    // access token is either stored in header or in cookies
    const token = req.cookies?.accessToken || req.header('Authorization')?.replace('Bearer ', "")
    jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        (error, decoded)=>{
            if (error){
                throw new ApiError(
                    httpStatusCodes.UNAUTHORIZED,
                    "unauthorized request"
                    )
            } else {
                // console.log(decoded)
                req.user = decoded
                next()
            }
        }
    )
}

export {verityJWT}