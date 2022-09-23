import { LogoutRounded, MessageRounded } from "@mui/icons-material";
import { FC, useEffect } from "react";
import { useDispatch } from "react-redux";
import useAuth from "../../hooks/useAuth";
import { appActions } from "../../redux/appSlice";
import { authActions } from "../../redux/authSlice";
import { UserAvatar } from "../Avatar";

import { useSubscription } from "@apollo/client";
import { Tooltip } from "@mui/material";
import { USER_UPDATED } from "../../graphql/subscriptions/user";
type HeaderProps = {
    [propName: string]: any;
};
const Header: FC<HeaderProps> = ({ ...restProps }) => {
    const dispatch = useDispatch();
    const { user, isAuthenticated } = useAuth();

    const { data: userUpdatedSubscription } = useSubscription(USER_UPDATED, {
        variables: {
            userId: user._id,
        },
        skip: !isAuthenticated,
    });

    useEffect(() => {
        const updatedUser = userUpdatedSubscription?.userUpdated;
        if (updatedUser) {
            dispatch(authActions.updateUser(updatedUser));
        }
    }, [userUpdatedSubscription]);

    return (
        <div
            className="w-full h-20 px-5 bg-secondary flex items-center justify-between"
            {...restProps}
        >
            <Tooltip title="User Profile">
                <div
                    className="w-full h-full flex items-center justify-start gap-2 cursor-pointer"
                    onClick={() => {
                        dispatch(appActions.toggleProfileEditing());
                    }}
                >
                    <UserAvatar user={user} />
                    <div>
                        <p className="text-2xl">{user.displayName}</p>
                        <p className="text-xl text-slate-300">
                            @{user.username}
                        </p>
                    </div>
                </div>
            </Tooltip>
            <div className="h-full flex items-center justify-center gap-2">
                <Tooltip title="Start Conversation">
                    <div
                        className="h-full px-2 flex items-center justify-center cursor-pointer"
                        onClick={() => {
                            dispatch(appActions.toggleConversationStarting());
                        }}
                    >
                        <MessageRounded fontSize="medium" />
                    </div>
                </Tooltip>
                <Tooltip title="Log Out">
                    <div
                        className="h-full px-2 flex items-center justify-center cursor-pointer"
                        onClick={() => {
                            dispatch(authActions.logout() as any);
                            dispatch(appActions.clearState());
                        }}
                    >
                        <LogoutRounded fontSize="medium" />
                    </div>
                </Tooltip>
            </div>
        </div>
    );
};

export default Header;
