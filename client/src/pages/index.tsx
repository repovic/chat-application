import type { NextPage } from "next";
import { useSelector } from "react-redux";
import { ClipLoader } from "react-spinners";
import NoConversationSelectedIllustration from "../assets/noConversationSelectedIllustration.svg";
import Conversation from "../components/Conversation";
import Page from "../components/Page";
import useAuth from "../hooks/useAuth";
import { RootState } from "../redux";
import getConversationName from "../utils/getConversationName";

const Home: NextPage = () => {
    const { user } = useAuth();
    const { selectedConversation, isConversationInfoLoading } = useSelector(
        (state: RootState) => state.app
    );

    return (
        <Page
            title={`Chat Application / ${
                selectedConversation
                    ? `${getConversationName(selectedConversation, user._id)}`
                    : `Conversations`
            }`}
            isProtectedPage={true}
        >
            <div
                className={`${
                    isConversationInfoLoading || selectedConversation
                        ? "flex"
                        : "hidden"
                } w-full h-full lg:flex lg:col-span-6 relative`}
            >
                {isConversationInfoLoading ? (
                    <div className="w-full h-full flex items-center justify-center">
                        <ClipLoader color="#FFF" size={35} />
                    </div>
                ) : selectedConversation ? (
                    <Conversation />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <NoConversationSelectedIllustration className="w-80" />
                    </div>
                )}
            </div>
        </Page>
    );
};

export default Home;
