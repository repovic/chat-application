import { gql } from "@apollo/client";

export const CONVERSATION_CREATED = gql`
    subscription ConversationCreated {
        conversationCreated {
            _id
            name
            participants {
                _id
                firstName
                lastName
                displayName
                username
                email
                avatar
                createdAt
                updatedAt
            }
            lastMessage {
                _id
                sender {
                    _id
                    firstName
                    lastName
                    displayName
                    username
                    email
                    avatar
                    createdAt
                    updatedAt
                }
                contentType
                content
                createdAt
                updatedAt
            }
            type
            createdAt
            updatedAt
        }
    }
`;

export const CONVERSATION_UPDATED = gql`
    subscription ConversationUpdated {
        conversationUpdated {
            _id
            name
            participants {
                _id
                firstName
                lastName
                displayName
                username
                email
                avatar
                isOnline
                lastOnline
                createdAt
                updatedAt
            }
            lastMessage {
                _id
                sender {
                    _id
                    firstName
                    lastName
                    displayName
                    username
                    email
                    avatar
                    isOnline
                    lastOnline
                    createdAt
                    updatedAt
                }
                contentType
                content
                createdAt
                updatedAt
            }
            type
            createdAt
            updatedAt
        }
    }
`;
