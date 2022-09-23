import { gql } from "@apollo/client";

export const MESSAGES_OF_CONVERSATION = gql`
    query MessagesOfConversation($conversationId: String!) {
        messagesOfConversation(conversationId: $conversationId) {
            _id
            sender {
                _id
                displayName
                username
                email
                avatar
                isOnline
                lastOnline
                createdAt
            }
            contentType
            content
            createdAt
        }
    }
`;
