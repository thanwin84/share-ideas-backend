import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from '../utils/ApiError.js'
import {ApiResponse} from '../utils/ApiResponse.js'
import {httpStatusCodes} from '../constants/index.js'
import {Comment} from "../models/comment.model.js"
import { Blog } from '../models/blog.model.js'




const addCommentToBlog = asyncHandler(async (req, res)=>{
    const {blogId} = req.params
    const userId = req.user._id
    const {content} = req.body
    
    if (!content){
        throw new ApiError(
            httpStatusCodes.BAD_REQUEST,
            "content is missing"
        )
    }
    
    if (!userId){
        throw new ApiError(
            httpStatusCodes.BAD_REQUEST,
            "User id is missing"
        )
    }
    
    const blog = await Blog.findById(blogId)

    if (!blog){
        throw new ApiError(
            httpStatusCodes.NOT_FOUND,
            `No blog with id ${blogId}`
        )
    }
    
    try {
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
        .status(httpStatusCodes.OK)
        .json(new ApiResponse(
            httpStatusCodes.OK,
            comment,
            "comment has been made successfully"
        ))
    } catch (error) {
        throw new ApiError(
            httpStatusCodes.INTERNAL_SERVER_ERROR,
            "Something went wrong while commenting"
        )
    }
    
})


const editBlogComment = asyncHandler(async (req, res)=>{
    const {commentId} = req.params
    const userId = req.user._id
    const {content} = req.body
    
    if (!commentId){
        throw new ApiError(
            httpStatusCodes.BAD_REQUEST,
            "Comment id is missing"
        )
    }
    if (!userId){
        throw new ApiError(
            httpStatusCodes.BAD_REQUEST,
            "user id is missing"
        )
    }
    if (!content){
        throw new ApiError(
            httpStatusCodes.BAD_REQUEST,
            "content is missing"
        )
    }
    try {
        const comment = await Comment.findOneAndUpdate(
            {_id: commentId},
            {$set: {content}},
            {new: true}
        )
        if (!comment){
            throw new ApiError(
                httpStatusCodes.NOT_FOUND,
                `Comment does not exist with id ${commentId}`
            )
        }
        
        return res
        .status(httpStatusCodes.OK)
        .json(new ApiResponse(
            httpStatusCodes.OK,
            comment,
            "Comment has been updated successfully"
        ))
    } catch (error) {
        if (error instanceof ApiError){
            throw error
        }
        throw new ApiError(
            httpStatusCodes.INTERNAL_SERVER_ERROR,
            "Something went wrong while updating comment"
        )
    }
})

const deleteBlogComment = asyncHandler(async (req, res)=>{
    const {commentId, blogId} = req.params
    const userId = req.user._id
    if (!commentId){
        throw new ApiError(
            httpStatusCodes.BAD_REQUEST,
            "comment id is missing"
        )
    }
    if (!userId){
        throw new ApiError(
            httpStatusCodes.BAD_REQUEST,
            "User id is missing"
        )
    }
    if (!blogId){
        throw new ApiError(
            httpStatusCodes.BAD_REQUEST,
            "blog id  is missing"
        )
    }
    const blog = await Blog.findById(blogId)
    if (!blog){
        throw new ApiError(
            httpStatusCodes.NOT_FOUND,
            "Blog does not exist"
        )
    }
    try {
        const comment = await Comment.findByIdAndDelete(commentId)
        if (!comment){
            throw new ApiError(
                httpStatusCodes.NOT_FOUND,
                "Comment does not exits"
            )
        }
        blog.comments -= 1
        await blog.save({validateBeforeSave: false})
        
        return res
        .status(httpStatusCodes.OK)
        .json(new ApiResponse(
            httpStatusCodes.OK,
            {},
            "Comment is deleted successfully"
        ))
    } catch (error) {
        
        throw new ApiError(
            httpStatusCodes.INTERNAL_SERVER_ERROR,
            "something went wrong while deleting comment"
        )
    }

})

const getBlogComments = asyncHandler(async (req, res)=>{
    const {blogId} = req.params
    const {limit=10, page=1} = req.query
    const skips = (Number(page) -1) * Number(limit)

    if (!blogId){
        throw new ApiError(
            httpStatusCodes.BAD_REQUEST,
            "blog is missing"
        )
    }
    try {
        const comments = await Comment.aggregate([
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
    
    } catch (error) {
        throw new ApiError(
            httpStatusCodes.INTERNAL_SERVER_ERROR,
            "Something went wrong"
        )
    }
})

export {
    addCommentToBlog,
    deleteBlogComment,
    editBlogComment,
    getBlogComments
}