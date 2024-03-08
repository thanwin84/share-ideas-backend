import { httpStatusCodes } from "../constants/index.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from 'jsonwebtoken'


function verifyRefreshToken(refreshToken){
    
    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (error, _)=>{
            if (error){
                throw new ApiError(
                    httpStatusCodes.FORBIDDEN, 
                    "refresh token is expired or invalid"
                    )
            } else {
                return true
            }
        }
    )
}
const refreshAccessToken = asyncHandler(async(req, res)=>{
    // get refresh token from user
    const userId = req.user._id
    if (!userId){
        throw new ApiError(
            httpStatusCodes.BAD_REQUEST,
            "user id is missing"
            )
    }
    const refreshToken = req.cookies?.refreshToken || ""
    if (refreshToken === ""){
        throw new ApiError(
            httpStatusCodes.BAD_REQUEST, 
            "refresh token is missing"
            )
    }
    const user = await User.findById(userId)
    if (!user){
        throw new ApiError(
            httpStatusCodes.BAD_REQUEST,
             "user does not exist"
            )
    }
    const isRefreshTokenValid = user.refreshToken === refreshToken
    if (!isRefreshTokenValid){
        throw new ApiError(
            httpStatusCodes.FORBIDDEN, 
            "User is forbidden"
            )
    }
    verifyRefreshToken(refreshToken)
    // refresh token is valid, so generate new access and refresh token
    const newAccessToken = user.generateAccessToken()
    const newRefreshToken = user.generateRefreshToken()
    // update refresh token in db also
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