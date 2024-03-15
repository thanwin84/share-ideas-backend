import mongoose, {Schema} from "mongoose";

const followingSchema = new Schema(
    {
        // one who has followed a Blogger
        follower: {
            type: mongoose.Types.ObjectId,
            ref: "User"
        },
        // one to whom follower is following
        followedBlogger: {
            type: mongoose.Types.ObjectId,
            ref: "User" 
        }
    },
    {
        timestamps: true
    }
)


export const Following = mongoose.model("Following", followingSchema)
