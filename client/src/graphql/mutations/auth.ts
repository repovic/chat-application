import { gql } from "@apollo/client";

export const REGISTER = gql`
    mutation Register(
        $firstName: String!
        $lastName: String!
        $username: String!
        $email: String!
        $password: String!
    ) {
        register(
            firstName: $firstName
            lastName: $lastName
            username: $username
            email: $email
            password: $password
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

export const LOGIN = gql`
    mutation Login($username: String!, $password: String!) {
        login(username: $username, password: $password) {
            user {
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
            accessToken
            subscriptionToken
        }
    }
`;

export const REFRESH_TOKEN = gql`
    mutation RefreshToken {
        refreshToken {
            user {
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
            accessToken
        }
    }
`;

export const LOGOUT = gql`
    mutation Logout {
        logout
    }
`;

export const SUBSCRIBE_TO_PUSH_SERVICE = gql`
    mutation SubscribeToPushService(
        $endpoint: String!
        $expirationTime: String
        $keys: PushSubscriptionKeys!
    ) {
        subscribeToPushService(
            endpoint: $endpoint
            expirationTime: $expirationTime
            keys: $keys
        ) {
            endpoint
            expirationTime
            keys {
                p256dh
                auth
            }
        }
    }
`;

export const UNSUBSCRIBE_FROM_PUSH_SERVICE = gql`
    mutation UnsubscribeFromPushService(
        $endpoint: String!
        $expirationTime: String
        $keys: PushSubscriptionKeys!
    ) {
        unsubscribeFromPushService(
            endpoint: $endpoint
            expirationTime: $expirationTime
            keys: $keys
        ) {
            endpoint
            expirationTime
            keys {
                p256dh
                auth
            }
        }
    }
`;
