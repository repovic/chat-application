import { motion } from "framer-motion";
import { FC } from "react";
import TimeAgo from "react-timeago";
import useAuth from "../../hooks/useAuth";
import getConversationName from "../../utils/getConversationName";
import getRecipientsFromParticipants from "../../utils/getRecipientsFromParticipants";
import { ConversationAvatar } from "../Avatar";

type ConversationProps = {
    conversation: any;
    isSelected?: boolean;
    [propName: string]: any;
};
const Conversation: FC<ConversationProps> = ({
    conversation,
    isSelected,
    ...restProps
}) => {
    const { user } = useAuth();

    const conversationName = getConversationName(conversation, user._id);
    const recipients = getRecipientsFromParticipants(
        conversation.participants,
        user._id
    );

    return (
        <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "0%" }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween" }}
            className={`w-full h-20 px-5 flex items-center justify-between gap-2 border-l-4 hover:border-l-primary hover:bg-secondary ${
                isSelected
                    ? "bg-secondary border-l-primary"
                    : "bg-tertiary border-l-transparent"
            } cursor-pointer overflow-x-hidden text-ellipsis`}
            {...restProps}
        >
            <div className="w-[1px] h-full flex items-center justify-start grow gap-2">
                <ConversationAvatar
                    forConversationType={conversation.type}
                    conversationRecipients={recipients}
                />
                <div className="w-full overflow-hidden">
                    <p className="w-full text-2xl  whitespace-nowrap text-ellipsis overflow-hidden">
                        {conversationName}
                    </p>
                    {conversation.lastMessage !== null && (
                        <p className="text-xl text-slate-300 whitespace-nowrap text-ellipsis overflow-hidden">
                            {conversation.lastMessage.sender._id === user._id
                                ? "You"
                                : conversation.lastMessage.sender.displayName}
                            :{" "}
                            {conversation.lastMessage.contentType === "text" &&
                                conversation.lastMessage.content}
                            {conversation.lastMessage.contentType === "image" &&
                                "Image"}
                        </p>
                    )}
                </div>
            </div>
            <div className="flex-shrink">
                {conversation.lastMessage !== null && (
                    <p className="text-xl text-slate-300">
                        <TimeAgo
                            date={
                                new Date(
                                    Number(conversation.lastMessage.createdAt)
                                )
                            }
                            formatter={(value, unit, suffix) => {
                                const units = {
                                    year: "y",
                                    month: "mo",
                                    week: "w",
                                    day: "d",
                                    hour: "h",
                                    minute: "min",
                                    second: "sec",
                                };

                                return `${value}${units[unit]} ago`;
                            }}
                        />
                    </p>
                )}
            </div>
        </motion.div>
    );
};

export default Conversation;
