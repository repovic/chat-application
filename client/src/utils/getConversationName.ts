import getRecipientsFromParticipants from "./getRecipientsFromParticipants";

export default (conversation: any, userId: string): string => {
    const recipients = getRecipientsFromParticipants(
        conversation.participants,
        userId
    );

    return conversation.type === "private"
        ? recipients[0].displayName
        : conversation.name;
};
