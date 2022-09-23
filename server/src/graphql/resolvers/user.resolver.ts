import { AuthenticationError, UserInputError } from "apollo-server-express";
import { compare } from "bcrypt";
import { createWriteStream, existsSync, mkdirSync, readdir, unlink } from "fs";
import { withFilter } from "graphql-subscriptions";
import { v4 as uuid } from "uuid";
import validator from "validator";
import { userService } from "../../services";
import { userPubSub } from "../../services/user.service";
import path = require("path");

export default {
    Query: {
        user: async (
            _: any,
            { userId }: any,
            { req, res }: any
        ): Promise<any> => {
            return new Promise(async (resolve, reject) => {
                try {
                    if (!req.userId) {
                        throw new AuthenticationError("Not authenticated!");
                    }

                    resolve(
                        await userService.getById(userId ? userId : req.userId)
                    );
                } catch (error) {
                    reject(error);
                }
            });
        },
        users: async (_: any, __: any, { req, res }: any): Promise<any> => {
            return new Promise(async (resolve, reject) => {
                try {
                    if (!req.userId) {
                        throw new AuthenticationError("Not authenticated!");
                    }

                    resolve(await userService.getAll());
                } catch (error) {
                    reject(error);
                }
            });
        },
    },
    Mutation: {
        register: async (
            _: any,
            {
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
            },
            { req, res }: any
        ): Promise<any> => {
            return new Promise(async (resolve, reject) => {
                try {
                    if (firstName.length < 3 || firstName.length > 12) {
                        throw new UserInputError(
                            "First Name must be between 3 and 12 characters long!"
                        );
                    }

                    if (!validator.isAlpha(firstName)) {
                        throw new UserInputError(
                            "First Name can contain letters only!"
                        );
                    }

                    if (lastName.length < 3 || lastName.length > 12) {
                        throw new UserInputError(
                            "Last Name must be between 3 and 12 characters long!"
                        );
                    }

                    if (!validator.isAlpha(lastName)) {
                        throw new UserInputError(
                            "Last Name can contain letters only!"
                        );
                    }

                    if (!validator.isAlphanumeric(username)) {
                        throw new UserInputError(
                            "Username can contain letters and / or numbers only!"
                        );
                    }

                    if (username.length < 5 || username.length > 10) {
                        throw new UserInputError(
                            "Username must be between 4 and 10 characters long!"
                        );
                    }

                    if (!validator.isEmail(email)) {
                        throw new UserInputError("Email is invalid!");
                    }

                    if (password.length < 8) {
                        throw new UserInputError(
                            "Password must be longer than 8 characters!"
                        );
                    }

                    resolve(
                        await userService.create({
                            firstName,
                            lastName,
                            username,
                            email,
                            password,
                        })
                    );
                } catch (error) {
                    if (error.code === 11000) {
                        resolve(
                            new UserInputError(
                                "Username or email already exists!"
                            )
                        );
                    }

                    reject(error);
                }
            });
        },
        login: async (
            _: any,
            { username, password }: { username: string; password: string },
            { req, res }: any
        ): Promise<any> => {
            return new Promise(async (resolve, reject) => {
                try {
                    if (!(await userService.isUserExistByUsername(username))) {
                        throw new UserInputError(
                            "User with that username does not exist!"
                        );
                    }

                    const user = await userService.getByUsername(username);

                    const isPasswordValid = await compare(
                        password,
                        user.password
                    );
                    if (!isPasswordValid) {
                        throw new UserInputError(
                            "Username or password is incorrect!"
                        );
                    }

                    const accessToken = await userService.generateAccessToken(
                        String(user._id)
                    );
                    const subscriptionToken =
                        await userService.generateSubscriptionToken(
                            String(user._id)
                        );
                    const refreshToken = await userService.generateRefreshToken(
                        {
                            userId: String(user._id),
                            userAgent: req.headers["user-agent"],
                            ip: req.ip,
                        }
                    );

                    res.cookie("refresh-token", refreshToken, {
                        maxAge: process.env
                            .REFRESH_TOKEN_COOKIE_EXPIRE as unknown as number,
                        httpOnly: true,
                        secure: true,
                        sameSite: "none",
                    });
                    resolve({
                        user,
                        accessToken,
                        subscriptionToken,
                    });
                } catch (error) {
                    reject(error);
                }
            });
        },
        logout: async (_: any, __: any, { req, res }: any): Promise<any> => {
            return new Promise(async (resolve, reject) => {
                try {
                    const refreshToken = req.cookies["refresh-token"];
                    if (refreshToken) {
                        await userService.invalidateRefreshToken(refreshToken);
                        res.clearCookie("refresh-token", {
                            httpOnly: true,
                            secure: true,
                            sameSite: "none",
                        });
                    } else {
                        throw new AuthenticationError(
                            "Refresh Token is invalid!"
                        );
                    }

                    resolve(true);
                } catch (error) {
                    reject(error);
                }
            });
        },
        refreshToken: async (
            _: any,
            __: any,
            { req, res }: any
        ): Promise<any> => {
            return new Promise(async (resolve, reject) => {
                try {
                    const refreshToken = req.cookies["refresh-token"] as string;

                    if (!refreshToken) {
                        throw new AuthenticationError("Not Authenticated!");
                    }

                    await userService
                        .validateRefreshToken(refreshToken)
                        .then(async (payload) => {
                            if (
                                !(await userService.isUserExistById(
                                    payload.userId
                                ))
                            ) {
                                res.clearCookie("refresh-token", {
                                    httpOnly: true,
                                    secure: true,
                                    sameSite: "none",
                                });
                                throw new AuthenticationError(
                                    "Not Authenticated!"
                                );
                            }

                            const user = await userService.getById(
                                payload.userId
                            );

                            if (
                                user.refreshTokens.filter(
                                    ({ token }: any) => token === refreshToken
                                ).length === 0
                            ) {
                                res.clearCookie("refresh-token", {
                                    httpOnly: true,
                                    secure: true,
                                    sameSite: "none",
                                });
                                throw new AuthenticationError(
                                    "Not Authenticated!"
                                );
                            }

                            const { token, userAgent, ip }: any =
                                user.refreshTokens.find(
                                    ({ token }: any) => token === refreshToken
                                );

                            if (
                                userAgent !== req.headers["user-agent"] ||
                                ip !== req.ip
                            ) {
                                await userService.invalidateRefreshToken(
                                    refreshToken
                                );
                                res.clearCookie("refresh-token", {
                                    httpOnly: true,
                                    secure: true,
                                    sameSite: "none",
                                });
                                throw new AuthenticationError(
                                    "Browser / Network change detected! Refresh Token invalidated!"
                                );
                            }

                            const newAccessToken =
                                await userService.generateAccessToken(
                                    payload.userId
                                );

                            resolve({
                                user,
                                accessToken: newAccessToken,
                            });
                        });
                } catch (error) {
                    reject(error);
                }
            });
        },
        updateUser: async (
            _: any,
            {
                firstName,
                lastName,
                username,
                avatar,
                password,
                passwordConfirm,
            }: {
                firstName: string;
                lastName: string;
                username: string;
                avatar: any;
                password: string;
                passwordConfirm: string;
            },
            { req, res }: any
        ): Promise<any> => {
            return new Promise(async (resolve, reject) => {
                try {
                    if (!req.userId) {
                        throw new AuthenticationError("Not authenticated!");
                    }

                    if (
                        firstName !== undefined &&
                        (firstName.length < 3 || firstName.length > 12)
                    ) {
                        throw new UserInputError(
                            "First Name must be between 3 and 12 characters long!"
                        );
                    }

                    if (
                        firstName !== undefined &&
                        !validator.isAlpha(firstName)
                    ) {
                        throw new UserInputError(
                            "First Name can contain letters only!"
                        );
                    }

                    if (
                        lastName !== undefined &&
                        (lastName.length < 3 || lastName.length > 12)
                    ) {
                        throw new UserInputError(
                            "Last Name must be between 3 and 12 characters long!"
                        );
                    }

                    if (
                        lastName !== undefined &&
                        !validator.isAlpha(lastName)
                    ) {
                        throw new UserInputError(
                            "Last Name can contain letters only!"
                        );
                    }

                    if (
                        username !== undefined &&
                        !validator.isAlphanumeric(username)
                    ) {
                        throw new UserInputError(
                            "Username can contain letters and / or numbers only!"
                        );
                    }

                    if (
                        username !== undefined &&
                        (username.length < 5 || username.length > 10)
                    ) {
                        throw new UserInputError(
                            "Username must be between 4 and 10 characters long!"
                        );
                    }

                    if (password !== undefined && !passwordConfirm) {
                        throw new AuthenticationError(
                            "Password confirm is required for password change!"
                        );
                    }

                    if (password !== undefined && passwordConfirm) {
                        if (
                            !(await userService.isPasswordValid({
                                userId: req.userId,
                                password: passwordConfirm,
                            }))
                        ) {
                            throw new UserInputError(
                                "Password confirm is incorrect!"
                            );
                        }
                    }

                    let userMediaId = undefined;

                    if (avatar) {
                        const {
                            createReadStream,
                            filename,
                            mimetype,
                            encoding,
                        } = await avatar;

                        const stream = createReadStream();

                        const userMediaDirectory = path.join(
                            __dirname,
                            `../../../public/user/${req.userId}`
                        );

                        userMediaId = uuid();

                        if (!existsSync(userMediaDirectory)) {
                            // Create user media directory if not exist
                            mkdirSync(userMediaDirectory);
                        } else {
                            // Remove old avatars form user media directory
                            readdir(userMediaDirectory, (error, files) => {
                                for (const file of files) {
                                    unlink(
                                        path.join(userMediaDirectory, file),
                                        (err) => {
                                            if (err) throw err;
                                        }
                                    );
                                }
                            });
                        }

                        stream.pipe(
                            createWriteStream(
                                path.join(userMediaDirectory, userMediaId)
                            )
                        );
                    }

                    const updatedUser = await userService.update(req.userId, {
                        firstName,
                        lastName,
                        username,
                        avatar: userMediaId
                            ? `${process.env.SERVER_URL}/static/user/${req.userId}/${userMediaId}`
                            : undefined,
                        password,
                    });

                    resolve(updatedUser);
                } catch (error) {
                    reject(error);
                }
            });
        },
        subscribeToPushService: async (
            _: any,
            pushSubscription: {
                endpoint: string;
                expirationTime: string | null;
                keys: {
                    p256dh: string;
                    auth: string;
                };
            },
            { req, res }: any
        ): Promise<any> => {
            return new Promise(async (resolve, reject) => {
                try {
                    if (!req.userId) {
                        throw new AuthenticationError("Not authenticated!");
                    }

                    resolve(
                        await userService.subscribeToPushService({
                            userId: req.userId,
                            pushSubscription,
                        })
                    );
                } catch (error) {
                    reject(error);
                }
            });
        },
        unsubscribeFromPushService: async (
            _: any,
            pushSubscription: {
                endpoint: string;
                expirationTime: string | null;
                keys: {
                    p256dh: string;
                    auth: string;
                };
            },
            { req, res }: any
        ): Promise<any> => {
            return new Promise(async (resolve, reject) => {
                try {
                    if (!req.userId) {
                        throw new AuthenticationError("Not authenticated!");
                    }

                    resolve(
                        await userService.unsubscribeFromPushService({
                            userId: req.userId,
                            pushSubscription,
                        })
                    );
                } catch (error) {
                    reject(error);
                }
            });
        },
    },
    Subscription: {
        userUpdated: {
            subscribe: withFilter(
                () => userPubSub.asyncIterator("USER_UPDATED"),
                async (payload, { userId }, context) => {
                    const userUpdated = payload.userUpdated;

                    if (userId != userUpdated._id) {
                        return false;
                    }

                    return true;
                }
            ),
        },
    },
};
