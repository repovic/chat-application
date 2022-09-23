import { NextPage } from "next";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import Page from "../components/Page";
import { authActions } from "../redux/authSlice";

const LogoutPage: NextPage = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(authActions.logout() as any);
    }, []);

    return (
        <Page title="Logging out..." isProtectedPage={true}>
            <div className="w-[calc(100%-2.5rem)] lg:w-full max-w-5xl p-10 lg:p-20 text-2xl text-white flex items-center justify-center lg:justify-between flex-wrap lg:flex-nowrap gap-20 rounded shadow-tertiary shadow-lg bg-tertiary">
                <p className="text-3xl">Logging out...</p>
            </div>
        </Page>
    );
};

export default LogoutPage;
