import { useQuery, useSubscription } from "@apollo/client";
import { Tooltip } from "@mui/material";
import { motion } from "framer-motion";
import { FC, RefObject, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ClipLoader } from "react-spinners";
import validator from "validator";
import NoDataIllustration from "../../assets/noDataIllustration.svg";
import { MESSAGES_OF_CONVERSATION } from "../../graphql/queries/message";
import { MESSAGE_CREATED } from "../../graphql/subscriptions/message";
import useAuth from "../../hooks/useAuth";
import { RootState } from "../../redux";
import { appActions } from "../../redux/appSlice";
import { UserAvatar } from "../Avatar";

type MessageHistoryProps = {
    messagesContainer: RefObject<HTMLDivElement>;
    [propName: string]: any;
};
const MessageHistory: FC<MessageHistoryProps> = ({
    messagesContainer,
    ...restProps
}) => {
    const { user } = useAuth();
    const { selectedConversation } = useSelector(
        (state: RootState) => state.app
    );

    const [messages, setMessages] = useState<any>(null);

    const {
        data: messagesOfConversationQuery,
        refetch: refetchMessages,
        loading: isLoading,
    } = useQuery(MESSAGES_OF_CONVERSATION, {
        variables: {
            conversationId: selectedConversation._id,
        },
        fetchPolicy: "no-cache",
    });

    const { data: messageCreatedSubscription } = useSubscription(
        MESSAGE_CREATED,
        {
            variables: {
                conversationId: selectedConversation._id,
            },
        }
    );

    useEffect(() => {
        if (selectedConversation._id) {
            refetchMessages();
        }

        return setMessages(null);
    }, [selectedConversation._id]);

    useEffect(() => {
        const messagesOfConversation =
            messagesOfConversationQuery?.messagesOfConversation;

        if (messagesOfConversation) {
            setMessages(messagesOfConversation);
        }
    }, [messagesOfConversationQuery]);

    useEffect(() => {
        const messageCreated = messageCreatedSubscription?.messageCreated;

        if (messageCreated) {
            setMessages([...messages, messageCreated]);
        }
    }, [messageCreatedSubscription]);

    // Scroll to bottom of container when message is created
    useEffect(() => {
        // Wait for images in messages to load properly
        const scrollToBottomTimeout = setTimeout(() => {
            if (messagesContainer.current && !isLoading) {
                Array.from(messagesContainer.current.children)
                    .at(-1)
                    ?.scrollIntoView({
                        behavior: "smooth",
                    });
            }
        }, 250);

        return () => {
            clearTimeout(scrollToBottomTimeout);
        };
    }, [messages]);

    return (
        <div
            className="w-full h-[1px] grow xl:h-[540px] bg-tertiary p-5 overflow-x-hidden overflow-y-auto"
            {...restProps}
        >
            {messages !== null ? (
                messages.length !== 0 ? (
                    <motion.div
                        initial={false}
                        animate={{ opacity: 1 }}
                        className="w-full h-full flex flex-col gap-5 relative"
                        ref={messagesContainer}
                        id="messagesContainer"
                    >
                        {messages.map((message: any) => (
                            <Message
                                message={message}
                                isFromUser={message.sender._id === user._id}
                                key={`conversationMessage-${message._id}`}
                            />
                        ))}
                    </motion.div>
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-5">
                        <motion.div
                            initial={{ y: "-30%" }}
                            animate={{ y: "0%" }}
                            transition={{ type: "tween" }}
                        >
                            <NoDataIllustration className="w-40" />
                        </motion.div>
                        <motion.p
                            initial={{ y: "30%" }}
                            animate={{ y: "0%" }}
                            transition={{ type: "tween" }}
                            className="text-center text-xl lg:text-2xl text-slate-300"
                        >
                            Be first to send message in this conversation!
                        </motion.p>
                    </div>
                )
            ) : (
                <div className="w-full h-full flex items-center justify-center">
                    <ClipLoader color="#FFF" size={25} />
                </div>
            )}
        </div>
    );
};

type MessageProps = {
    message: any;
    isFromUser: boolean;
};
const Message: FC<MessageProps> = ({ message, isFromUser }) => {
    const dispatch = useDispatch();
    const {
        selectedUser,
        selectedConversation: { _id: conversationId, type: conversationType },
    } = useSelector((state: RootState) => state.app);

    const [isHovering, setIsHovering] = useState(false);

    return (
        <motion.div
            initial={{ x: isFromUser ? "+100%" : "-100%" }}
            animate={{ x: "0" }}
            transition={{
                type: "tween",
            }}
            onMouseEnter={() => {
                setIsHovering(true);
            }}
            onMouseLeave={() => {
                setIsHovering(false);
            }}
            className={`flex ${
                isFromUser
                    ? "justify-start flex-row-reverse"
                    : "justify-start flex-row"
            } items-start gap-5 overflox-x-hidden overflow-y-visible last-of-type:pb-5`}
        >
            <Tooltip
                title={`${
                    selectedUser?._id === message.sender._id ? "Hide " : "Show "
                } Profile`}
                disableHoverListener={isFromUser}
                disableFocusListener={isFromUser}
                disableTouchListener={isFromUser}
            >
                <motion.div
                    whileHover={
                        !isFromUser
                            ? {
                                  scale: 1.1,
                              }
                            : {}
                    }
                    whileTap={!isFromUser ? { scale: 0.9 } : {}}
                    className={`${!isFromUser && "cursor-pointer"}`}
                >
                    <UserAvatar
                        user={message.sender}
                        onClick={() => {
                            if (!isFromUser) {
                                if (selectedUser?._id === message.sender._id) {
                                    dispatch(appActions.hideUserInfo());
                                } else {
                                    dispatch(
                                        appActions.selectUser(
                                            message.sender._id
                                        ) as any
                                    );
                                }
                            }
                        }}
                    />
                </motion.div>
            </Tooltip>
            <div
                className={`${
                    message.contentType === "text" ? "px-3 py-2" : "p-2"
                } rounded bg-secondary max-w-[50%]`}
            >
                <p className="text-xl">
                    {conversationType === "group" &&
                        !isFromUser &&
                        message.sender.displayName}
                </p>
                {message.contentType === "text" &&
                    (validator.isEmail(message.content) ? (
                        <a
                            href={`mailto:${message.content}`}
                            rel="noopener noreferrer"
                            target="_blank"
                        >
                            <p className="w-full text-lg break-all text-blue-500 underline font-bold">
                                {message.content}
                            </p>
                        </a>
                    ) : validator.isURL(message.content, {
                          require_protocol: true,
                      }) ? (
                        <a
                            href={message.content}
                            rel="noopener noreferrer"
                            target="_blank"
                        >
                            <p className="w-full text-lg break-all text-blue-500 underline font-bold">
                                {message.content}
                            </p>
                        </a>
                    ) : (
                        <p className="w-full text-lg break-all">
                            {message.content}
                        </p>
                    ))}

                {message.contentType === "image" && (
                    <div
                        className={`${
                            !isFromUser &&
                            conversationType === "group" &&
                            "mt-2"
                        }`}
                    >
                        <img
                            src={
                                process.env.NEXT_PUBLIC_SERVER_STATIC?.concat(
                                    `conversation/${conversationId}/${message.content}`
                                ) as string
                            }
                            className="rounded-lg  max-h-96"
                        />
                    </div>
                )}
            </div>
            {isHovering && (
                <div className="self-center text-lg text-slate-400 flex items-center justify-center">
                    {new Date(Number(message.createdAt)).toLocaleTimeString()}
                </div>
            )}
        </motion.div>
    );
};

export default MessageHistory;
