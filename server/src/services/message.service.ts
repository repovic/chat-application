import { PubSub } from "graphql-subscriptions";
import { Message } from "../models";
import conversationService from "./conversation.service";

export interface Message {
    conversation: any;
    sender: any;
    contentType: "text";
    content: string;
    createdAt: Date;
    updatedAt: Date;
}

export const conversationPubSub = new PubSub();

export default {
    getByConversation: async (conversationId: string): Promise<Message[]> => {
        return await Message.find({ conversation: conversationId })
            //TODO
            .populate({
                path: "conversation",
                populate: {
                    path: "participants",
                },
            })
            .populate("sender");
    },
    create: async ({
        conversationId,
        senderId,
        contentType,
        content,
    }: {
        conversationId: string;
        senderId: string;
        contentType: "text" | "image";
        content: string;
    }): Promise<any> => {
        return new Promise(async (resolve, reject) => {
            try {
                const { _id: messageId } = await Message.create({
                    conversation: conversationId,
                    sender: senderId,
                    contentType,
                    content,
                });

                const updatedConversation =
                    await conversationService.updateLastMessage({
                        conversationId,
                        messageId: messageId as unknown as string,
                    });

                conversationPubSub.publish("CONVERSATION_UPDATED", {
                    conversationUpdated: updatedConversation,
                });

                resolve(
                    await Message.findById(messageId)
                        .populate({
                            path: "conversation",
                            populate: {
                                path: "participants",
                            },
                        })
                        .populate("sender")
                );
            } catch (error) {
                reject(error);
            }
        });
    },
};
