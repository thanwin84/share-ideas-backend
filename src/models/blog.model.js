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
    tags: [{type: String, lowercase: true}],
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
    likes: {
        type: Number,
        default: 0
    },
    reads: {
        type: Number,
        default: 0
    },
    comments: {
        type: Number,
        default: 0
    }
}, 
{timestamps: true}
)

export const Blog = mongoose.model("Blog", blogSchema)