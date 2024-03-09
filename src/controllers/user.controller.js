import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from '../utils/ApiError.js'
import {User} from '../models/user.model.js'
import {ApiResponse} from '../utils/ApiResponse.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import {httpStatusCodes} from '../constants/index.js'

const updateUserDetaiils = asyncHandler(async(req, res)=>{
    //update username, first name, last name, email
    const userId = req.user._id
    const {username, firstName, lastName, email} = req.body
})

const changePassword = asyncHandler(async (req, res)=>{
    const userId = req.user._id
    const {password} = req.body
})

const changeAvatar = asyncHandler(async (req, res)=>{
    // change profile pic
    const userId = req.user._id

})

const getCurrentUser = asyncHandler(async (req, res)=>{
    const userId = req.user._id
    if (!userId){
        throw new ApiError(httpStatusCodes.BAD_REQUEST, "user id is missing")
    }
    const user = await User.findById(userId).select('-password -refreshToken')
    if (!user){
        throw new ApiError(
            httpStatusCodes.BAD_REQUEST,
            "user does not exists"
        )
    }
    return res
    .status(httpStatusCodes.OK)
    .json(new ApiResponse(
        httpStatusCodes.OK,
        user,
        "user details have been fetched successfully"
    ))
})
const getUserDetailsById = asyncHandler(async (req, res)=>{
    const {userId} = req.params
    if (!userId){
        throw new ApiError(httpStatusCodes.BAD_REQUEST, "user id is missing")
    }
    const user = await User.findById(userId).select('-password -refreshToken')
    if (!user){
        throw new ApiError(
            httpStatusCodes.BAD_REQUEST,
            "user does not exists"
        )
    }
    return res
    .status(httpStatusCodes.OK)
    .json(new ApiResponse(
        httpStatusCodes.OK,
        user,
        "user details have been fetched successfully"
    ))
})

export {
    updateUserDetaiils,
    changePassword,
    changeAvatar,
    getCurrentUser,
    getUserDetailsById
}