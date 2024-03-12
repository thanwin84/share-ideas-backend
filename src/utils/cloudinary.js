import {v2 as cloudinary} from 'cloudinary';
import {ApiError} from './ApiError.js'
import fs from 'fs'
import {httpStatusCodes} from '../constants/index.js'
          
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath)=>{
    try {
        if (!localFilePath) return null

        const response = await cloudinary.uploader.upload(
            localFilePath,
            {
                resource_type: "auto"
            }
        )
        // since file has been uploaded successfully, remove temporary saved file
        fs.unlinkSync(localFilePath)
        return response
    } catch (error) {
        // error has occured, so unlink the file again
        fs.unlinkSync(localFilePath)
        return null
    }
}


const deleteAsset = async(publicId)=>{
    try {
        const response = await cloudinary.uploader.destroy(publicId)
        return response
    } catch (error) {
        console.log(error)
    }
}
async function uploadSingleFile(localFilePath){
    const uploadedFile = await uploadOnCloudinary(localFilePath)
    if (!uploadedFile){
        throw new ApiError(httpStatusCodes.BAD_REQUEST, "file is missing")
    }
    return uploadedFile
}

export {
    uploadOnCloudinary,
    deleteAsset,
    uploadSingleFile
}