import { gql } from "@apollo/client";

export const CREATE_CONVERSATION = gql`
    mutation CreateConversation($participants: [String]!, $name: String) {
        createConversation(participants: $participants, name: $name) {
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
            type
            createdAt
            updatedAt
        }
    }
`;
