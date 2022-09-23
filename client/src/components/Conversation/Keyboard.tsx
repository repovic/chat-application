import { useMutation } from "@apollo/client";
import {
    AddPhotoAlternateOutlined,
    CloseOutlined,
    SendOutlined,
} from "@mui/icons-material";
import { Tooltip } from "@mui/material";
import { motion } from "framer-motion";
import { FC, RefObject, useEffect, useId, useState } from "react";
import { useSelector } from "react-redux";
import { ClipLoader } from "react-spinners";
import { CREATE_MESSAGE } from "../../graphql/mutations/message";
import useAuth from "../../hooks/useAuth";
import { RootState } from "../../redux";
import getConversationName from "../../utils/getConversationName";
import Input from "../Input";

type KeyboardProps = {
    messagesContainer: RefObject<HTMLDivElement>;
    [propName: string]: any;
};
const Keyboard: FC<KeyboardProps> = ({ messagesContainer, ...restProps }) => {
    const { user } = useAuth();
    const { selectedConversation } = useSelector(
        (state: RootState) => state.app
    );

    const componentId = useId();
    const [content, setContent] = useState("");
    const [image, setImage] = useState<any | null>(null);

    const conversationName = getConversationName(
        selectedConversation,
        user._id
    );

    const [createMessage, { loading: isLoading }] = useMutation(
        CREATE_MESSAGE,
        {
            variables: {
                conversationId: selectedConversation._id,
                contentType: image ? "image" : "text",
                content,
                image,
            },
        }
    );

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        if (!content && !image) return;

        try {
            await createMessage();
            setContent("");
            setImage(null);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        setContent("");
        setImage(null);
    }, [selectedConversation._id]);

    return (
        <motion.div
            initial={{ bottom: "-100%" }}
            animate={{ bottom: "0%" }}
            exit={{ bottom: "-100%" }}
            transition={{ type: "tween" }}
            className="sticky bottom-0 left-0 w-full h-20 px-5 bg-secondary flex items-center justify-center gap-3"
        >
            {!image ? (
                <form
                    className="w-full h-full flex items-center justify-center gap-2"
                    onSubmit={handleSubmit}
                >
                    <Input
                        placeholder={`Message ${conversationName}`}
                        value={content}
                        onChange={(e: any) => {
                            setContent(e.target.value);
                        }}
                        onFocus={() => {
                            setTimeout(() => {
                                if (messagesContainer.current) {
                                    Array.from(
                                        messagesContainer.current.children
                                    )
                                        .at(-1)
                                        ?.scrollIntoView({
                                            behavior: "smooth",
                                        });
                                }
                            }, 250);
                        }}
                        variant="tertiary"
                        keyboardAlias={"Alt"}
                        disabled={isLoading}
                    />
                    {!content && (
                        <Tooltip title="Attach Image">
                            <div
                                onClick={() => {
                                    document
                                        .getElementById(
                                            `imageFile#${componentId}`
                                        )
                                        ?.click();
                                }}
                                className="flex-shrink px-5 py-3.5 bg-tertiary hover:bg-primary flex items-center justify-center rounded cursor-pointer"
                            >
                                <AddPhotoAlternateOutlined fontSize="medium" />
                                <input
                                    id={`imageFile#${componentId}`}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e: any) => {
                                        const image = e.target.files[0];
                                        setImage(image);
                                    }}
                                />
                            </div>
                        </Tooltip>
                    )}
                </form>
            ) : (
                <div className="w-[1px] flex-grow flex items-center justify-between px-5 py-3 bg-tertiary rounded">
                    <p className="w-full text-ellipsis whitespace-nowrap text-left overflow-hidden">
                        {image.name}
                    </p>
                    <Tooltip title="Discard image" placement={"left"}>
                        <div
                            onClick={() => {
                                setImage(null);
                            }}
                            className="h-full ml-2 flex items-center justify-center cursor-pointer"
                        >
                            <CloseOutlined fontSize="medium" />
                        </div>
                    </Tooltip>
                </div>
            )}

            <Tooltip title={!isLoading ? "Send" : "Sending..."}>
                <div
                    onClick={handleSubmit}
                    className={`px-5 py-3.5 ${
                        !content && !image ? "bg-tertiary" : "bg-primary"
                    } flex items-center justify-center rounded ${
                        !content && !image
                            ? "cursor-not-allowed"
                            : "cursor-pointer"
                    }`}
                >
                    {isLoading ? (
                        <ClipLoader color="#FFF" size={25} />
                    ) : (
                        <SendOutlined fontSize="medium" />
                    )}
                </div>
            </Tooltip>
        </motion.div>
    );
};

export default Keyboard;
