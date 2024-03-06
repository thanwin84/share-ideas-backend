import mongoose from "mongoose";
import PasswordHelper from "../utils/passwordHelper.js";
import jwt from 'jsonwebtoken'

const avatarSchema = new mongoose.Schema({
    publicUrl: {
        type: String, // cloudinary url
        required: true
    },
    // public id will be used to delete the asset from cloudinary
    publicId: {
        type: String,
        required: true
    }
})
const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true
    },
    password: {
        type: String,
        required: [true, "Password is required"]
    },
    interests: [
       {
        type: String
       }
    ],
    avatar: avatarSchema,
    admin: {
        type: Boolean,
        default: false
    },
    email: {
        type: String,
        unique: true,
        trim: true,
        lowercase: true
    }

}, {timestamps: true})

userSchema.pre('save', async function(next){
    if (!this.isModified("password")){
        return next()
    } else {
        this.password = await PasswordHelper.hashPassword(this.password)
        next()
    }
})

userSchema.methods.isPasswordCorrect = async function(password){
    const [salt, hashedPassword] = this.password.split(":")
    return await PasswordHelper.isPasswordCorrect(password, salt, hashedPassword)
}

userSchema.methods.generateAccessToken = function(){
    const accessToken = jwt.sign(
        {
            _id: this._id,
            username: this.username
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
    return accessToken
}

userSchema.methods.generateRefreshToken = function(){
    const refreshToken = jwt.sign(
        {
            _id: this._id,
            username: this.username
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
    return refreshToken
}

export const User = mongoose.model('User', userSchema)



// const newUser = new User({
//     firstName: "John",
//     lastName: "Doe",
//     username: "johndoe",
//     password: "password123",
//     interests: ["coding", "reading"],
//     admin: false
// })
// newUser.save()
// console.log(newUser)