import { useSubscription } from "@apollo/client";
import { ArrowBackIosNewOutlined, InfoOutlined } from "@mui/icons-material";
import { Tooltip } from "@mui/material";
import { motion } from "framer-motion";
import { FC, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import TimeAgo from "react-timeago";
import { USER_UPDATED } from "../../graphql/subscriptions/user";
import useAuth from "../../hooks/useAuth";
import { RootState } from "../../redux";
import { appActions } from "../../redux/appSlice";
import getConversationName from "../../utils/getConversationName";
import getRecipientsFromParticipants from "../../utils/getRecipientsFromParticipants";
import { ConversationAvatar } from "../Avatar";

type HeaderProps = {
    [propName: string]: any;
};
const Header: FC<HeaderProps> = ({ ...restProps }) => {
    const dispatch = useDispatch();
    const { user } = useAuth();
    const { selectedConversation, selectedUser } = useSelector(
        (state: RootState) => state.app
    );

    const conversationName = getConversationName(
        selectedConversation,
        user._id
    );
    const recipients = getRecipientsFromParticipants(
        selectedConversation.participants,
        user._id
    );

    const [recipient, setRecipient] = useState(
        selectedConversation.type === "private" ? recipients[0] : null
    );

    const { data: userUpdatedSubscription } = useSubscription(USER_UPDATED, {
        variables: {
            userId: recipient !== null ? recipient._id : "",
        },
        skip: recipient === null,
    });

    useEffect(() => {
        const updatedUser = userUpdatedSubscription?.userUpdated;
        if (updatedUser) {
            setRecipient(updatedUser);
        }
    }, [userUpdatedSubscription]);

    useEffect(() => {
        setRecipient(
            selectedConversation.type === "private" ? recipients[0] : null
        );
    }, [selectedConversation]);

    return (
        <motion.div
            initial={{ y: "-100%" }}
            animate={{ y: "0%" }}
            exit={{ y: "-100%" }}
            transition={{ type: "tween" }}
            className="w-full h-20 px-5 flex items-center justify-between bg-secondary"
            {...restProps}
        >
            <div className="w-full h-full flex items-center justify-start gap-5">
                <div
                    className="h-full px-2 flex items-center justify-center cursor-pointer lg:hidden"
                    onClick={() => {
                        dispatch(appActions.unselectConversation());
                    }}
                >
                    <ArrowBackIosNewOutlined
                        className="cursor-pointer"
                        fontSize="medium"
                    />
                </div>
                <div className="lg:w-full h-full flex items-center justify-start gap-2">
                    <ConversationAvatar
                        forConversationType={selectedConversation.type}
                        conversationRecipients={recipients}
                    />
                    <div className="flex flex-col">
                        <p className="text-2xl">
                            {selectedConversation.type === "group"
                                ? conversationName
                                : recipient?.displayName}

                            {selectedConversation.type === "group" && (
                                <span className="hidden lg:inline ml-2 text-lg px-2 bg-primary rounded">
                                    {selectedConversation.type.toUpperCase()}
                                </span>
                            )}
                        </p>
                        {selectedConversation.type === "private" &&
                            (recipient?.isOnline ? (
                                <div className="flex items-center">
                                    <div className="flex items-center justify-center relative pr-2">
                                        <span className="animate-ping w-4 h-4 bg-green-600/75 rounded-full absolute" />
                                        <span className="w-3 h-3 bg-green-600 rounded-full" />
                                    </div>
                                    <p className="text-xl text-green-600 font-bold">
                                        Online
                                    </p>
                                </div>
                            ) : (
                                <p className="w-full text-ellipsis whitespace-nowrap text-xl text-slate-300 font-semibold">
                                    <TimeAgo
                                        date={
                                            new Date(
                                                Number(recipient?.lastOnline)
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

                                            return `Last Online: ${value}${units[unit]} ago`;
                                        }}
                                    />
                                </p>
                            ))}
                    </div>
                </div>
            </div>

            <Tooltip title="Conversation Info">
                <div
                    className="h-full px-2 flex items-center justify-center cursor-pointer"
                    onClick={() => {
                        if (selectedConversation.type === "group") {
                            dispatch(appActions.toggleConversationInfo());
                        } else {
                            if (selectedUser) {
                                dispatch(appActions.hideUserInfo());
                            } else {
                                dispatch(
                                    appActions.selectUser(recipient._id) as any
                                );
                            }
                        }
                    }}
                >
                    <InfoOutlined
                        className="cursor-pointer"
                        fontSize="medium"
                    />
                </div>
            </Tooltip>
        </motion.div>
    );
};

export default Header;
