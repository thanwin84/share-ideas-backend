import {asyncHandler} from '../utils/asyncHandler.js'
import {
    Api400Error,
    Api404Error,
    Api409Error,
} from '../utils/ApiError.js'
import {User} from '../models/user.model.js'
import {ApiResponse} from '../utils/ApiResponse.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import twillioService from '../thirdParty/twillioService.js'
import {httpStatusCodes} from '../constants/index.js'

async function uploadSingleFile(localFilePath){
    const uploadedFile = await uploadOnCloudinary(localFilePath)
    if (!uploadedFile){
        throw new Api400Error("file is missing")
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
        throw new Api400Error("All fields are required")
    }

    const userExists = await User.findOne({username: username})
    if (userExists){
        throw new Api409Error("User already exists")
    }
    const localFilePath = req?.file?.path
    // upload file to cloudinary
    const uploadedFile = await uploadSingleFile(localFilePath)
    
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
    .status(httpStatusCodes.CREATED)
    .json(new ApiResponse(
        200,
        user,
        "user has been registered successfully"
    ))

})

const login = asyncHandler(async (req, res)=>{
    // user can login with username or email
    const {password, username, email} = req.body
    if (!password && !(username || email)){
        throw new Api400Error("username or email and password is required")
    }
    const user = await User.findOne({$or: [{username}, {email}]})
    if (!user){
        throw new Api404Error(`User is  not found`)
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
            {...user.toObject(), 
                password: undefined, 
                refreshToken: undefined
            },
            "user has been logged in successfully"
        ))
    } else {
        throw new Api400Error("Password or email is incorrect")
    }
})

const logout = asyncHandler(async (req, res)=>{
    // get the user id from req.user
    const userId = req.user._id
    if (!userId){
        throw new Api400Error('User id is missing')
    }
    // access token is stored  either in authorization header or secured cookie
    // delete cookie from authorization header
    if (req.headers.Authorization){
        delete req.headers.Authorization
    }
    
    // set refresh token to null
    await User.findByIdAndUpdate(
        userId,
        {$set: {refreshToken: null}}
    )
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
    
    const {deliveryMethod} = req.body // user can choose to get verification code via sms or whatsapp
    const userId = req.user._id
    if (!deliveryMethod){
        throw new Api400Error("Delivery method is missing")
    }
    if (!userId){
        throw new Api400Error("user id is missing")
    }
    const user = await User.findById(userId)
    if (!user){
        throw new Api404Error(`User with id ${userId} not found`)
    }
    const phoneNumber = user.authentication.phoneNumber
    if (!phoneNumber){
        throw new Api400Error("User has not registerd phone Number")
    }
    // user has already registed phone number,
    // so we can send verification message
    const status = await twillioService.sendVerificationToken(phoneNumber, deliveryMethod)
    return res
    .status(httpStatusCodes.OK)
    .json(new ApiResponse(
        httpStatusCodes.OK,
        {},
        status,
        `Verication code has been sent to ${phoneNumber}`
    ))
})

const checkVerificationCode = asyncHandler(async(req, res)=>{
    const {code} = req.body
    const userId = req.user._id
    if (!code){
        throw new Api400Error("Code is missing")
    }
    if (!userId){
        throw new Api400Error("User id is missing")
    }
    const user = await User.findById(userId)

    if (!user){
        throw Api404Error(`User with id ${userId} is not found`)
    }
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
})

export {
    register,
    login,
    logout,
    sendVerificationCode,
    checkVerificationCode
}