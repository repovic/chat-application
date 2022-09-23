import { AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { FC, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux";
import { appActions } from "../../redux/appSlice";
import Header from "./Header";
import Keyboard from "./Keyboard";
import MessageHistory from "./MessageHistory";

const UserInfo = dynamic(() => import("./UserInfo"));
const ConversationInfo = dynamic(() => import("./ConversationInfo"));

type ConversationProps = {
    [propName: string]: any;
};
const Conversation: FC<ConversationProps> = ({ ...restProps }) => {
    const dispatch = useDispatch();
    const {
        selectedConversation,
        isViewingUserInfo,
        isViewingConversationInfo,
    } = useSelector((state: RootState) => state.app);

    const messagesContainer = useRef<HTMLDivElement>(null);

    useEffect(() => {
        dispatch(appActions.hideUserInfo());
        dispatch(appActions.hideConversationInfo());
    }, [selectedConversation]);

    return (
        <div
            className="w-full h-full flex flex-col relative overflow-x-hidden overflow-y-auto"
            {...restProps}
        >
            <Header />

            <MessageHistory messagesContainer={messagesContainer} />

            <Keyboard messagesContainer={messagesContainer} />

            <AnimatePresence>
                {isViewingUserInfo && <UserInfo key="user-info" />}
                {isViewingConversationInfo && (
                    <ConversationInfo key="conversation-info" />
                )}
            </AnimatePresence>
        </div>
    );
};

export default Conversation;
