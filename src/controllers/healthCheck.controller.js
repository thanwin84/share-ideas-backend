import {asyncHandler} from '../utils/asyncHandler.js'

const getSampleData = asyncHandler(async (req, res)=>{
    return res
    .status(200)
    .send({success: true, message: "Health check is done"})
})

export {
    getSampleData
}