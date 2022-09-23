import { useSubscription } from "@apollo/client";
import { MessageRounded, SearchOffRounded } from "@mui/icons-material";
import { AnimatePresence, motion } from "framer-motion";
import dynamic from "next/dynamic";
import { FC, Suspense, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ClipLoader } from "react-spinners";
import {
    CONVERSATION_CREATED,
    CONVERSATION_UPDATED,
} from "../../graphql/subscriptions/conversation";
import useAuth from "../../hooks/useAuth";
import { RootState } from "../../redux";
import { appActions } from "../../redux/appSlice";
import getConversationName from "../../utils/getConversationName";
import Conversation from "./Conversation";
import Header from "./Header";

const Search = dynamic(() => import("./Search"), {
    suspense: true,
});
const UserProfile = dynamic(() => import("./UserProfile"));
const StartConversation = dynamic(() => import("./StartConversation"));

type SidebarProps = {
    [propName: string]: any;
};
const Sidebar: FC<SidebarProps> = ({ ...restProps }) => {
    const dispatch = useDispatch();

    const { user } = useAuth();

    const {
        conversations,
        selectedConversation,
        searchQuery,
        isEditingProfile,
        isStartingConversation,
        isConversationsLoading,
        isConversationInfoLoading,
    } = useSelector((state: RootState) => state.app);
    const conversationsContainer = useRef<HTMLDivElement>(null);

    const { data: conversationCreatedSubscription } =
        useSubscription(CONVERSATION_CREATED);

    const { data: conversationUpdatedSubscription } =
        useSubscription(CONVERSATION_UPDATED);

    // Populate conversations of participant (user)
    useEffect(() => {
        dispatch(appActions.populate() as any);
    }, []);

    // Append created / updated conversation
    useEffect(() => {
        const conversationCreated =
            conversationCreatedSubscription?.conversationCreated;

        if (conversationCreated) {
            dispatch(appActions.appendCreatedConversation(conversationCreated));
        }
    }, [conversationCreatedSubscription]);

    useEffect(() => {
        const conversationUpdated =
            conversationUpdatedSubscription?.conversationUpdated;

        if (conversationUpdated) {
            dispatch(appActions.appendUpdatedConversation(conversationUpdated));
        }
    }, [conversationUpdatedSubscription]);

    // Scroll to top of container when conversation is created / updated
    useEffect(() => {
        if (conversationsContainer.current) {
            Array.from(conversationsContainer.current.children)
                .at(0)
                ?.scrollIntoView({
                    behavior: "smooth",
                });
        }
    }, [conversations]);

    return (
        <div
            className={`w-full h-full ${
                (isConversationInfoLoading || selectedConversation) && "hidden"
            } lg:flex lg:col-span-4 relative`}
        >
            <div
                className="w-full h-full flex flex-col relative overflow-hidden"
                {...restProps}
            >
                <Header />

                <Suspense
                    fallback={<div className="w-full h-20 bg-secondary" />}
                >
                    <Search />
                </Suspense>

                <div className="h-[calc(100%_-_160px)] flex flex-col overflow-hidden">
                    {isConversationsLoading ? (
                        <div className="w-full h-full flex items-center justify-center">
                            <ClipLoader color="#FFF" size={25} />
                        </div>
                    ) : (
                        <div
                            ref={conversationsContainer}
                            className="w-full h-[1px] grow xl:h-[540px] space-y-1 bg-tertiary overflow-x-hidden overflow-y-auto"
                        >
                            {conversations && conversations.length != 0
                                ? conversations
                                      ?.filter((conversation: any) => {
                                          if (!searchQuery) {
                                              return true;
                                          }

                                          const conversationName =
                                              getConversationName(
                                                  conversation,
                                                  user._id
                                              );

                                          if (
                                              conversationName
                                                  .toLowerCase()
                                                  .includes(
                                                      searchQuery.toLowerCase()
                                                  )
                                          ) {
                                              return true;
                                          }
                                      })
                                      .map((conversation: any) => (
                                          <Conversation
                                              conversation={conversation}
                                              isSelected={
                                                  selectedConversation?._id ===
                                                  conversation?._id
                                              }
                                              key={`sidebarConversation-${conversation._id}`}
                                              onClick={() => {
                                                  dispatch(
                                                      appActions.selectConversation(
                                                          conversation._id
                                                      ) as any
                                                  );
                                              }}
                                          />
                                      ))
                                : !searchQuery && (
                                      <motion.p
                                          initial={{ x: "-100%" }}
                                          animate={{ x: "0%" }}
                                          exit={{ x: "100%" }}
                                          className="w-full text-center py-5 text-2xl"
                                      >
                                          No available conversations!
                                      </motion.p>
                                  )}

                            {searchQuery ? (
                                <motion.div
                                    initial={{ x: "-100%" }}
                                    animate={{ x: "0%" }}
                                    exit={{ x: "-100%" }}
                                    transition={{ type: "tween" }}
                                    onClick={() => {
                                        dispatch(appActions.setSearchQuery(""));
                                    }}
                                    className="w-full h-20 px-5 flex items-center justify-start gap-2 bg-secondary cursor-pointer"
                                >
                                    <SearchOffRounded fontSize="large" />
                                    Show all conversations
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ x: "-100%" }}
                                    animate={{ x: "0%" }}
                                    exit={{ x: "-100%" }}
                                    transition={{ type: "tween" }}
                                    onClick={() => {
                                        dispatch(
                                            appActions.toggleConversationStarting()
                                        );
                                    }}
                                    className="w-full h-20 px-5 flex items-center justify-start gap-2 bg-primary cursor-pointer"
                                >
                                    <MessageRounded fontSize="large" />
                                    <p>Start a new conversation!</p>
                                </motion.div>
                            )}
                        </div>
                    )}
                </div>
                <AnimatePresence>
                    {isStartingConversation && (
                        <StartConversation key="start-conversation" />
                    )}
                    {isEditingProfile && <UserProfile key="user-profile" />}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Sidebar;
