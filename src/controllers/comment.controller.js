import {asyncHandler} from '../utils/asyncHandler.js'
import {
    ApiError,
    Api400Error,
    Api404Error,
    Api500Error
} from '../utils/ApiError.js'
import {ApiResponse} from '../utils/ApiResponse.js'
import {httpStatusCodes} from '../constants/index.js'
import {Comment} from "../models/comment.model.js"
import { Blog } from '../models/blog.model.js'
import mongoose from 'mongoose'




const addCommentToBlog = asyncHandler(async (req, res)=>{
    const {blogId} = req.params
    const userId = req.user._id
    const {content} = req.body
    
    if (!content){
        throw new Api400Error('content is missing')
    }
    
    if (!userId){
        throw new Api400Error("User id is missing")
    }
    
    const blog = await Blog.findById(blogId)

    if (!blog){
        throw new Api404Error(`No blog with id ${blogId}`)
    }
    
    const comment = await Comment.create(
        {
            commentedBy: userId,
            content,
            blog: blogId
        }
    )
    // increase comment count in blog 
    blog.comments += 1
    await blog.save({validateBeforeSave: false})

    return res
    .status(httpStatusCodes.CREATED)
    .json(new ApiResponse(
        httpStatusCodes.CREATED,
        comment,
        "comment has been made successfully"
    ))
})


const editBlogComment = asyncHandler(async (req, res, next)=>{
    const {commentId} = req.params
    const userId = req.user._id
    const {content} = req.body
    
    if (!commentId){
        throw new Api400Error(`Comment id is missing`)
    }
    if (!userId){
        throw new Api400Error('User id is missing')
    }
    if (!content){
        throw new Api400Error("Content is missing")
    }
    const comment = await Comment.findOneAndUpdate(
        {_id: commentId},
        {$set: {content}},
        {new: true}
    )
    
    if (!comment){
        throw new Api404Error(`Comment with id: ${commentId} not found`)
    }
    
    return res
    .status(httpStatusCodes.OK)
    .json(new ApiResponse(
        httpStatusCodes.OK,
        comment,
        "Comment has been updated successfully"
    ))
})

const deleteBlogComment = asyncHandler(async (req, res)=>{
    const {commentId, blogId} = req.params
    const userId = req.user._id
    if (!commentId){
        throw new Api400Error('Comment Id is missing')
    }
    if (!userId){
        throw new Api400Error('User Id is missing')
    }
    if (!blogId){
        throw new Api400Error('Blog Id is missing')
    }
    const blog = await Blog.findById(blogId)
    if (!blog){
        throw new Api404Error(`Blog id with ${blogId} not found`)
    }
    const comment = await Comment.findByIdAndDelete(commentId)
    if (!comment){
        throw new Api404Error(`Comment with id ${commentId} not found`)
    }
    blog.comments -= 1
    await blog.save({validateBeforeSave: false})
        
    return res
    .status(httpStatusCodes.NO_CONTENT)
    .json(new ApiResponse(
        httpStatusCodes.NO_CONTENT,
        {},
        "Comment is deleted successfully"
    ))
})

const getBlogComments = asyncHandler(async (req, res)=>{
    const {blogId} = req.params
    const {limit=10, page=1} = req.query
    const skips = (Number(page) -1) * Number(limit)

    if (!blogId){
        throw new Api400Error(`Blog id is missing`)
    }
    const comments = await Comment.aggregate([
        {
            $match: {
                blog: new mongoose.Types.ObjectId(blogId)
            }
        },
        {
            $skip: skips
        },
        {
            $limit: Number(limit)
        }
    ])
    return res
    .status(httpStatusCodes.OK)
    .json(new ApiResponse(
        httpStatusCodes.OK,
        comments,
        "Comments have been fetched successfully"
    ))
})

export {
    addCommentToBlog,
    deleteBlogComment,
    editBlogComment,
    getBlogComments
}