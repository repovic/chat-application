import Head from "next/head";
import { useRouter } from "next/router";
import { FC, ReactNode, useEffect } from "react";
import { ClipLoader } from "react-spinners";
import useAuth from "../hooks/useAuth";
import Sidebar from "./Sidebar";

type PageProps = {
    title: string;
    isAuthPage?: boolean;
    isProtectedPage?: boolean;
    children: ReactNode;
    [propName: string]: any;
};
const Page: FC<PageProps> = ({
    title,
    isAuthPage = false,
    isProtectedPage = false,
    children,
    ...restProps
}) => {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isAuthPage && !isLoading && isAuthenticated) {
            router.replace("/");
        }

        if (isProtectedPage && !isLoading && !isAuthenticated) {
            router.replace("/login");
        }
    }, [isLoading, isAuthenticated]);

    if (!isAuthPage && (isLoading || (isProtectedPage && !isAuthenticated))) {
        return (
            <>
                <Head>
                    <title>Chat Application / Loading...</title>
                </Head>

                <div {...restProps}>
                    <ClipLoader color="#FFF" size={50} />
                </div>
            </>
        );
    }

    if (isProtectedPage) {
        return (
            <>
                <Head>
                    <title>{title}</title>
                </Head>
                <div
                    className="w-full lg:max-w-full xl:max-w-6xl h-full xl:max-h-[700px] text-2xl text-white grid lg:grid-cols-10 rounded shadow-tertiary shadow-lg bg-tertiary overflow-hidden"
                    {...restProps}
                >
                    <Sidebar />
                    {children}
                </div>
            </>
        );
    }

    if (isAuthPage) {
        return (
            <>
                <Head>
                    <title>{title}</title>
                </Head>
                <div
                    className="w-full lg:h-full xl:max-w-5xl xl:h-auto px-7 py-10 lg:px-20 lg:py-20 text-2xl text-white flex items-center justify-center lg:justify-between flex-wrap lg:flex-nowrap gap-20 rounded shadow-tertiary shadow-lg bg-tertiary"
                    {...restProps}
                >
                    {children}
                </div>
            </>
        );
    }

    return (
        <>
            <Head>
                <title>{title}</title>
            </Head>
            {children}
        </>
    );
};

export default Page;
