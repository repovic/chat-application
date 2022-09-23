import { GraphQLUpload } from "graphql-upload";
import conversationResolver from "./conversation.resolver";
import messageResolver from "./message.resolver";
import userResolver from "./user.resolver";

export default [
    {
        Upload: GraphQLUpload,
    },
    userResolver,
    conversationResolver,
    messageResolver,
];
