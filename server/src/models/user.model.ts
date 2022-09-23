import { model, Schema } from "mongoose";

const UserSchema = new Schema(
    {
        firstName: {
            required: true,
            type: String,
            trim: true,
        },
        lastName: {
            required: true,
            type: String,
            trim: true,
        },
        displayName: {
            required: true,
            type: String,
            trim: true,
        },
        username: {
            required: true,
            type: String,
            unique: true,
            trim: true,
        },
        email: {
            required: true,
            type: String,
            unique: true,
            lowercase: true,
            trim: true,
        },
        avatar: {
            required: true,
            type: String,
            default: "https://www.gravatar.com/avatar/",
            trim: true,
        },
        isOnline: {
            required: true,
            type: Boolean,
            default: false,
        },
        lastOnline: {
            required: true,
            type: Date,
            default: Date.now(),
        },
        password: {
            required: true,
            type: String,
            trim: true,
        },
        refreshTokens: [
            {
                _id: false,
                token: {
                    type: String,
                },
                userAgent: {
                    type: String,
                },
                ip: {
                    type: String,
                },
                createdAt: {
                    type: Date,
                    default: Date.now(),
                },
            },
        ],
        pushSubscriptions: [
            {
                type: Schema.Types.Mixed,
            },
        ],
    },
    { timestamps: true }
);

export default model("User", UserSchema);
