import {asyncHandler} from '../utils/asyncHandler.js'
import {
    Api400Error,
    Api404Error
} from '../utils/ApiError.js'
import {User} from '../models/user.model.js'
import {Blog} from "../models/blog.model.js"
import { Following } from '../models/following.model.js'
import {ApiResponse} from '../utils/ApiResponse.js'
import { 
     deleteAsset,
     uploadSingleFile
    } from '../utils/cloudinary.js'
import {httpStatusCodes} from '../constants/index.js'


const updateUserDetaiils = asyncHandler(async(req, res)=>{
    //update username, first name, last name, email
    const userId = req.user._id
    const {username, firstName, lastName, email} = req.body
    if (!username && !firstName && !lastName && !email){
        throw new Api400Error("At least one feild is required")
    }
    if (!userId){
        throw new Api400Error("user id is missing")
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
    if (!oldPassword || !newPassword){
        throw new Api400Error("Both old password and new password is required")
    }
    const user = await User.findById(userId)
    if (!user){
        throw new Api404Error(`User with id ${userId} is not found`)
    }
    // check if user input password is correct
    const isOldPasswordCorrect = user.isPasswordCorrect(oldPassword)
    if (!isOldPasswordCorrect){
        throw new Api400Error("Password is not correct")
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
})

const changeAvatar = asyncHandler(async (req, res)=>{
    // change profile pic
    const userId = req.user._id
    if (!userId){
        throw new Api400Error("User id is missing")
    }
    const user = await User.findById(userId)
    if (!user){
        throw new Api404Error(`User with id ${userId} is not found`)
    }
    
    const localFilePath = req?.file?.path
    if (!localFilePath){
        throw new Api400Error("Local file is missing")
    }
    
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
        throw new Api400Error("User id is missing")
    }
    const user = await User.findById(userId).select('-password -refreshToken')
    if (!user){
        throw new Api400Error(`User with id ${userId} is not found`)
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
        throw new Api400Error("User id is missing")
    }
    const user = await User.findById(userId).select('-password -refreshToken')
    if (!user){
        throw new Api400Error(`User with id ${userId} is not found`)
    }
    return res
    .status(httpStatusCodes.OK)
    .json(new ApiResponse(
        httpStatusCodes.OK,
        user,
        "user details have been fetched successfully"
    ))
})

// for two step authentication
const addPhoneNumber = asyncHandler(async(req, res)=>{
    const {phoneNumber} = req.body
    const userId = req.user._id
    if (!phoneNumber){
        throw new Api400Error("Phone number is missing")
    }
    if (!userId){
        throw new Api400Error("User id is missing")
    }
    const user = await User.findById(userId)
    if (!user){
        throw new Api404Error(`User with id ${userId} is not found`)
    }
    user.authentication.phoneNumber = phoneNumber
    user.save({validateBeforeSave: false})

    return res
    .status(httpStatusCodes.OK)
    .json(new ApiResponse(
        httpStatusCodes.OK,
        {},
        "phone number has been updated"
    ))

})

const toggleTwoStepAuthentication = asyncHandler(async(req, res)=>{
    const userId = req.user._id
    if (!userId){
        throw new Api400Error("User id is missing")
    }
    const user = await User.findById(userId)
    if (!user){
        throw new Api404Error(`User with id ${userId} is not found`)
    }
    const status = !user.authentication.twoStepAuthentication
        
    user.authentication.twoStepAuthentication = status
    await user.save({validateBeforeSave: false})

    return res
    .status(httpStatusCodes.OK)
    .json(new ApiResponse(
        httpStatusCodes.OK,
        {},
        `Two step authentication is set to ${status}`
    ))

})


const deleteAccount = asyncHandler(async (req, res)=>{
    const userId = req.user._id

    if (!userId){
        throw new Api400Error(`User id is missing`)
    }
    const user = await User.findById(userId)

    if (!user){
        throw new Api404Error(`User with id ${userId} is not found`)
    }
    // delete all the blogs
    await Blog.deleteMany({owner: userId})
    await Following.deleteMany({followedBlogger: userId})
    await User.deleteOne({_id: userId})
    // delete cookie if it is set in Authorization Header
    if (req.headers.Authorization){
        delete req.headers.Authorization
    }
    const options = {
        httpOnly: true,
        secure: true
    }
    return res
    .status(httpStatusCodes.OK)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(
        httpStatusCodes.OK,
        {},
        "acoount has been deleted successfully"
    ))
})

export {
    updateUserDetaiils,
    changePassword,
    changeAvatar,
    getCurrentUser,
    getUserDetailsById,
    addPhoneNumber,
    toggleTwoStepAuthentication,
    deleteAccount
}