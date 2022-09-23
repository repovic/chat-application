import { useMutation, useQuery } from "@apollo/client";
import { ErrorRounded } from "@mui/icons-material";
import { AnimatePresence, motion } from "framer-motion";
import { FC, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { ClipLoader } from "react-spinners";
import { CREATE_CONVERSATION } from "../../graphql/mutations/conversation";
import { USERS } from "../../graphql/queries/user";
import useAuth from "../../hooks/useAuth";
import { appActions } from "../../redux/appSlice";
import { UserAvatar } from "../Avatar";
import Button from "../Button";
import FormGroup from "../FormGroup";
import Input from "../Input";

type StartConversationProps = {
    [propName: string]: any;
};
const StartConversation: FC<StartConversationProps> = ({ ...restProps }) => {
    const dispatch = useDispatch();
    const { user } = useAuth();

    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentShownUsers, setCurrentShownUsers] = useState(users);

    const [error, setError] = useState<string | null>(null);

    // Array of Selected Users IDs
    const [selectedUsers, setSelectedUsers] = useState<string[]>([user?._id]);
    const [conversationName, setConversationName] = useState<string | null>(
        null
    );

    const { data: usersQuery, loading: isLoading } = useQuery(USERS, {
        fetchPolicy: "no-cache",
    });

    const [createConversation] = useMutation(CREATE_CONVERSATION, {
        variables: {
            participants: selectedUsers,
            name: conversationName,
        },
    });

    const startConversation = async (e: any) => {
        try {
            e.preventDefault();

            const {
                data: { createConversation: createdConversation },
            } = await createConversation();

            dispatch(appActions.toggleConversationStarting());
            dispatch(
                appActions.selectConversation(createdConversation._id) as any
            );
        } catch (error: any) {
            setError(error.message);
            console.error(error);
        }
    };

    useEffect(() => {
        const users = usersQuery?.users;
        if (users) {
            // Remove authenticated user from array of available participants
            setUsers(users.filter(({ _id }: any) => _id !== user._id));
        }
    }, [usersQuery]);

    useEffect(() => {
        setSearchQuery("");
        setCurrentShownUsers(users);
    }, [users]);

    useEffect(() => {
        if (searchQuery) {
            setCurrentShownUsers(
                users?.filter((user: any) =>
                    user.displayName
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase())
                )
            );
        } else {
            setCurrentShownUsers(users);
        }
    }, [searchQuery]);

    // Clear conversation name field if user unselect 3rd participant
    useEffect(() => {
        setConversationName("");
    }, [selectedUsers.length <= 2]);

    useEffect(() => {
        setError(null);
    }, [searchQuery, selectedUsers, conversationName]);

    return (
        <motion.form
            initial={{ opacity: 0, x: "-100%" }}
            animate={{ opacity: 1, x: "0" }}
            exit={{ opacity: 0, x: "-100%" }}
            transition={{ type: "tween" }}
            className="absolute left-0 top-20 w-full h-[calc(100%_-_80px)] p-5 flex flex-col gap-6 bg-tertiary z-10 overflow-auto"
            onSubmit={startConversation}
            {...restProps}
        >
            <FormGroup>
                <motion.p
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
                >
                    Participants:
                </motion.p>
                <motion.div
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
                    <Input
                        placeholder="Search participants..."
                        value={searchQuery}
                        isForSearch={true}
                        clearValue={() => setSearchQuery("")}
                        onChange={(e: any) => {
                            setSearchQuery(e.target.value);
                        }}
                        variant={"secondary"}
                    />
                </motion.div>
                <div className="flex items-center flex-col gap-2">
                    {!isLoading ? (
                        currentShownUsers.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, y: "+20%" }}
                                animate={{
                                    opacity: 1,
                                    y: "0%",
                                    transition: {
                                        delay: 0.4,
                                    },
                                }}
                                exit={{ opacity: 0, y: "+20%" }}
                                transition={{
                                    type: "tween",
                                }}
                            >
                                <p className="w-full text-center py-5 text-2xl">
                                    No available participants!
                                </p>
                            </motion.div>
                        ) : (
                            currentShownUsers.slice(0, 3).map((user: any) => {
                                return (
                                    <Participant
                                        participant={user}
                                        key={user._id}
                                        isSelected={selectedUsers.includes(
                                            user._id
                                        )}
                                        toggleSelected={() => {
                                            const isSelected =
                                                selectedUsers.includes(
                                                    user._id
                                                );

                                            if (isSelected) {
                                                setSelectedUsers(
                                                    selectedUsers.filter(
                                                        (selectedUser) =>
                                                            selectedUser !==
                                                            user._id
                                                    )
                                                );
                                            } else {
                                                setSelectedUsers([
                                                    ...selectedUsers,
                                                    user._id,
                                                ]);
                                            }
                                        }}
                                    />
                                );
                            })
                        )
                    ) : (
                        <div className="py-5">
                            <ClipLoader color="#FFF" size={25} />
                        </div>
                    )}
                </div>
                {!isLoading && !searchQuery && users.length - 3 > 0 && (
                    <motion.p
                        className="text-xl text-slate-300"
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
                    >
                        and {users.length - 3} more, search for filter...
                    </motion.p>
                )}
            </FormGroup>
            <AnimatePresence>
                {selectedUsers.length > 2 && (
                    <motion.div
                        initial={{ opacity: 0, y: "-20%" }}
                        animate={{
                            opacity: 1,
                            y: "0%",
                            transition: {
                                delay: 0.3,
                            },
                        }}
                        exit={{ opacity: 0, y: "-20%" }}
                        transition={{
                            type: "tween",
                        }}
                    >
                        <FormGroup>
                            <p>Name:</p>
                            <Input
                                value={conversationName}
                                onChange={(e: any) => {
                                    setConversationName(e.target.value);
                                }}
                                placeholder="e.g. Staff Members"
                            />
                        </FormGroup>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                initial={{ opacity: 0, y: "+20%", scale: 0.5 }}
                animate={{
                    opacity: 1,
                    y: "0%",
                    scale: 1,
                    transition: {
                        type: "tween",
                        delay: 0.5,
                    },
                }}
                exit={{ opacity: 0, y: "+20%" }}
                className="flex-shrink"
            >
                <Button
                    onClick={startConversation}
                    disabled={
                        selectedUsers.length < 2 ||
                        (selectedUsers.length > 2 && !conversationName)
                    }
                >
                    Start Conversation
                </Button>
            </motion.div>
            <AnimatePresence>
                {error && (
                    <motion.p
                        initial={{ y: "-100%", opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: "+100%", opacity: 0 }}
                        transition={{
                            type: "tween",
                        }}
                        className="flex items-center gap-2 w-full text-xl text-red-600 -mt-3"
                    >
                        <ErrorRounded />
                        {error}
                    </motion.p>
                )}
            </AnimatePresence>
        </motion.form>
    );
};

type ParticipantProps = {
    participant: any;
    isSelected: boolean;
    toggleSelected: any;
};
const Participant: FC<ParticipantProps> = ({
    participant,
    isSelected,
    toggleSelected,
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: "+20%" }}
            animate={{
                opacity: 1,
                y: "0%",
                transition: {
                    delay: 0.4,
                },
            }}
            exit={{ opacity: 0, y: "+20%" }}
            transition={{
                type: "tween",
            }}
            onClick={() => {
                toggleSelected();
            }}
            key={`StartConversation-participant-${participant._id}`}
            className={`w-full p-2 px-5 flex items-center gap-2 rounded-lg bg-secondary select-none cursor-pointer`}
        >
            <UserAvatar user={participant} />
            <div className="w-full">
                <p className="text-2xl">{participant.displayName}</p>
                <p className="text-xl text-slate-300">
                    @{participant.username}
                </p>
            </div>
            <div
                className={`p-2 rounded-full justify-self-end border-8 ${
                    isSelected
                        ? "border-tertiary bg-primary"
                        : "border-tertiary"
                }`}
            />
        </motion.div>
    );
};

export default StartConversation;
