import {asyncHandler} from '../utils/asyncHandler.js'
import {Api400Error, Api404Error} from '../utils/ApiError.js'
import {ApiResponse} from '../utils/ApiResponse.js'
import {httpStatusCodes} from '../constants/index.js'
import {Like} from '../models/like.model.js'
import {Comment} from '../models/comment.model.js'
import {Blog} from '../models/blog.model.js'


const toggleCommentLike = asyncHandler(async (req, res)=>{
    const {commentId} = req.params
    const userId = req.user._id
    
    if (!commentId){
        throw new Api400Error("Comment id is missing")
    }
    if (!userId){
        throw new Api400Error("User id is missing")
    }
    const comment = await Comment.findById(commentId)
    if (!comment){
        throw new Api404Error(`Comment with id ${commentId} is not found`)
    }
    const likeExist = await Like.findOne({comment: commentId, likedBy: userId})
    if (!likeExist){
        const like = await Like.create(
            {
                likedBy: userId,
                comment: commentId
            }
        )
        comment.likes += 1
        await comment.save()

        return res
        .status(httpStatusCodes.OK)
        .json(new ApiResponse(
            httpStatusCodes.OK,
            like,
            "Comment has been liked successfully"
        ))
    }
    else {
        await Like.deleteOne({likedBy: userId, comment: commentId})
        comment.likes -= 1
        await comment.save()

        return res
        .status(httpStatusCodes.OK)
        .json(new ApiResponse(
            httpStatusCodes.OK,
            {},
            "comment has been disliked successfully"
        ))
    }

})

const toggleBlogLike = asyncHandler(async (req, res)=>{
    const {blogId} = req.params
    const userId = req.user._id
    if (!blogId){
        throw new Api400Error("Blog id is missing")
    }
    if (!userId){
        throw new Api400Error("User id is missing")
    }
    const blog = await Blog.findById(blogId)
    if (!blog){
        throw new Api404Error(`Comment with id ${blogId} is not found`)
    }
    const blogExist = await Like.findOne({blog: blogId, likedBy: userId})
    if (!blogExist){
        const like = await Like.create(
            {
                likedBy: userId,
                blog: blogId
            }
        )
        blog.likes += 1
        await blog.save()

        return res
        .status(httpStatusCodes.OK)
        .json(new ApiResponse(
            httpStatusCodes.OK,
            like,
            "blog has been liked successfully"
        ))
    }
    else {
        await Like.deleteOne({likedBy: userId, blog: blogId})
        blog.likes -= 1
        await blog.save()

        return res
        .status(httpStatusCodes.OK)
        .json(new ApiResponse(
            httpStatusCodes.OK,
            {},
            "Blog has been disliked successfully"
        ))
        }

})

export {
    toggleBlogLike,
    toggleCommentLike
}