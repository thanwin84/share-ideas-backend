import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from '../utils/ApiError.js'
import {User} from '../models/user.model.js'
import {ApiResponse} from '../utils/ApiResponse.js'
import {
     uploadOnCloudinary, 
     deleteAsset 
    } from '../utils/cloudinary.js'
import {httpStatusCodes} from '../constants/index.js'

async function uploadSingleFile(localFilePath){
    const uploadedFile = await uploadOnCloudinary(localFilePath)
    if (!uploadedFile){
        throw new ApiError(httpStatusCodes.BAD_REQUEST, "file is missing")
    }
    return uploadedFile
}


const updateUserDetaiils = asyncHandler(async(req, res)=>{
    //update username, first name, last name, email
    const userId = req.user._id
    const {username, firstName, lastName, email} = req.body
    if (!username && !firstName && !lastName && !email){
        throw new ApiError(
            httpStatusCodes.BAD_REQUEST,
            "At least one field is required"
        )
    }
    if (!userId){
        throw new ApiError(
            httpStatusCodes.BAD_REQUEST,
            "user id is missing"
        )
    }
    const user = await User.findOneAndUpdate(
        {_id: userId},
        {$set: {...req.body}},
        {new: true}
    )
    return res
    .status(httpStatusCodes.OK)
    .json(new ApiResponse(
        httpStatusCodes.OK,
        user,
        "user details have been updated successfully"
    ))
    
})

const changePassword = asyncHandler(async (req, res)=>{
    const userId = req.user._id
    const {oldPassword, newPassword} = req.body
    if (!oldPassword && !newPassword){
        throw new ApiError(
            httpStatusCodes.BAD_REQUEST,
            "Both oldPassword and newPassword required"
            )
    }
    const user = await User.findById(userId)
    if (!user){
        throw new ApiError(
            httpStatusCodes.BAD_REQUEST,
            "user does not exist"
        )
    }
    try {
        // check if user input password is correct
        const isOldPasswordCorrect = user.isPasswordCorrect(oldPassword)
        if (!isOldPasswordCorrect){
            throw new ApiError(
                httpStatusCodes.BAD_REQUEST,
                "Password is incorrect"
            )
        }
        user.password = newPassword
        await user.save()
        return res
        .status(httpStatusCodes.OK)
        .json(new ApiResponse(
            httpStatusCodes.OK,
            {},
            "password is changed successfully"
        ))
    } catch (error) {
        throw new ApiError(
            httpStatusCodes.BAD_REQUEST, 
            "something went wrong while updating password"
        )
    }
})

const changeAvatar = asyncHandler(async (req, res)=>{
    // change profile pic
    const userId = req.user._id
    if (!userId){
        throw new ApiError(
            httpStatusCodes.BAD_REQUEST,
            "user id is missing"
        )
    }
    const user = await User.findById(userId)
    if (!user){
        throw new ApiError(
            httpStatusCodes.BAD_REQUEST,
            "user does not exists with this id"
        )
    }
    
    const localFilePath = req?.file?.path
    
    // upload on cloudinary
    const uploadedFile = await uploadSingleFile(localFilePath)
    
    // delete old asset only if the uploading file is successfull
    await deleteAsset(user.avatar.publicId)

    // also update in db
    user.avatar.publicId = uploadedFile.public_id
    user.avatar.publicUrl = uploadedFile.url
    await user.save()

    return res
    .status(httpStatusCodes.OK)
    .json(new ApiResponse(
        httpStatusCodes.OK,
        {},
        "avatar has been changed successfully"
    ))

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