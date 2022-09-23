import { AuthenticationError, UserInputError } from "apollo-server-express";
import { createWriteStream, existsSync, mkdirSync } from "fs";
import { PubSub, withFilter } from "graphql-subscriptions";
import { v4 as uuid } from "uuid";
import {
    conversationService,
    messageService,
    userService,
} from "../../services";
import path = require("path");

const messagePubSub = new PubSub();

export default {
    Query: {
        messagesOfConversation: async (
            _: any,
            { conversationId }: { conversationId: string },
            { req, res }: any
        ): Promise<any> => {
            return new Promise(async (resolve, reject) => {
                try {
                    if (!req.userId) {
                        throw new AuthenticationError("Not authenticated!");
                    }

                    if (
                        !(await conversationService.isConversationExistById(
                            conversationId
                        ))
                    ) {
                        throw new UserInputError(
                            "This conversation does not exist!"
                        );
                    }

                    if (
                        !(await conversationService.isUserParticipant({
                            conversationId,
                            userId: req.userId,
                        }))
                    ) {
                        throw new UserInputError(
                            "You are not participant of this conversation!"
                        );
                    }

                    resolve(
                        await messageService.getByConversation(conversationId)
                    );
                } catch (error) {
                    reject(error);
                }
            });
        },
    },
    Mutation: {
        createMessage: async (
            _: any,
            {
                conversationId,
                contentType = "text",
                content,
                image,
            }: {
                conversationId: string;
                contentType: "text" | "image";
                content: string;
                image: any;
            },
            { req, res }: any
        ): Promise<any> => {
            return new Promise(async (resolve, reject) => {
                try {
                    if (!req.userId) {
                        throw new AuthenticationError("Not authenticated!");
                    }

                    if (
                        !(await conversationService.isConversationExistById(
                            conversationId
                        ))
                    ) {
                        throw new UserInputError(
                            "This conversation does not exist!"
                        );
                    }

                    if (
                        !(await conversationService.isUserParticipant({
                            conversationId,
                            userId: req.userId,
                        }))
                    ) {
                        throw new UserInputError(
                            "You are not participant of this conversation!"
                        );
                    }

                    if (contentType === "text" && !content) {
                        throw new UserInputError("!");
                    }

                    if (contentType === "image" && !image) {
                        throw new UserInputError("!");
                    }

                    let conversationMediaId = undefined;

                    if (contentType === "image") {
                        const {
                            createReadStream,
                            filename,
                            mimetype,
                            encoding,
                        } = await image;

                        const stream = createReadStream();

                        const conversationMediaDirectory = path.join(
                            __dirname,
                            `../../../public/conversation/${conversationId}`
                        );

                        conversationMediaId = uuid();

                        if (!existsSync(conversationMediaDirectory)) {
                            mkdirSync(conversationMediaDirectory);
                        }

                        stream.pipe(
                            createWriteStream(
                                path.join(
                                    conversationMediaDirectory,
                                    conversationMediaId
                                )
                            )
                        );
                    }

                    const createdMessage = await messageService.create({
                        conversationId,
                        senderId: req.userId,
                        contentType,
                        content:
                            contentType === "text"
                                ? content
                                : conversationMediaId,
                    });

                    const user = await userService.getById(req.userId);
                    const conversation = await conversationService.getById(
                        conversationId
                    );

                    for (const participant of conversation.participants) {
                        if (participant._id != req.userId) {
                            userService.sendNotification({
                                userId: participant._id,
                                payload: {
                                    body: `${
                                        conversation.type === "private"
                                            ? `${user.displayName}`
                                            : `${user.displayName} in ${conversation.name}`
                                    }: ${
                                        contentType === "text"
                                            ? content
                                            : "Image"
                                    }`,
                                    image: `${process.env.SERVER_URL}/static/conversation/${conversationId}/${content}`,
                                    icon: user.avatar,
                                },
                            });
                        }
                    }

                    messagePubSub.publish("MESSAGE_CREATED", {
                        messageCreated: createdMessage,
                    });
                    resolve(createdMessage);
                } catch (error) {
                    reject(error);
                }
            });
        },
    },
    Subscription: {
        messageCreated: {
            subscribe: withFilter(
                () => messagePubSub.asyncIterator("MESSAGE_CREATED"),
                async (payload, { conversationId }, context) => {
                    const userId = context.userId;
                    const messageCreated = payload.messageCreated;

                    if (
                        !(await conversationService.isUserParticipant({
                            conversationId,
                            userId,
                        }))
                    ) {
                        return false;
                    }

                    if (conversationId != messageCreated.conversation._id) {
                        return false;
                    }

                    return true;
                }
            ),
        },
    },
};
