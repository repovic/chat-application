import { gql } from "@apollo/client";

export const CREATE_MESSAGE = gql`
    mutation CreateMessage(
        $conversationId: String!
        $contentType: String
        $content: String
        $image: Upload
    ) {
        createMessage(
            conversationId: $conversationId
            contentType: $contentType
            content: $content
            image: $image
        ) {
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
    }
`;
