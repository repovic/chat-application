import { gql } from "apollo-server-express";
import conversationSchema from "./conversation.schema";
import messageSchema from "./message.schema";
import userSchema from "./user.schema";

const linkSchema = gql`
    scalar Upload

    type Query {
        _: Boolean
    }

    type Mutation {
        _: Boolean
    }

    type Subscription {
        _: Boolean
    }
`;

export default [linkSchema, userSchema, conversationSchema, messageSchema];
