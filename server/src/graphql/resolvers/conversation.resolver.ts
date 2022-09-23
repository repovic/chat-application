import {
    AuthenticationError,
    ForbiddenError,
    UserInputError,
} from "apollo-server-express";
import { withFilter } from "graphql-subscriptions";
import { conversationService, userService } from "../../services";
import { conversationPubSub } from "../../services/message.service";

export default {
    Query: {
        conversationsOfParticipant: async (
            _: any,
            __: any,
            { req, res }: any
        ): Promise<any> => {
            return new Promise(async (resolve, reject) => {
                try {
                    if (!req.userId) {
                        throw new AuthenticationError("Not authenticated!");
                    }

                    resolve(
                        await conversationService.getByParticipant(req.userId)
                    );
                } catch (error) {
                    reject(error);
                }
            });
        },
        conversation: async (
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
                            "Conversation does not exist!"
                        );
                    }

                    if (
                        !(await conversationService.isUserParticipant({
                            conversationId,
                            userId: req.userId,
                        }))
                    ) {
                        throw new ForbiddenError(
                            "You are not a participant of this conversation!"
                        );
                    }

                    resolve(await conversationService.getById(conversationId));
                } catch (error) {
                    reject(error);
                }
            });
        },
    },
    Mutation: {
        createConversation: async (
            _: any,
            {
                name,
                participants,
            }: {
                name: string;
                participants: string[];
            },
            { req, res }: any
        ): Promise<any> => {
            return new Promise(async (resolve, reject) => {
                try {
                    /**
                     * TODO: Check if participants already have created conversation,
                     * if is return that conversation instead of creating new one.
                     */

                    if (!req.userId) {
                        throw new AuthenticationError("Not authenticated!");
                    }

                    participants = Array.from(
                        new Set([req.userId, ...participants])
                    );

                    if (participants.length < 2) {
                        throw new UserInputError(
                            "Conversation must have at least 2 participants!"
                        );
                    }

                    const type = participants.length > 2 ? "group" : "private";

                    if (type == "private" && name) {
                        throw new UserInputError(
                            "Private conversations can't have a name!"
                        );
                    }

                    if (type == "group" && !name) {
                        throw new UserInputError(
                            "Group conversations must have a name!"
                        );
                    }

                    if (
                        type == "group" &&
                        (name.length < 4 || name.length > 15)
                    ) {
                        throw new UserInputError(
                            "Conversation Name must be between 4 and 15 characters long!"
                        );
                    }

                    for (let participant of participants) {
                        if (!(await userService.isUserExistById(participant))) {
                            throw new UserInputError(
                                "One of the participants doesn't exist!"
                            );
                        }
                    }

                    if (
                        type == "private" &&
                        (await conversationService.isConversationExistByParticipants(
                            participants
                        ))
                    ) {
                        return resolve(
                            await conversationService.getByParticipants(
                                participants
                            )
                        );
                    }

                    const createdConversation =
                        await conversationService.create({
                            name,
                            participants,
                            type,
                        });

                    if (type == "private") {
                        userService.sendNotification({
                            userId: participants[1],
                            payload: {
                                body: `👋 ${createdConversation.participants[0]?.displayName} created conversation with you!`,
                                icon: createdConversation.participants[0]
                                    .avatar,
                            },
                        });
                    } else {
                        for (const participant of participants) {
                            if (participant !== participants[0]) {
                                userService.sendNotification({
                                    userId: participant,
                                    payload: {
                                        body: `👋 ${createdConversation.participants[0]?.displayName} added you to ${createdConversation.name} group!`,
                                        icon: createdConversation
                                            .participants[0].avatar,
                                    },
                                });
                            }
                        }
                    }

                    conversationPubSub.publish("CONVERSATION_CREATED", {
                        conversationCreated: createdConversation,
                    });

                    resolve(createdConversation);
                } catch (error) {
                    reject(error);
                }
            });
        },
    },

    Subscription: {
        conversationCreated: {
            subscribe: withFilter(
                () => conversationPubSub.asyncIterator("CONVERSATION_CREATED"),
                async (payload, variables, context) => {
                    const userId = context.userId;
                    const conversationCreated = payload.conversationCreated;

                    if (
                        !(await conversationService.isUserParticipant({
                            conversationId: conversationCreated._id,
                            userId,
                        }))
                    ) {
                        return false;
                    }

                    return true;
                }
            ),
        },
        conversationUpdated: {
            subscribe: withFilter(
                () => conversationPubSub.asyncIterator("CONVERSATION_UPDATED"),
                async (payload, variables, context) => {
                    const userId = context.userId;
                    const conversationUpdated = payload.conversationUpdated;

                    if (
                        !(await conversationService.isUserParticipant({
                            conversationId: conversationUpdated._id,
                            userId,
                        }))
                    ) {
                        return false;
                    }

                    return true;
                }
            ),
        },
    },
};
