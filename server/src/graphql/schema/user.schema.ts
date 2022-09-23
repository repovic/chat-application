import { gql } from "apollo-server-express";

export default gql`
    extend type Query {
        user(userId: String): User!
        users: [User!]
    }

    extend type Mutation {
        register(
            firstName: String!
            lastName: String!
            username: String!
            email: String!
            password: String!
        ): User!
        login(username: String!, password: String!): UserWithTokens!
        refreshToken: UserWithAccessToken!
        updateUser(
            firstName: String
            lastName: String
            username: String
            avatar: Upload
            password: String
            passwordConfirm: String
        ): User!
        subscribeToPushService(
            endpoint: String!
            expirationTime: String
            keys: PushSubscriptionKeys!
        ): PushSubscription!
        unsubscribeFromPushService(
            endpoint: String!
            expirationTime: String
            keys: PushSubscriptionKeys!
        ): PushSubscription!
        logout: Boolean
    }

    extend type Subscription {
        userUpdated(userId: String!): User
    }

    input PushSubscriptionKeys {
        p256dh: String!
        auth: String!
    }

    type _PushSubscriptionKeys {
        p256dh: String!
        auth: String!
    }

    type PushSubscription {
        endpoint: String!
        expirationTime: String
        keys: _PushSubscriptionKeys!
    }

    type UserWithTokens {
        user: User!
        accessToken: String!
        subscriptionToken: String!
    }

    type UserWithAccessToken {
        user: User!
        accessToken: String!
    }

    type User {
        _id: ID!
        firstName: String!
        lastName: String!
        displayName: String!
        username: String!
        email: String!
        avatar: String!
        isOnline: Boolean!
        lastOnline: String!
        createdAt: String!
        updatedAt: String!
    }
`;
