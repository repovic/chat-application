import { OpenInNewRounded } from "@mui/icons-material";
import { MotionConfig } from "framer-motion";
import type { AppProps } from "next/app";
import Link from "next/link";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import ApolloProvider from "../context/ApolloProvider";
import useAuth from "../hooks/useAuth";
import { wrapper } from "../redux";
import { appActions } from "../redux/appSlice";
import { authActions } from "../redux/authSlice";

import "../styles/globals.css";

function Application({ Component, pageProps }: AppProps) {
    const dispatch = useDispatch();
    const { user, isAuthenticated } = useAuth();

    useEffect(() => {
        const currentTheme = localStorage.getItem("currentTheme");
        if (currentTheme) dispatch(appActions.changeTheme(currentTheme));

        dispatch(authActions.populate() as any);

        // Blur input elements when Escape key is pressed
        // and hide side components (user profile, user info, conversation info...)
        document.addEventListener("keydown", (e) => {
            e = e || window.event;
            if (e.key == "Escape") {
                for (const input of document.querySelectorAll("input")) {
                    input.blur();
                }

                dispatch(appActions.hideSideComponents());
            }
        });
    }, []);

    // Register Push Subscription
    useEffect(() => {
        if (isAuthenticated) {
            if ("serviceWorker" in navigator) {
                navigator.serviceWorker.ready.then(async (registration) => {
                    const subscription =
                        await registration.pushManager.subscribe({
                            userVisibleOnly: true,
                            applicationServerKey:
                                process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
                        });

                    dispatch(
                        authActions.subscribeToPushService(subscription) as any
                    );
                });
            }
        }
    }, [user]);

    return (
        <ApolloProvider>
            <div className="w-full h-screen bg-secondary flex items-center justify-center">
                <MotionConfig reducedMotion="user">
                    <Component {...pageProps} />
                </MotionConfig>
                <div className="fixed left-5 bottom-5 hidden xl:flex items-center gap-2 select-none">
                    <p className="text-slate-500 text-lg">
                        <span className="text-white">
                            Chat Application v1.0
                        </span>{" "}
                        | Made by{" "}
                        <Link href={"https://www.repovic.dev"} passHref={true}>
                            <a target="_blank" rel="noopener noreferrer">
                                <span className="inline-flex items-center gap-1 font-bold underline text-primary cursor-pointer">
                                    Vasilije Repović{" "}
                                    <OpenInNewRounded fontSize="small" />
                                </span>
                            </a>
                        </Link>
                    </p>
                </div>
            </div>
        </ApolloProvider>
    );
}

export default wrapper.withRedux(Application);
