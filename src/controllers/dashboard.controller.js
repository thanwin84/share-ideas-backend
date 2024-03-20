import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiResponse} from '../utils/ApiResponse.js'
import {Api400Error} from '../utils/ApiError.js'
import {Blog} from '../models/blog.model.js'
import mongoose from 'mongoose'


const getBloggerActivityStatistic = asyncHandler(async (req, res)=>{
    // get total likes on all blogs, get total likes on all comments, get total reads, total comments
    const userId = req.user._id
    if (!userId){
        throw new Api400Error("User id is missing")
    }
    const detailsAggregationPipeline = [
        {
          $match: {
            owner: new mongoose.Types.ObjectId(userId)
          }
        },
        {
          $group: {
            _id: "$owner",
            likes: {$sum: "$likes"},
            comments: {$sum: "$comments"},
            reads: {$sum: "$reads"},
            blogs: {$sum: 1}
          }
        }
    ]
    const result = await Blog.aggregate(detailsAggregationPipeline)

    return res
    .status(200)
    .json(new ApiResponse(
        200,
        result,
        "Details of a blogger activity has been fetched successfully"
    ))

})

export {
    getBloggerActivityStatistic
}