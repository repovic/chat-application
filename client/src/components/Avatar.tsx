import { motion } from "framer-motion";
import Image from "next/image";
import { FC } from "react";

type UserAvatarProps = {
    isLarge?: boolean;
    user: any;
    [propName: string]: any;
};
const UserAvatar: FC<UserAvatarProps> = ({ isLarge, user, ...restProps }) => {
    return (
        <div
            className={`flex items-center justify-center ${
                isLarge
                    ? "max-w-[150px] min-w-[150px]"
                    : "max-w-[50px] min-w-[50px]"
            }`}
            {...restProps}
        >
            {user && (
                <Image
                    src={user.avatar}
                    alt={`${user.displayName} - Avatar`}
                    className={`rounded-full`}
                    width={isLarge ? 150 : 50}
                    height={isLarge ? 150 : 50}
                />
            )}
        </div>
    );
};

const UserAvatarMotion = motion(UserAvatar);

type ConversationAvatarProps = {
    isLarge?: boolean;
    forConversationType: "direct" | "group";
    conversationRecipients: any[];
    [propName: string]: any;
};
const ConversationAvatar: FC<ConversationAvatarProps> = ({
    isLarge = false,
    forConversationType,
    conversationRecipients,
    ...restProps
}) => {
    return (
        <div className={`relative h-full flex items-center`} {...restProps}>
            <div className="w-44 left-7 hidden" />
            {conversationRecipients.slice(0, 2).map((recipient: any, index) => (
                <div
                    className={`${
                        forConversationType === "group" && index > 0 && `-ml-8`
                    } ${
                        isLarge
                            ? "max-w-[80px] min-w-[80px]"
                            : "max-w-[55px] min-w-[55px]"
                    } h-auto flex items-center`}
                    key={`ConversationAvatar-Avatar-${recipient._id}`}
                >
                    <Image
                        src={recipient.avatar}
                        alt={`${recipient.displayName} - Avatar`}
                        className={`rounded-full`}
                        width={isLarge ? 80 : 55}
                        height={isLarge ? 80 : 55}
                    />
                </div>
            ))}

            {conversationRecipients.length > 1 && (
                <div
                    className={`${forConversationType === "group" && `-ml-8`} ${
                        isLarge ? "w-[80px] h-[80px]" : "w-[55px] h-[55px]"
                    } flex items-center justify-center text-2xl font-bold bg-primary rounded-full z-[1]`}
                >
                    +{conversationRecipients.length - 1}
                </div>
            )}
        </div>
    );
};

const ConversationAvatarMotion = motion(ConversationAvatar);

export {
    UserAvatar,
    UserAvatarMotion,
    ConversationAvatar,
    ConversationAvatarMotion,
};
