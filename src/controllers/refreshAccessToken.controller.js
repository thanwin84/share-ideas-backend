import { httpStatusCodes } from "../constants/index.js";
import { User } from "../models/user.model.js";
import { Api403Error, Api400Error, Api404Error, Api401Error } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from 'jsonwebtoken'


function verifyRefreshToken(refreshToken){
    const result = {}
    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (error, decodedToken)=>{
            if (error){
                throw new Api401Error("refresh token is expired or invalid")
            } else {
                result.id = decodedToken._id,
                result.verified = true
            }
        }
    )
    return result
}
const refreshAccessToken = asyncHandler(async(req, res)=>{
    

    const refreshToken = req.cookies?.refreshToken || ""
    if (refreshToken === ""){
        throw new Api400Error("refresh token is missing")
    }
    const { id, verified} = verifyRefreshToken(refreshToken)
    
    const userId = id
    const user = await User.findById(userId)
    if (!user){
        throw new Api404Error(`User with id ${userId} is not found`)
    }

    const isRefreshTokenValid = user.refreshToken === refreshToken
    if (!isRefreshTokenValid){
        throw new Api403Error("user is forbidden")
    }

    const newAccessToken = user.generateAccessToken()
    const newRefreshToken = user.generateRefreshToken()

    // also update refresh token in db also
    user.refreshToken = newRefreshToken
    await user.save({validateBeforeSave: false})

    const options = {
        httpOnly: true,
        secure: true
        }
        
    return res
    .status(httpStatusCodes.OK)
    .cookie("accessToken", newAccessToken, options)
    .cookie("refreshToken", newRefreshToken, options)
    .json(new ApiResponse(
        httpStatusCodes.OK,
        user,
        "new access token and refresh token generated successfully"
    ))

})

export {
    refreshAccessToken
}