import {
    CalendarMonthRounded,
    ContentCopyRounded,
    Grid3x3Rounded,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { FC } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ClipLoader } from "react-spinners";
import TimeAgo from "react-timeago";
import { RootState } from "../../redux";
import { appActions } from "../../redux/appSlice";
import { UserAvatar } from "../Avatar";
import Button from "../Button";

type UserInfoProps = {
    [propName: string]: any;
};
const UserInfo: FC<UserInfoProps> = ({ ...restProps }) => {
    const dispatch = useDispatch();
    const { selectedUser, isUserInfoLoading } = useSelector(
        (state: RootState) => state.app
    );

    return (
        <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: "0" }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "tween" }}
            className="absolute right-0 top-20 w-full lg:w-2/3 h-[calc(100%_-_80px)] flex flex-col bg-tertiary z-10 overflow-hidden"
            {...restProps}
        >
            {isUserInfoLoading ? (
                <div className="w-full h-full flex items-center justify-center">
                    <ClipLoader color="#FFF" size={35} />
                </div>
            ) : (
                <>
                    <div className="grow h-[1px] flex flex-col p-5 gap-5 overflow-y-auto">
                        <div className="w-full flex flex-col items-center justify-center gap-3 mb-5 lg:mb-0">
                            <motion.div
                                initial={{ scale: 0.5 }}
                                animate={{
                                    scale: 1,
                                    transition: {
                                        type: "tween",
                                        delay: 0.2,
                                    },
                                }}
                                exit={{ scale: 0.2 }}
                            >
                                <UserAvatar
                                    user={selectedUser}
                                    isLarge={true}
                                />
                            </motion.div>
                            <div className="flex flex-col gap-1 items-center">
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
                                    className="text-3xl"
                                >
                                    {selectedUser?.displayName}
                                </motion.p>
                                <motion.div
                                    initial={{ opacity: 0, y: "+20%" }}
                                    animate={{
                                        opacity: 1,
                                        y: "0%",
                                        transition: {
                                            type: "tween",
                                            delay: 0.35,
                                        },
                                    }}
                                    exit={{ opacity: 0, y: "+20%" }}
                                >
                                    {selectedUser?.isOnline ? (
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
                                        <p className="text-xl text-slate-300 font-semibold">
                                            <TimeAgo
                                                date={
                                                    new Date(
                                                        Number(
                                                            selectedUser?.lastOnline
                                                        )
                                                    )
                                                }
                                                formatter={(
                                                    value,
                                                    unit,
                                                    suffix
                                                ) => {
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
                                    )}
                                </motion.div>
                            </div>
                        </div>

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
                            className="flex flex-col gap-2"
                        >
                            <div className="flex flex-col gap-1">
                                <p className="text-xl text-slate-400">
                                    Username:
                                </p>
                                <div className="flex items-center justify-between">
                                    <p>{selectedUser?.username}</p>
                                    <div
                                        className="h-full pl-2 flex items-center justify-center cursor-pointer"
                                        onClick={() => {
                                            navigator.clipboard.writeText(
                                                selectedUser?.username
                                            );
                                        }}
                                    >
                                        <ContentCopyRounded />
                                    </div>
                                </div>
                            </div>
                        </motion.div>

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
                            className="flex flex-col gap-2"
                        >
                            <div className="flex flex-col gap-1">
                                <p className="text-xl text-slate-400">Email:</p>
                                <div className="flex items-center justify-between">
                                    <p>{selectedUser?.email}</p>
                                    <div
                                        className="h-full pl-2 flex items-center justify-center cursor-pointer"
                                        onClick={() => {
                                            navigator.clipboard.writeText(
                                                selectedUser?.email
                                            );
                                        }}
                                    >
                                        <ContentCopyRounded />
                                    </div>
                                </div>
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
                                <p className="text-slate-500 text-xl">
                                    {selectedUser?._id}
                                </p>
                            </div>

                            <div className="flex items-center justify-between">
                                <CalendarMonthRounded />
                                <p className="text-slate-500 text-xl">
                                    {new Date(
                                        Number(selectedUser?.createdAt)
                                    ).toLocaleString()}
                                </p>
                            </div>
                        </motion.div>
                    </div>
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
                        className="flex-shrink p-5"
                    >
                        <Button
                            onClick={() => {
                                dispatch(appActions.hideUserInfo());
                            }}
                        >
                            Close
                        </Button>
                    </motion.div>
                </>
            )}
        </motion.div>
    );
};

export default UserInfo;
