import { gql } from "@apollo/client";

export const CONVERSATIONS_OF_PARTICIPANT = gql`
    query ConversationsOfParticipant {
        conversationsOfParticipant {
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

export const CONVERSATION = gql`
    query Conversation($conversationId: String!) {
        conversation(conversationId: $conversationId) {
            _id
            name
            participants {
                _id
                displayName
                username
                avatar
                isOnline
                lastOnline
            }
            type
            createdAt
        }
    }
`;
