import mongoose, {Schema} from "mongoose";

const coverPhotoSchema = new Schema({
    publicId: {
        type: String,
        required: true
    },
    publicUrl: {
        type: String,
        required: true
    }
})
const blogSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    content: String,
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    tags: [String],
    publish: {
        type: Boolean,
        default: true
    },
    premium: {
        type: Boolean,
        default: false
    },
    featured: {
        type: Boolean,
        default: false
    },
    coverPhoto: coverPhotoSchema,
    likes: Number, // total likes
    reads: Number, // how many people has read
}, 
{timestamps: true}
)

export const Blog = mongoose.model("Blog", blogSchema)