import {asyncHandler} from '../utils/asyncHandler.js'
import {
    Api400Error,
    Api404Error
} from '../utils/ApiError.js'
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

    if (!title || !content){
        throw new Api400Error("Both title and content is required")
    }
    if (!userId){
        throw new Api400Error("User id is missing")
    }
    const user = await User.findById(userId)
   
    if (!user){
        throw new Api404Error(`User with id ${userId} is missing`)
    }
    const localFilePath = req?.file?.path
    const uploadedCoverPhoto = await uploadSingleFile(localFilePath)
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
    .status(httpStatusCodes.CREATED)
    .json(new ApiResponse(
        httpStatusCodes.CREATED,
        newBlog,
        "blog has been created successfully"
    ))
})

const deleteBlog = asyncHandler(async (req, res)=>{
    const userId = req.user._id
    const {blogId} = req.params

    if (!userId){
        throw new Api400Error("user id is missing")
    }
    if (!blogId){
        throw new Api400Error("blog id is missing")
    }
    const blog = await Blog.findByIdAndDelete(blogId)
    if (!blog){
        throw new Api404Error(`Blog with id ${blogId}`)
    }
    return res
    .status(httpStatusCodes.NO_CONTENT)
    .json(new ApiResponse(
        httpStatusCodes.NO_CONTENT,
        {},
        "blog has been deleted successfully"
    ))

})

const updateBlog = asyncHandler(async (req, res)=>{
    const userId = req.user._id
    const {blogId} = req.params
    if (!userId){
        throw new Api400Error("user id is missing")
    }
    
    if (!blogId){
        throw new Api400Error("blog id is missing")
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
        throw new Api404Error(`Blog with id ${blogId}`)
    }
    
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
    
})

const togglePublishBlog = asyncHandler(async (req, res)=>{
    const {blogId} = req.params
    if (!blogId){
        throw new Api404Error(`Blog with id ${blogId}`)
    }
    const blog = await Blog.findById(blogId)
    if (!blog){
        throw new Api404Error(`Blog with id ${blogId}`)
    }
    blog.publish = !blog.publish
    await blog.save({validateBeforeSave: false})
    return res
    .status(httpStatusCodes.OK)
    .json(new ApiResponse(
        httpStatusCodes.OK,
        blog,
        `Blog's publish has been updated to ${blog.publish}`
    ))
})

const togglePremiumBlog = asyncHandler(async (req, res)=>{
    const {blogId} = req.params
    if (!blogId){
        throw new Api404Error(`Blog with id ${blogId}`)
    }
    const blog = await Blog.findById(blogId)
    if (!blog){
        throw new Api404Error(`Blog with id ${blogId}`)
    }
    blog.premium = !blog.premium
    await blog.save({validateBeforeSave: false})
    return res
    .status(httpStatusCodes.OK)
    .json(new ApiResponse(
        httpStatusCodes.OK,
        blog,
        `Blog's premium has been updated to ${blog.premium}`
    ))
})

const getCurrentUserBlogs = asyncHandler(async (req, res)=>{
    
    const userId = req.user._id
    const {limit = 10, page = 1, ...query} = req.query
    const skips = (Number(page) - 1) * Number(limit)
    
    if (!userId){
        throw new Api400Error("user id is missing")
    }
    const user = await User.findById(userId)
    if (!user){
        throw new Api404Error(`User with id ${userId} is not found`)
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
    const blogs = await Blog.aggregate(aggregationPipeline)
    return res
    .status(httpStatusCodes.OK)
    .json(new ApiResponse(
        httpStatusCodes.OK,
        blogs,
        "Current User's blogs have fetched succesffully"
    ))


})

const getBlogById = asyncHandler(async (req, res)=>{
    const {blogId} = req.params
    if (!blogId){
        throw new Api400Error("Blog id is missing")
    }

    const blog = await Blog.findById(blogId)
    if (!blog){
        throw new Api404Error(`Blog with id ${id} not found`)
    }
    return res
    .status(httpStatusCodes.OK)
    .json(new ApiResponse(
        httpStatusCodes.OK,
        blog,
        "Blog has been fetched by blog id successfully"
    ))
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
    
    const blogs = await Blog.aggregate(aggregationPipeline)
        
    return res
    .status(httpStatusCodes.OK)
    .json(new ApiResponse(
        httpStatusCodes.OK,
        blogs,
        `All User's blogs have been fetched successfully`
    ))

})

const getPersonalizedBlogs = asyncHandler(async (req, res)=>{
    // only fetch blogs based on user's interest tags
    const userId = req.user._id
    const {limit = 10, page = 1} = req.query
    const skips = (Number(page) - 1) * Number(limit)

    if (!userId){
        throw new Api400Error("user id is missing")
    }
    const user = await User.findById(userId)
    if (!user){
        throw new Api404Error(`User with id ${userId} is not found`)
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
    
    const result = await Blog.aggregate(aggregationPipeline)

    return res
    .status(200)
    .json(new ApiResponse(
        httpStatusCodes.OK,
        result,
        `User's personalized blogs have been fetched successfully`
    ))
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



