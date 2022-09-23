import { useMutation } from "@apollo/client";
import {
    CalendarMonthRounded,
    CheckRounded,
    ContentCopyRounded,
    EditRounded,
    ErrorOutlineRounded,
    ErrorRounded,
    Grid3x3Rounded,
    PhotoCameraRounded,
    RestartAltRounded,
} from "@mui/icons-material";
import { Tooltip } from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import { FC, useEffect, useId, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AVAILABLE_THEMES from "../../constants/AVAILABLE_THEMES";
import { UPDATE_USER } from "../../graphql/mutations/user";
import useAuth from "../../hooks/useAuth";
import { RootState } from "../../redux";
import { appActions } from "../../redux/appSlice";
import { UserAvatar } from "../Avatar";
import Input from "../Input";

// TODO: Rework Profile Update functionality
const UserProfile: FC = ({ ...restProps }) => {
    const { user } = useAuth();
    const { currentTheme } = useSelector((state: RootState) => state.app);

    const dispatch = useDispatch();

    const [form, setForm] = useState<{
        avatar: any | null;
        firstName: string;
        lastName: string;
        username: string;
    }>({
        avatar: null,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
    });
    const [error, setError] = useState<string | null>(null);

    const componentId = useId();

    const [updateUser] = useMutation(UPDATE_USER, {
        onError(error) {
            setError(error.message);
            console.error(error);
        },
    });

    useEffect(() => {
        if (form["avatar"]) {
            updateUser({ variables: form });
        }
    }, [form["avatar"]]);

    // Clear form fileds when validation error happens
    useEffect(() => {
        if (error) {
            setForm({
                avatar: null,
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
            });
        }
    }, [error]);

    return (
        <motion.form
            initial={{ opacity: 0, x: "-100%" }}
            animate={{ opacity: 1, x: "0" }}
            exit={{ opacity: 0, x: "-100%" }}
            transition={{ type: "tween" }}
            className="absolute left-0 top-20 w-full h-[calc(100%_-_80px)] p-5 flex flex-col gap-6 bg-tertiary z-10 overflow-auto"
            id="updateUserForm"
            onChange={(e: any) => {
                setError(null);
                if (e.target.name === "avatar") {
                    setForm({
                        ...form,
                        [e.target.name as string]: e.target.files[0],
                    });
                } else {
                    setForm({
                        ...form,
                        [e.target.name as string]: e.target.value,
                    });
                }
            }}
            onSubmit={(e: any) => {
                e.preventDefault();
                setError(null);
                updateUser({
                    variables: form,
                });
            }}
            {...restProps}
        >
            <div className="w-full flex flex-col items-center justify-center gap-5">
                <Tooltip title={"Select Avatar"}>
                    <motion.div
                        initial={{ scale: 0.2 }}
                        animate={{
                            scale: 1,
                            transition: { type: "tween", delay: 0.2 },
                        }}
                        exit={{ scale: 0.2 }}
                        onClick={() => {
                            document
                                .getElementById(`imageFile#${componentId}`)
                                ?.click();
                        }}
                        className="relative flex items-center justify-center cursor-pointer rounded-full"
                    >
                        <UserAvatar isLarge={true} user={user} />
                        <PhotoCameraRounded className="absolute bottom-2 right-2 outline outline-[15px] outline-secondary rounded-full bg-secondary" />
                        <input
                            id={`imageFile#${componentId}`}
                            type="file"
                            name="avatar"
                            accept="image/*"
                            className="hidden"
                        />
                    </motion.div>
                </Tooltip>
            </div>
            <div className="flex flex-col gap-2">
                <InputField
                    label="First Name"
                    name="firstName"
                    value={form["firstName"]}
                    error={error}
                    editable={true}
                />

                <InputField
                    label="Last Name"
                    name="lastName"
                    value={form["lastName"]}
                    error={error}
                    editable={true}
                />

                <motion.p
                    initial={{ opacity: 0, y: "+20%" }}
                    animate={{
                        opacity: 1,
                        y: "0%",
                        transition: {
                            type: "tween",
                            delay: 0.3,
                        },
                    }}
                    exit={{ opacity: 0, y: "+20%" }}
                    className="flex items-center gap-2 text-lg text-slate-400"
                >
                    <ErrorOutlineRounded /> Will be displayed as{" "}
                    {form["firstName"] || user.firstName}{" "}
                    {form["lastName"] || user.lastName}
                </motion.p>
            </div>

            <InputField
                label="Username"
                name="username"
                value={form["username"]}
                error={error}
                editable={true}
            />

            <InputField
                label="Email"
                name="email"
                value={user.email}
                error={null}
            />

            <motion.div
                initial={{ opacity: 0, y: "+20%" }}
                animate={{
                    opacity: 1,
                    y: "0%",
                    transition: {
                        type: "tween",
                        delay: 0.3,
                    },
                }}
                exit={{ opacity: 0, y: "+20%" }}
                className="flex flex-col gap-1"
            >
                <motion.p className="flex items-center gap-2 text-xl text-slate-400">
                    Color Theme:
                </motion.p>
                <div className="flex items-center">
                    <div className="flex w-[1px] grow items-center justify-start gap-2 overflow-auto rounded-lg">
                        <motion.div className="flex items-center justify-start gap-2 py-2">
                            {Object.entries(AVAILABLE_THEMES).map(
                                ([themeName, theme]) => (
                                    <Tooltip
                                        title={`${
                                            themeName.charAt(0).toUpperCase() +
                                            themeName.slice(1)
                                        }${
                                            currentTheme == themeName
                                                ? " (Active)"
                                                : ""
                                        }`}
                                        key={`${themeName}`}
                                    >
                                        <motion.div
                                            className={`w-16 h-16 rounded-full cursor-pointer flex items-center justify-center`}
                                            style={{
                                                backgroundColor: theme.primary,
                                            }}
                                            onClick={() => {
                                                dispatch(
                                                    appActions.changeTheme(
                                                        themeName
                                                    )
                                                );
                                            }}
                                        >
                                            {currentTheme == themeName && (
                                                <CheckRounded fontSize="large" />
                                            )}
                                        </motion.div>
                                    </Tooltip>
                                )
                            )}
                        </motion.div>
                    </div>
                    <Tooltip title="Reset">
                        <div
                            className={`flex flex-shrink items-center justify-center h-full cursor-pointer pl-2`}
                            onClick={() => {
                                dispatch(appActions.changeTheme("default"));
                            }}
                        >
                            <RestartAltRounded fontSize="medium" />
                        </div>
                    </Tooltip>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: "+20%" }}
                animate={{
                    opacity: 1,
                    y: "0%",
                    transition: {
                        type: "tween",
                        delay: 0.5,
                    },
                }}
                exit={{ opacity: 0, y: "+20%" }}
                className="flex flex-col gap-2"
            >
                <div className="flex items-center justify-between">
                    <Grid3x3Rounded />
                    <p className="text-slate-500 text-xl">{user._id}</p>
                </div>

                <div className="flex items-center justify-between">
                    <CalendarMonthRounded />
                    <p className="text-slate-500 text-xl">
                        {new Date(Number(user.createdAt)).toLocaleString()}
                    </p>
                </div>
            </motion.div>
        </motion.form>
    );
};

const InputField: FC<{
    label: string;
    name: string;
    value?: string;
    error: string | null;
    editable?: boolean;
}> = ({ label, name, value, error, editable = false }) => {
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (error) {
            setIsEditing(false);
        }
    }, [error]);

    return (
        <motion.div
            initial={{ opacity: 0, y: "+20%" }}
            animate={{
                opacity: 1,
                y: "0%",
                transition: {
                    type: "tween",
                    delay: 0.3,
                },
            }}
            exit={{ opacity: 0, y: "+20%" }}
            className="flex flex-col gap-1"
        >
            <div className="inline">
                <motion.p className="flex items-center gap-2 text-xl text-slate-400">
                    {label}:
                </motion.p>
            </div>
            <div className="flex items-center justify-between">
                {!editable || !isEditing ? (
                    <p className="text-2xl">{value}</p>
                ) : (
                    <Input
                        value={value}
                        name={name}
                        onKeyDown={(e: any) => {
                            if (e.key === "Enter") {
                                (
                                    document.getElementById(
                                        `updateUserForm`
                                    ) as HTMLFormElement
                                ).requestSubmit();
                                setIsEditing(!isEditing);
                            }
                        }}
                        onChange={() => {
                            // Handled by parent Form
                        }}
                    />
                )}
                {editable ? (
                    <div
                        className="h-full pl-2 flex items-center justify-center cursor-pointer"
                        onClick={(e) => {
                            if (isEditing) {
                                (
                                    document.getElementById(
                                        `updateUserForm`
                                    ) as HTMLFormElement
                                ).requestSubmit();
                            }
                            setIsEditing(!isEditing);
                        }}
                    >
                        {isEditing ? (
                            <CheckRounded fontSize="large" />
                        ) : (
                            <EditRounded />
                        )}
                    </div>
                ) : (
                    <div
                        className="h-full pl-2 flex items-center justify-center cursor-pointer"
                        onClick={() => {
                            navigator.clipboard.writeText(value!);
                        }}
                    >
                        <ContentCopyRounded />
                    </div>
                )}
            </div>
            <AnimatePresence>
                {error && error.includes(label) && (
                    <motion.p
                        initial={{ y: "-100%", opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: "+100%", opacity: 0 }}
                        transition={{
                            type: "tween",
                        }}
                        className="flex items-center gap-2 w-full text-xl text-red-600"
                    >
                        <ErrorRounded />
                        {error}
                    </motion.p>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default UserProfile;
