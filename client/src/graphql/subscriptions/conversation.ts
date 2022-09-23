import { gql } from "@apollo/client";

export const CONVERSATION_CREATED = gql`
    subscription ConversationCreated {
        conversationCreated {
            _id
            name
            participants {
                _id
                displayName
                username
                avatar
            }
            lastMessage {
                _id
                sender {
                    _id
                    displayName
                    avatar
                    isOnline
                    lastOnline
                    createdAt
                    updatedAt
                }
                contentType
                content
                createdAt
            }
            type
            createdAt
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
                displayName
                username
                avatar
            }
            lastMessage {
                _id
                sender {
                    _id
                    displayName
                    avatar
                    isOnline
                    lastOnline
                    createdAt
                    updatedAt
                }
                contentType
                content
                createdAt
            }
            type
            createdAt
        }
    }
`;
