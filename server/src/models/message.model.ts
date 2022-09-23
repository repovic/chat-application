import { model, Schema } from "mongoose";

const MessageSchema = new Schema(
    {
        conversation: {
            required: true,
            type: Schema.Types.ObjectId,
            ref: "Conversation",
        },
        sender: {
            required: true,
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        contentType: {
            required: true,
            type: String,
            enum: ["text", "image"],
            default: "text",
        },
        content: {
            required: true,
            type: String,
            trim: true,
        },
    },
    { timestamps: true }
);

export default model("Message", MessageSchema);
