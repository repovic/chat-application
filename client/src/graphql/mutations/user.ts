import { gql } from "@apollo/client";

export const UPDATE_USER = gql`
    mutation UpdateUser(
        $firstName: String
        $lastName: String
        $username: String
        $avatar: Upload
        $password: String
        $passwordConfirm: String
    ) {
        updateUser(
            firstName: $firstName
            lastName: $lastName
            username: $username
            avatar: $avatar
            password: $password
            passwordConfirm: $passwordConfirm
        ) {
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
