import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from '../utils/ApiError.js'
import {Blog} from '../models/blog.model.js'
import { User } from '../models/user.model.js'
import {ApiResponse} from '../utils/ApiResponse.js'
import {
    uploadOnCloudinary, 
    deleteAsset,
    uploadSingleFile
    } from '../utils/cloudinary.js'
import {httpStatusCodes} from '../constants/index.js'


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

    if (localFilePath){
        const updatedCoverPhoto = await uploadSingleFile(localFilePath)
        update.coverPhoto = {
            publicId: updatedCoverPhoto.public_id,
            publicUrl: updatedCoverPhoto.url
        }
    }
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
        
        // delete the cover photo
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
        console.log(error)
        throw new ApiError(
            httpStatusCodes.INTERNAL_SERVER_ERROR,
            "something went wrong while updating blog"
        )
    }
    
})

const togglePublishBlog = asyncHandler(async (req, res)=>{

})

const togglePremiumBlog = asyncHandler(async (req, res)=>{

})

const getCurrentUserBlogs = asyncHandler(async (req, res)=>{

})

const getBlogById = asyncHandler(async (req, res)=>{

})

const getBlogsByUserId = asyncHandler(async (req, res)=>{

})

const getAllUserBlogs = asyncHandler(async (req, res)=>{

})

// Todo: under every blog post should some related blog post

export {
    createBlog,
    deleteBlog,
    updateBlog,
    togglePublishBlog,
    togglePremiumBlog,
    getCurrentUserBlogs,
    getBlogById,
    getBlogsByUserId,
    getAllUserBlogs
}



