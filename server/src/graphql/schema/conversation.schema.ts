import { gql } from "apollo-server-express";

export default gql`
    extend type Query {
        conversationsOfParticipant: [Conversation!]
        conversation(conversationId: String!): Conversation!
    }

    extend type Mutation {
        createConversation(name: String, participants: [String]!): Conversation!
    }

    extend type Subscription {
        conversationCreated: Conversation!
        conversationUpdated: Conversation!
    }

    type Conversation {
        _id: ID!
        name: String
        participants: [User]!
        lastMessage: LastMessage
        type: String!
        createdAt: String!
        updatedAt: String!
    }

    type ConversationWithoutLastMessage {
        _id: ID!
        name: String
        participants: [User]!
        type: String!
        createdAt: String!
        updatedAt: String!
    }

    type LastMessage {
        _id: ID!
        sender: User!
        contentType: String!
        content: String!
        createdAt: String!
        updatedAt: String!
    }
`;
