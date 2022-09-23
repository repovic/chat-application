import { CalendarMonthRounded, Grid3x3Rounded } from "@mui/icons-material";
import { motion } from "framer-motion";
import { FC } from "react";
import { useSelector } from "react-redux";
import useAuth from "../../hooks/useAuth";
import { RootState } from "../../redux";
import getRecipientsFromParticipants from "../../utils/getRecipientsFromParticipants";
import { ConversationAvatar, UserAvatar } from "../Avatar";

type ConversationInfoProps = {
    [propName: string]: any;
};
const ConversationInfo: FC<ConversationInfoProps> = ({ ...restProps }) => {
    const { user } = useAuth();
    const { selectedConversation } = useSelector(
        (state: RootState) => state.app
    );

    const recipients = getRecipientsFromParticipants(
        selectedConversation.participants,
        user._id
    );

    return (
        <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: "0" }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "tween" }}
            className="absolute right-0 top-20 w-full lg:w-2/3 h-[calc(100%_-_80px)] p-5 flex flex-col gap-6 bg-tertiary z-10 overflow-auto"
            {...restProps}
        >
            <div className="w-full flex flex-col">
                <div className="sticky top-0 left-0 bg-tertiary pb-5 flex flex-col items-center justify-center gap-5 z-50  mb-5 lg:mb-0">
                    <ConversationAvatar
                        isLarge={true}
                        forConversationType={selectedConversation.type}
                        conversationRecipients={recipients}
                    />
                    <motion.div
                        initial={{ opacity: 0, y: "+20%" }}
                        animate={{
                            opacity: 1,
                            y: "0%",
                            transition: {
                                delay: 0.2,
                            },
                        }}
                        exit={{ opacity: 0, y: "+20%" }}
                        transition={{
                            type: "tween",
                        }}
                        className="flex items-center"
                    >
                        <p className="text-3xl text-center">
                            {selectedConversation.name}
                        </p>
                        <span className="ml-2 text-lg px-2 bg-primary rounded">
                            {selectedConversation.type.toUpperCase()}
                        </span>
                    </motion.div>
                </div>
                <div className="flex flex-col gap-5">
                    <motion.div className="flex flex-col gap-2">
                        <motion.p
                            initial={{ opacity: 0, y: "+20%" }}
                            animate={{
                                opacity: 1,
                                y: "0%",
                                transition: {
                                    delay: 0.3,
                                },
                            }}
                            exit={{ opacity: 0, y: "+20%" }}
                            transition={{
                                type: "tween",
                            }}
                        >
                            Participants:
                        </motion.p>
                        {selectedConversation.participants.map(
                            (participant: any) => (
                                <motion.div
                                    initial={{ opacity: 0, y: "+20%" }}
                                    animate={{
                                        opacity: 1,
                                        y: "0%",
                                        transition: {
                                            delay: 0.35,
                                        },
                                    }}
                                    exit={{ opacity: 0, y: "+20%" }}
                                    transition={{
                                        type: "tween",
                                    }}
                                    className="w-full px-5 py-3 flex items-center gap-2 bg-secondary rounded-lg"
                                    key={`ConversationInfo-participant-${participant._id}`}
                                >
                                    <UserAvatar user={participant} />
                                    <div className="w-full">
                                        <p className="text-2xl">
                                            {participant._id === user._id
                                                ? `You (${participant.displayName})`
                                                : participant.displayName}
                                        </p>
                                        <p className="text-xl text-slate-300">
                                            @{participant.username}
                                        </p>
                                    </div>
                                </motion.div>
                            )
                        )}
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: "+20%" }}
                        animate={{
                            opacity: 1,
                            y: "0%",
                            transition: {
                                delay: 0.5,
                            },
                        }}
                        exit={{ opacity: 0, y: "+20%" }}
                        transition={{
                            type: "tween",
                        }}
                        className="flex flex-col gap-2"
                    >
                        <div className="flex items-center justify-between">
                            <Grid3x3Rounded />
                            <p className="text-slate-500 text-xl">
                                {selectedConversation._id}
                            </p>
                        </div>

                        <div className="flex items-center justify-between">
                            <CalendarMonthRounded fontSize="medium" />
                            <p className="text-slate-500 text-xl">
                                {new Date(
                                    Number(selectedConversation.createdAt)
                                ).toLocaleString()}
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
};

export default ConversationInfo;
