import { gql } from "apollo-server-express";

export default gql`
    scalar Upload

    extend type Query {
        messagesOfConversation(conversationId: String!): [Message!]
    }

    extend type Mutation {
        createMessage(
            conversationId: String!
            contentType: String
            content: String
            image: Upload
        ): Message!
    }

    extend type Subscription {
        messageCreated(conversationId: String!): Message
    }

    type Message {
        _id: ID!
        conversation: ConversationWithoutLastMessage!
        sender: User!
        contentType: String!
        content: String!
        createdAt: String!
        updatedAt: String!
    }
`;
