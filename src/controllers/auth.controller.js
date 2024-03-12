import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from '../utils/ApiError.js'
import {User} from '../models/user.model.js'
import {ApiResponse} from '../utils/ApiResponse.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import {httpStatusCodes} from '../constants/index.js'
import twillioService from '../thirdParty/twillioService.js'

async function uploadSingleFile(localFilePath){
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
    const localFilePath = req?.file?.path
    // upload file to cloudinary
    const uploadedFile = await uploadSingleFile(localFilePath)
    
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
        const user = {...newUser.toObject(), password: undefined}
        
        return res
        .status(200)
        .json(new ApiResponse(
            200,
            user,
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
            {...user.toObject(), password: undefined, refreshToken: undefined},
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
    // access token is stored  either in authorization header or secured cookie
    // delete cookie from authorization header
    if (req.headers.Authorization){
        delete req.headers.Authorization
    }
    
    
    try {
        // set refresh token to null
        await User.findByIdAndUpdate(
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

const sendVerificationCode = asyncHandler(async(req, res)=>{
    //  first check if the user has registered phone number
    const {via} = req.body
    const userId = req.user._id
    if (!via){
        throw new ApiError(
            httpStatusCodes.BAD_REQUEST,
            "via is missing"
        )
    }
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
            "user does not exist"
        )
    }
    const phoneNumber = user.authentication.phoneNumber
    if (!phoneNumber){
        throw new ApiError(
            httpStatusCodes.BAD_REQUEST,
            "user has not registered phone number yet"
            )
    }
    try {
        // user has already registed phone number,
        // so we can send verification message
        const status = await twillioService.sendVerificationToken(phoneNumber, via)
        return res
        .status(httpStatusCodes.OK)
        .json(new ApiResponse(
            httpStatusCodes.OK,
            {},
            status,
            `Verication code has been sent to ${phoneNumber}`
        ))

    } catch (error) {
        console.log(error)
        throw new ApiError(
            httpStatusCodes.INTERNAL_SERVER_ERROR,
            "something went wrong while sending the verification code"
        )
    }
})

const checkVerificationCode = asyncHandler(async(req, res)=>{
    const {code} = req.body
    const userId = req.user._id
    if (!code){
        throw new ApiError(
            httpStatusCodes.BAD_REQUEST,
            "verication code is missing"
        )
    }
    if (!userId){
        throw new ApiError(
            httpStatusCodes.BAD_REQUEST,
            "user id is missing"
        )
    }
    const user = await User.findById(userId)

    try {
        const isCodeValid = await twillioService.verificationCheck(user.authentication.phoneNumber, code)
        if (isCodeValid === 'approved'){
            return res
            .status(httpStatusCodes.OK)
            .json(new ApiResponse(
                httpStatusCodes.OK,
                isCodeValid,
                "user has been approved successfully"
            ))
        } 
    } catch (error) {
        throw new ApiError(
            httpStatusCodes.BAD_REQUEST,
            "something went wrong while sending verification code"
        )
    }
})

export {
    register,
    login,
    logout,
    sendVerificationCode,
    checkVerificationCode
}