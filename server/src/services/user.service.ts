import { compare, hash } from "bcrypt";
import { PubSub } from "graphql-subscriptions";
import { sign, verify } from "jsonwebtoken";
import { ObjectId } from "mongoose";
import { User } from "../models";
import pushService from "./push.service";

interface User {
    _id: ObjectId;
    firstName: string;
    lastName: string;
    displayName: string;
    username: string;
    email: string;
    avatar: string;
    password: string;
    refreshTokens: {
        token: string;
        userAgent: string;
        ip: string;
    }[];
    createdAt?: string;
    updatedAt?: string;
}
interface TokenPayload {
    userId: string;
}

export const userPubSub = new PubSub();

export default {
    getAll: async (): Promise<User[]> => {
        return await User.find();
    },
    getById: async (userId: string): Promise<User> => {
        return await User.findById(userId);
    },
    isUserExistById: async (userId: string): Promise<boolean> => {
        return new Promise(async (resolve, reject) => {
            try {
                if (await User.findById(userId)) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            } catch (error) {
                resolve(false);
            }
        });
    },
    getByUsername: async (username: string): Promise<User> => {
        return await User.findOne({ username });
    },
    isUserExistByUsername: async (username: string): Promise<boolean> => {
        return new Promise(async (resolve, reject) => {
            try {
                if (await User.findOne({ username })) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            } catch (error) {
                resolve(false);
            }
        });
    },
    isPasswordValid: async ({
        userId,
        password,
    }: {
        userId: string;
        password: string;
    }): Promise<boolean> => {
        return new Promise(async (resolve, reject) => {
            try {
                const user = await User.findById(userId);

                if (await compare(password, user.password as string)) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            } catch (error) {
                resolve(false);
            }
        });
    },
    create: async ({
        firstName,
        lastName,
        username,
        email,
        password,
    }: {
        firstName: string;
        lastName: string;
        username: string;
        email: string;
        password: string;
    }): Promise<any> => {
        password = await hash(password, 10);

        return await new User({
            firstName,
            lastName,
            displayName: `${firstName} ${lastName}`,
            username,
            email,
            avatar: `https://avatars.dicebear.com/api/pixel-art-neutral/${firstName}%20${lastName}.svg`,
            password,
        }).save();
    },
    update: async (
        userId: string,
        {
            firstName,
            lastName,
            username,
            avatar,
            password,
        }: {
            firstName: string;
            lastName: string;
            username: string;
            avatar: string;
            password: string;
        }
    ): Promise<any> => {
        return new Promise(async (resolve, reject) => {
            try {
                const user = await User.findById(userId);

                await User.findByIdAndUpdate(userId, {
                    firstName,
                    lastName,
                    displayName:
                        firstName || lastName
                            ? `${firstName || user.firstName} ${
                                  lastName || user.lastName
                              }`
                            : undefined,
                    username,
                    avatar,
                    password: password ? await hash(password, 10) : undefined,
                    refreshTokens: password ? [] : undefined,
                });

                const updatedUser = await User.findById(userId);

                userPubSub.publish("USER_UPDATED", {
                    userUpdated: updatedUser,
                });

                resolve(updatedUser);
            } catch (error) {
                reject(error);
            }
        });
    },
    updateOnlineStatus: async ({
        userId,
        onlineStatus,
    }: {
        userId: string;
        onlineStatus: boolean;
    }): Promise<any> => {
        return new Promise(async (resolve, reject) => {
            try {
                await User.findOneAndUpdate(
                    { _id: userId },
                    {
                        $set: { isOnline: onlineStatus },
                    }
                );

                const updatedUser = await User.findById(userId);

                userPubSub.publish("USER_UPDATED", {
                    userUpdated: updatedUser,
                });
                resolve(updatedUser);
            } catch (error) {
                reject(error);
            }
        });
    },
    updateLastOnline: async ({
        userId,
        lastOnline,
    }: {
        userId: string;
        lastOnline: any;
    }): Promise<any> => {
        return new Promise(async (resolve, reject) => {
            try {
                await User.findByIdAndUpdate(userId, {
                    $set: { isOnline: false },
                    lastOnline,
                });

                const updatedUser = await User.findById(userId);

                userPubSub.publish("USER_UPDATED", {
                    userUpdated: updatedUser,
                });
                resolve(updatedUser);
            } catch (error) {
                reject(error);
            }
        });
    },
    subscribeToPushService: async ({
        userId,
        pushSubscription,
    }: {
        userId: string;
        pushSubscription: any;
    }): Promise<any> => {
        return new Promise(async (resolve, reject) => {
            try {
                await User.findByIdAndUpdate(userId, {
                    $addToSet: {
                        pushSubscriptions: pushSubscription,
                    },
                });

                resolve(pushSubscription);
            } catch (error) {
                reject(error);
            }
        });
    },
    unsubscribeFromPushService: async ({
        userId,
        pushSubscription,
    }: {
        userId: string;
        pushSubscription: any;
    }): Promise<boolean> => {
        return new Promise(async (resolve, reject) => {
            try {
                await User.findByIdAndUpdate(userId, {
                    $pull: {
                        pushSubscriptions: pushSubscription,
                    },
                });

                resolve(pushSubscription);
            } catch (error) {
                reject(error);
            }
        });
    },
    sendNotification: async ({
        userId,
        payload,
    }: {
        userId: string;
        payload: any;
    }): Promise<boolean> => {
        return new Promise(async (resolve, reject) => {
            try {
                const pushSubscriptions = (await User.findById(userId))
                    .pushSubscriptions;

                for (const pushSubscription of pushSubscriptions) {
                    await pushService.sendNotification(
                        pushSubscription as PushSubscription,
                        payload
                    );
                }

                resolve(true);
            } catch (error) {
                reject(error);
            }
        });
    },
    generateAccessToken: async (userId: string): Promise<string> => {
        return new Promise(async (resolve, reject) => {
            try {
                const payload: TokenPayload = {
                    userId,
                };

                resolve(
                    sign(payload, process.env.ACCESS_TOKEN_SECRET as string, {
                        expiresIn: process.env.ACCESS_TOKEN_EXPIRE as string,
                    })
                );
            } catch (error) {
                reject(error);
            }
        });
    },
    validateAccessToken: async (accessToken: string): Promise<TokenPayload> => {
        return new Promise(async (resolve, reject) => {
            try {
                const payload = verify(
                    accessToken,
                    process.env.ACCESS_TOKEN_SECRET as string
                ) as TokenPayload;

                resolve(payload);
            } catch (error) {
                reject(error);
            }
        });
    },
    generateRefreshToken: async ({
        userId,
        userAgent,
        ip,
    }: {
        userId: string;
        userAgent: string;
        ip: string;
    }): Promise<string> => {
        return new Promise(async (resolve, reject) => {
            try {
                const payload: TokenPayload = {
                    userId,
                };
                const refreshToken = sign(
                    payload,
                    process.env.REFRESH_TOKEN_SECRET as string,
                    {
                        expiresIn: process.env.REFRESH_TOKEN_EXPIRE as string,
                    }
                );

                const user = (await User.findById(userId)) as any;
                user.refreshTokens.push({
                    token: refreshToken,
                    userAgent,
                    ip,
                });
                await user.save();

                resolve(refreshToken);
            } catch (error) {
                reject(error);
            }
        });
    },
    validateRefreshToken: async (
        refreshToken: string
    ): Promise<TokenPayload> => {
        return new Promise(async (resolve, reject) => {
            try {
                const payload = verify(
                    refreshToken,
                    process.env.REFRESH_TOKEN_SECRET as string
                ) as TokenPayload;

                resolve(payload);
            } catch (error) {
                reject(error);
            }
        });
    },
    generateSubscriptionToken: async (userId: string): Promise<string> => {
        return new Promise(async (resolve, reject) => {
            try {
                const payload: TokenPayload = {
                    userId,
                };

                resolve(
                    sign(
                        payload,
                        process.env.SUBSCRIPTION_TOKEN_SECRET as string,
                        {
                            expiresIn: process.env
                                .SUBSCRIPTION_TOKEN_EXPIRE as string,
                        }
                    )
                );
            } catch (error) {
                reject(error);
            }
        });
    },
    validateSubscriptionToken: async (
        subscriptionToken: string
    ): Promise<TokenPayload> => {
        return new Promise(async (resolve, reject) => {
            try {
                const payload = verify(
                    subscriptionToken,
                    process.env.SUBSCRIPTION_TOKEN_SECRET as string
                ) as TokenPayload;

                resolve(payload);
            } catch (error) {
                reject(error);
            }
        });
    },
    invalidateRefreshToken: async (refreshToken: string): Promise<boolean> => {
        return new Promise(async (resolve, reject) => {
            try {
                const user = await User.findOne({
                    refreshTokens: {
                        $elemMatch: {
                            token: refreshToken,
                        },
                    },
                });
                user.refreshTokens = user.refreshTokens.filter(
                    ({ token }) => token !== refreshToken
                );
                await user.save();
                resolve(true);
            } catch (error) {
                reject(error);
            }
        });
    },
};
