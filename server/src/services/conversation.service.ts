import { Conversation } from "../models";

interface Conversation {
    name?: string;
    participants: any[];
    lastMessage: any;
    type: "private" | "group";
    createdAt: Date;
    updatedAt: Date;
}

export default {
    getById: async (conversationId: string): Promise<any> => {
        return await Conversation.findById(conversationId)
            .populate("participants")
            .populate({
                path: "lastMessage",
                populate: {
                    path: "sender",
                },
            })
            .exec();
    },
    getByParticipant: async (
        participantId: string
    ): Promise<Conversation[]> => {
        return await Conversation.find(
            {
                participants: participantId,
            },
            null,
            {
                sort: { updatedAt: "desc" },
            }
        )
            .populate("participants")
            .populate({
                path: "lastMessage",
                populate: {
                    path: "sender",
                },
            });
    },
    getByParticipants: async (
        participants: string[]
    ): Promise<Conversation[]> => {
        return await Conversation.findOne({
            participants: {
                $all: participants,
            },
            type: "private",
        }).populate("participants");
    },
    isConversationExistById: async (
        conversationId: string
    ): Promise<boolean> => {
        return new Promise(async (resolve, reject) => {
            try {
                if (await Conversation.findById(conversationId)) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            } catch (error) {
                resolve(false);
            }
        });
    },
    isConversationExistByParticipants: async (
        participants: string[]
    ): Promise<boolean> => {
        return new Promise(async (resolve, reject) => {
            try {
                if (
                    await Conversation.findOne({
                        participants: {
                            $all: participants,
                        },
                        type: "private",
                    })
                ) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            } catch (error) {
                resolve(false);
            }
        });
    },
    isUserParticipant: async ({
        conversationId,
        userId,
    }: {
        conversationId: string;
        userId: string;
    }): Promise<boolean> => {
        return new Promise(async (resolve, reject) => {
            try {
                const conversation = await Conversation.findById(
                    conversationId
                );

                if (
                    (conversation.participants as any).includes(
                        userId as string
                    )
                ) {
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
        name,
        participants,
        type,
    }: {
        name?: string;
        participants: any[];
        type: "private" | "group";
    }): Promise<any> => {
        return new Promise(async (resolve, reject) => {
            try {
                const { _id: conversationId } = await Conversation.create({
                    name,
                    participants,
                    type,
                });

                resolve(
                    await Conversation.findById(conversationId).populate(
                        "participants"
                    )
                );
            } catch (error) {
                reject(error);
            }
        });
    },
    updateLastMessage: async ({
        conversationId,
        messageId,
    }: {
        conversationId: string;
        messageId: string;
    }) => {
        return new Promise(async (resolve, reject) => {
            try {
                const conversation = await Conversation.findById(
                    conversationId
                );
                conversation.lastMessage = messageId;
                await conversation.save();
                resolve(
                    await Conversation.findById(conversationId)
                        .populate("participants")
                        .populate({
                            path: "lastMessage",
                            populate: {
                                path: "sender",
                            },
                        })
                );
            } catch (error) {
                reject(error);
            }
        });
    },
};
