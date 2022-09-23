import { gql } from "@apollo/client";

export const USER_UPDATED = gql`
    subscription UserUpdated($userId: String!) {
        userUpdated(userId: $userId) {
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
    }
`;
