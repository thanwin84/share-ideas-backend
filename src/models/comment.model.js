import mongoose,{Schema} from "mongoose";

const commentSchema = new Schema(
    {
        commentedBy: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        content: {
            type: String
        },
        blog: {
            type: Schema.Types.ObjectId,
            ref: "Blog"
        },
        
    },
    {
        timestamps: true
    }
)

// todo: Add comment replies 

export const Comment = mongoose.model("Comment", commentSchema)