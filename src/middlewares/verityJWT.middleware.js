import jwt from 'jsonwebtoken'
import {httpStatusCodes} from '../constants/index.js'
import { Api401Error } from '../utils/ApiError.js'


function verityJWT(req, res, next){
    
    // access token is  stored either in header or in cookies
    const token = req.cookies?.accessToken || req.header('Authorization')?.replace('Bearer ', "")
    jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        (error, decoded)=>{
            if (error){
                throw new Api401Error("User is not authorized")
            } else {
                // console.log(decoded)
                req.user = decoded
                next()
            }
        }
    )
}

export {verityJWT}