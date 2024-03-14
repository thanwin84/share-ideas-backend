import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from '../utils/ApiError.js'
import {Blog} from '../models/blog.model.js'
import { User } from '../models/user.model.js'
import {ApiResponse} from '../utils/ApiResponse.js'
import { 
    deleteAsset,
    uploadSingleFile
    } from '../utils/cloudinary.js'
import {httpStatusCodes} from '../constants/index.js'
import mongoose from 'mongoose'



const createBlog = asyncHandler(async (req, res)=>{
    const {title, content, tags, premium} = req.body
    const userId = req.user._id

    if (!title && !content){
        throw new ApiError(
            httpStatusCodes.BAD_REQUEST,
            "title and content both are required"
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
            `User does not exist with user id ${userId}`
            )
    }
    const localFilePath = req?.file?.path
    const uploadedCoverPhoto = await uploadSingleFile(localFilePath)
    try {
        const newBlog = await Blog.create({
            title,
            content,
            owner: userId,
            tags,
            premium: premium ? premium: false,
            coverPhoto: {
                publicId: uploadedCoverPhoto.public_id,
                publicUrl: uploadedCoverPhoto.url
            }
            
        })
        return res
        .status(httpStatusCodes.OK)
        .json(new ApiResponse(
            httpStatusCodes.OK,
            newBlog,
            "blog has been created successfully"
        ))

    } catch (error) {
        throw new ApiError(
            httpStatusCodes.INTERNAL_SERVER_ERROR,
        "something went wrong while creating new blog"
        )
    }
})

const deleteBlog = asyncHandler(async (req, res)=>{
    const userId = req.user._id
    const {blogId} = req.params

    if (!userId){
        throw new ApiError(
            httpStatusCodes.BAD_REQUEST,
            "user id is missing"
        )
    }
    if (!blogId){
        throw new ApiError(
            httpStatusCodes.BAD_REQUEST,
            "blog id is missing"
        )
    }
    try {
        const blog = await Blog.findByIdAndDelete(blogId)
        if (!blog){
            throw new ApiError(
                httpStatusCodes.BAD_REQUEST,
                "blog does not exists"
            )
        }
        return res
        .status(httpStatusCodes.OK)
        .json(new ApiResponse(
            httpStatusCodes.OK,
            {},
            "blog has been deleted successfully"
        ))

    } catch (error) {
        throw new ApiError(
            httpStatusCodes.INTERNAL_SERVER_ERROR,
            "something went wrong while deleting blog"
        )
    }

})

const updateBlog = asyncHandler(async (req, res)=>{
    const userId = req.user._id
    const {blogId} = req.params
    if (!userId){
        throw new ApiError(
            httpStatusCodes.BAD_REQUEST,
            "user id is missing"
        )
    }
    
    if (!blogId){
        throw new ApiError(
            httpStatusCodes.BAD_REQUEST,
            "blog id is missing"
        )
    }
    const localFilePath = req?.file?.path
    const update = {...req.body}
    
    // update cover photo only if user has updated
    if (localFilePath){
        const updatedCoverPhoto = await uploadSingleFile(localFilePath)
        update.coverPhoto = {
            publicId: updatedCoverPhoto.public_id,
            publicUrl: updatedCoverPhoto.url
        }
    }
    // check if the blog exist
    const blog = await Blog.findById(blogId)
    if (!blog){
        throw new ApiError(
            httpStatusCodes.BAD_REQUEST,
            "blog does not exist"
        )
    }
    
    try {
        
        const updatedBlog = await Blog.findByIdAndUpdate(
            blogId,
            {$set: update},
            {new: true}
        )
        
        // if user has updated cover photo, delete the old cover photo cloudinary
        if (update.coverPhoto){
            await deleteAsset(blog.coverPhoto.publicId)
        }

        return res
        .status(httpStatusCodes.OK)
        .json(new ApiResponse(
            httpStatusCodes.OK,
            updatedBlog,
            "blog has updated successfully"
        ))

    } catch (error) {
        
        throw new ApiError(
            httpStatusCodes.INTERNAL_SERVER_ERROR,
            "something went wrong while updating blog"
        )
    }
    
})

const togglePublishBlog = asyncHandler(async (req, res)=>{
    const {blogId} = req.params
    if (!blogId){
        throw new ApiError(
            httpStatusCodes.BAD_REQUEST,
            "blog id is missing"
        )
    }
    const blog = await Blog.findById(blogId)
    if (!blog){
        throw new ApiError(
            httpStatusCodes.BAD_REQUEST,
            "blog does not exit"
        )
    }
    blog.publish = !blog.publish
    try {
        await blog.save({validateBeforeSave: false})
        return res
        .status(httpStatusCodes.OK)
        .json(new ApiResponse(
            httpStatusCodes.OK,
            blog,
            `Blog's publish has been updated to ${blog.publish}`
        ))

    } catch (error) {
        throw new ApiError(
            httpStatusCodes.INTERNAL_SERVER_ERROR,
            "something went wrong while updating publish status"
        )
    }
})

const togglePremiumBlog = asyncHandler(async (req, res)=>{
    const {blogId} = req.params
    if (!blogId){
        throw new ApiError(
            httpStatusCodes.BAD_REQUEST,
            "blog id is missing"
        )
    }
    const blog = await Blog.findById(blogId)
    if (!blog){
        throw new ApiError(
            httpStatusCodes.BAD_REQUEST,
            "blog does not exit"
        )
    }
    blog.premium = !blog.premium
    try {
        await blog.save({validateBeforeSave: false})
        return res
        .status(httpStatusCodes.OK)
        .json(new ApiResponse(
            httpStatusCodes.OK,
            blog,
            `Blog's premium has been updated to ${blog.premium}`
        ))

    } catch (error) {
        throw new ApiError(
            httpStatusCodes.INTERNAL_SERVER_ERROR,
            "something went wrong while updating premium status"
        )
    }
})

const getCurrentUserBlogs = asyncHandler(async (req, res)=>{
    
    const userId = req.user._id
    const {limit = 10, page = 1, ...query} = req.query
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
            httpStatusCodes.BAD_REQUEST,
            "user does not exist"
        )
    }
    const aggregationPipeline = [
        {
            $match: {owner: new mongoose.Types.ObjectId(userId),...query}
        },
        {
            $skip: Number(skips)
        },
        {
            $limit: Number(limit)
        }
    ]
    try {
        const blogs = await Blog.aggregate(aggregationPipeline)
        return res
        .status(httpStatusCodes.OK)
        .json(new ApiResponse(
            httpStatusCodes.OK,
            blogs,
            "Current User's blogs have fetched succesffully"
        ))
    } catch (error) {
        throw new ApiError(
            httpStatusCodes.OK,
            "something went wrong while fetching blogs"
            )
    }


})

const getBlogById = asyncHandler(async (req, res)=>{
    const {blogId} = req.params
    if (!blogId){
        throw new ApiError(
            httpStatusCodes.BAD_REQUEST,
            "blog id is missing"
        )
    }
    
    try {
        const blog = await Blog.findById(blogId)
        if (!blog){
            throw new ApiError(
                httpStatusCodes.BAD_REQUEST,
                "blog does not exist"
            )
        }
        return res
        .status(httpStatusCodes.OK)
        .json(new ApiResponse(
            httpStatusCodes.OK,
            blog,
            "Blog has been fetched by blog id successfully"
        ))
    } catch (error) {
        throw new ApiError(
            httpStatusCodes.INTERNAL_SERVER_ERROR,
            "something went wrong while fetching blog by blog id"
        )
    }
})


function handleRange(min, max, query, field){
    if (max && min){
        query[field] = {$gte: parseInt(min), $lte: parseInt(max)}
    }else if (max){
        query[field] = {$gte: parseInt(max)}
    }
    else if (min){
        query[field] = {$lte: parseInt(min)}
    }
}


const getBlogs = asyncHandler(async (req, res)=>{
    const {
        limit = 10, 
        page = 1, 
        featured, 
        premium, 
        owner, 
        maxReads, 
        minReads,
        title,
        maxLikes,
        minLikes,
        tags,
        sortBy
    } = req.query
    const skips = (Number(page) - 1) * Number(limit)
    
    const query = {}
    
    if (featured){
        query.featured = featured === "true"? true: false
    }
    if (premium){
        query.premium = premium === "true"? true: false
    }
    if (owner){
        query.owner = new mongoose.Types.ObjectId(owner)
    }
    if (title){
        query.title = {$regex: title, $options: 'i'}
    }
    handleRange(minReads, maxReads, query, "reads")
    handleRange(minLikes, maxLikes, query, "likes")
    
    if (tags && Array.isArray(tags)){
       let values = tags.map(tag => tag.toLowerCase()) 
       query.tags = {$all: values}
    }
    const [sortField, by] = sortBy.split(":")
    

    const aggregationPipeline = [
        {
            $match: {...query}
        },
        {
            $skip: skips
        },
        {
            $limit: Number(limit)
        }
    ]
    if (sortField){
        aggregationPipeline.push(
            {
                $sort: {[sortField]: by === 'descending'? -1: 1}
            }
        )
    }
    

    try {
        const blogs = await Blog.aggregate(aggregationPipeline)
        
        return res
        .status(httpStatusCodes.OK)
        .json(new ApiResponse(
            httpStatusCodes.OK,
            blogs,
            `All User's blogs have been fetched successfully`
        ))

    } catch (error) {
        throw new ApiError(
            httpStatusCodes.INTERNAL_SERVER_ERROR,
            "Somethign went wrong while fetching all blogs"
        )
    }

})

const getPersonalizedBlogs = asyncHandler(async (req, res)=>{
    // only fetch blogs based on user's interest tags
    const userId = req.user._id
    const {limit = 10, page = 1} = req.query
    const skips = (Number(page) - 1) * Number(limit)

    if (!userId){
        throw new ApiError(
            httpStatusCodes.OK,
            "user id is missing"
        )
    }
    const user = await User.findById(userId)
    if (!user){
        throw new ApiError(
            httpStatusCodes.BAD_REQUEST,
            "user does not exit"
        )
    }
    const tags = user.interests

    const aggregationPipeline = [
        {
            $match: {
                tags: {$in: tags}
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
        const result = await Blog.aggregate(aggregationPipeline)

        return res
        .status(200)
        .json(new ApiResponse(
            httpStatusCodes.OK,
            result,
            `User's personalized blogs have been fetched successfully`
        ))
    } catch (error) {
        throw new ApiError(
            httpStatusCodes.INTERNAL_SERVER_ERROR,
            "something went wrong while fetching blogs"
        )
    }

})

export {
    createBlog,
    deleteBlog,
    updateBlog,
    togglePublishBlog,
    togglePremiumBlog,
    getCurrentUserBlogs,
    getBlogById,
    getBlogs,
    getPersonalizedBlogs
}



