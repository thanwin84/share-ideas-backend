import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from '../utils/ApiError.js'
import { User } from '../models/user.model.js'
import { Following } from '../models/following.model.js'
import {ApiResponse} from '../utils/ApiResponse.js'
import {httpStatusCodes} from '../constants/index.js'
import mongoose from 'mongoose'


const toggleFollowing = asyncHandler(async (req, res)=>{
    
    const {bloggerId} = req.params
    const userId = req.user._id

    if (!bloggerId){
        throw new ApiError(
            httpStatusCodes.BAD_REQUEST,
            "Blogger id is missing "
        )
    }
    if (!userId){
        throw new ApiError(
            httpStatusCodes.BAD_REQUEST,
            "User id is missing "
        )
    }
    
    const isAlreadyFollowing = await Following.findOne({
        follower: userId, 
        followedBlogger: bloggerId}
        )
    if (!isAlreadyFollowing){
        try {
            const following = await Following.create({
                follower: userId,
                followedBlogger: bloggerId
            })
            
            return res
            .status(httpStatusCodes.OK)
            .json(new ApiResponse(
                httpStatusCodes.OK,
                following,
                `User has followed succesffully`
            ))
        } catch (error) {
            throw new ApiError(
                httpStatusCodes.INTERNAL_SERVER_ERROR,
                "something went wrong while following blogger"
            )
        }
    }
    else {
        try {
            await Following.deleteOne({followedBlogger: bloggerId, follower: userId})

            return res
            .status(httpStatusCodes.OK)
            .json(new ApiResponse(
                httpStatusCodes.OK,
                "user has unfollowed successfully"
            ))
        } catch (error) {
            throw new ApiError(
                httpStatusCodes.INTERNAL_SERVER_ERROR,
                "something went wrong while unfollowing"
            )
        }
    }
})

const getFollowers = asyncHandler(async (req, res)=>{
    // check how many followers a blogger has
    const {limit = 10, page = 1} = req.query
    const skips = (Number(page) - 1) * Number(limit)
    const {bloggerId}= req.params
   
    if (!bloggerId){
        throw new ApiError(
            httpStatusCodes.BAD_REQUEST,
            "blogger id is missing "
        )
    }
    const aggregationPipeline = [
        {
          $match: {
            followedBlogger: new mongoose.Types.ObjectId(bloggerId)
          }
        },
        {
          $project: {
            follower: 1,
            _id: 0
          }
        },
        {
          $lookup: {
            from: "users",
            localField: "follower",
            foreignField: "_id",
            as: "user",
            pipeline: [
                {
                  $project: {
                    _id: 1,
                    username: 1,
                    avatar: 1
                  }
                }
              ]
          }
        }, 
        {
          $addFields: {
            user: {$first: "$user"}
          }
        },
        {
          $project: {
            user: 1
          }
        },
        {
            $skip: skips
        },
        {
            $limit: Number(limit)
        }
      ]
   
    try {
        const result = await Following.aggregate(aggregationPipeline)
        
        return res
        .status(httpStatusCodes.OK)
        .json(new ApiResponse(
            httpStatusCodes.OK,
            result,
            "List of followers have been has been fetched succesfully"
        ))
    } catch (error) {
        console.log(error)
        throw new ApiError(
            httpStatusCodes.INTERNAL_SERVER_ERROR,
            "something went wrong while fetching the list of followers"
        )
    }
})

const getFollwings = asyncHandler(async (req, res)=>{
    // get the list of following users
    const {userId} = req.params
    const {limit = 10, page = 1} = req.query
    const skips = (Number(page) - 1) * Number(limit)

    if (!userId){
        throw new ApiError(
            httpStatusCodes.BAD_REQUEST,
            "user id is missing"
        )
    } 
    const user = await User.findById(userId)
    if (!user){
        throw new ApiError(
            httpStatusCodes.OK,
            "use does not exist"
        )
    }
    const aggregationPipeline = [
        {
          $match: {
            follower: new mongoose.Types.ObjectId(userId)
          }
        },
        {
          $project: {
            followedBlogger: 1,
            _id: 0
          }
        },
        {
          $lookup: {
            from: "users",
            localField: "followedBlogger",
            foreignField: "_id",
            as: "user",
            pipeline: [
                {
                  $project: {
                    _id: 1,
                    username: 1,
                    avatar: 1
                  }
                }
              ]
          }
        }, 
        {
          $addFields: {
            user: {$first: "$user"}
          }
        },
        {
          $project: {
            user: 1
          }
        },
        {
            $skip: skips
        },
        {
            $limit: Number(limit)
        }
      ]
   
    try {
        const followings = await Following.aggregate(aggregationPipeline)

        return res
        .status(httpStatusCodes.OK)
        .json(new ApiResponse(
            httpStatusCodes.OK,
            followings,
            "List of followings has been fetched successfully"
        ))
    } catch (error) {
        throw new ApiError(
            httpStatusCodes.INTERNAL_SERVER_ERROR,
            "Something went wrong while fetching following list"
        )
    }

})

const getFollowersAndFollowingCount = asyncHandler(async (req, res)=>{
    const {userId} = req.params
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
    try {
        const followersCount = await Following.find({followedBlogger: userId}).countDocuments()
        const followingCount = await Following.find({follower: userId}).countDocuments()
        
        return res
        .status(httpStatusCodes.OK)
        .json(new ApiResponse(
            httpStatusCodes.OK,
            {followersCount, followingCount},
            "Followers  and following count has been fetched successsfully"
        ))
    } catch (error) {
        throw new ApiError(
            httpStatusCodes.BAD_REQUEST,
            "Something went wrong while fetching"
        )
    }
})
export {
    toggleFollowing,
    getFollowers,
    getFollwings,
    getFollowersAndFollowingCount
}