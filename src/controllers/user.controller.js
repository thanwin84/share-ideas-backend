import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from '../utils/ApiError.js'
import {User} from '../models/user.model.js'
import {ApiResponse} from '../utils/ApiResponse.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import {httpStatusCodes} from '../constants/index.js'

async function uploadSingleFile(req){
    const localFilePath = req?.file?.path
    const uploadedFile = await uploadOnCloudinary(localFilePath)
    if (!uploadedFile){
        throw new ApiError(httpStatusCodes.BAD_REQUEST, "file is missing")
    }
    return uploadedFile
}



const register = asyncHandler(async (req, res)=>{
    // register a new user
    
    const {firstName, lastName, password,  username, email} = req.body

    if (
        [firstName, lastName, password, username, email]
        .some(field => field?.trim() === "")
    ){
        throw new ApiError(httpStatusCodes.BAD_REQUEST, "all fields are required")
    }
    const userExists = await User.findOne({username: username})
    if (userExists){
        throw new ApiError(httpStatusCodes.CONFLICT, "user already exists")
    }
    // upload file to cloudinary
    const uploadedFile = await uploadSingleFile(req)
    
    try {
        const newUser = await User.create({
            firstName,
            lastName,
            username,
            email,
            password,
            avatar: {
                publicId: uploadedFile.public_id,
                publicUrl: uploadedFile.url
            }
        })
        
        return res
        .status(200)
        .json(new ApiResponse(
            200,
            newUser,
            "user has been registered successfully"
        ))
    } catch (error) {
        // console.log(error)
        throw new ApiError(
            httpStatusCodes.INTERNAL_SERVER_ERROR, 
            "something went wrong while registering user"
            )
    }

})

const login = asyncHandler(async (req, res)=>{
    // user can login with username or email
    const {password, username, email} = req.body
    if (!password && !(username || email)){
        throw new ApiError(
            httpStatusCodes.BAD_REQUEST, 
            "both username and passwords are required")
    }
    const user = await User.findOne({$or: [{username}, {email}]})
    if (!user){
        throw new ApiError(httpStatusCodes.BAD_REQUEST, "user does not exist")
    }
    const isPasswordValid = await user.isPasswordCorrect(password)
    const options = {
        httpOnly: true,
        secure: true
    }
    if (isPasswordValid){

        const accessToken = await user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()
        user.refreshToken = refreshToken
        user.save({validateBeforeSave: false})

        return res
        .status(httpStatusCodes.OK)
        .cookie('accessToken', accessToken, options)
        .cookie('refreshToken', refreshToken, options)
        .json(new ApiResponse(
            httpStatusCodes.OK,
            user,
            "user has been logged in successfully"
        ))
    } else {
        throw new ApiError(
            httpStatusCodes.BAD_REQUEST, 
            "password or email is not correct"
            )
    }
})

const logout = asyncHandler(async (req, res)=>{
    // get the user id from req.user
    const userId = req.user._id
    if (!userId){
        throw new ApiError(httpStatusCodes.BAD_REQUEST, "user id is missing")
    }
    // access token is stored in either authorization header or secured cookie
    // delete cookie from authorization header
    if (req.Authorization){
        delete req.headers.Authorization
    }
    
    
    try {
        const update = await User.findByIdAndUpdate(
            userId,
            {$set: {refreshToken: null}}
        )
    } catch (error) {
        throw new ApiError(
            httpStatusCodes.INTERNAL_SERVER_ERROR,
            "Something went wrong while updating"
            )
    }
    const options = {
        httpOnly: true,
        secure: true
    }
    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(
        httpStatusCodes.OK,
        {},
        "user has been logged out successfully"
    ))
})

export {
    register,
    login,
    logout
}