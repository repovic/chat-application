import { model, Schema } from "mongoose";

const ConversationSchema = new Schema(
    {
        name: {
            type: String,
            trim: true,
        },
        participants: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        lastMessage: {
            type: Schema.Types.ObjectId,
            ref: "Message",
            default: null,
        },
        type: {
            required: true,
            type: String,
            enum: ["private", "group"],
            default: "private",
        },
    },
    { timestamps: true }
);

export default model("Conversation", ConversationSchema);
