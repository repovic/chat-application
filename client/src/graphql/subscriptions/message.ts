import { gql } from "@apollo/client";

export const MESSAGE_CREATED = gql`
    subscription MessageCreated($conversationId: String!) {
        messageCreated(conversationId: $conversationId) {
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
    }
`;
