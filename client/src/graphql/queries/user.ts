import { gql } from "@apollo/client";

export const USER = gql`
    query User($userId: String) {
        user(userId: $userId) {
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
        }
    }
`;

export const USERS = gql`
    query Users {
        users {
            _id
            displayName
            username
            avatar
        }
    }
`;
