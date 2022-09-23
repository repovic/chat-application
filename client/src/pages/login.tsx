import { ErrorRounded } from "@mui/icons-material";
import { AnimatePresence, motion } from "framer-motion";
import type { NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import AuthIllustration from "../assets/authIllustration.svg";
import Button from "../components/Button";
import FormGroup from "../components/FormGroup";
import Input from "../components/Input";
import Page from "../components/Page";
import useAuth from "../hooks/useAuth";
import { authActions } from "../redux/authSlice";

const LoginPage: NextPage = () => {
    const dispatch = useDispatch();
    const router = useRouter();

    const { isLoading, isError, error } = useAuth();

    const [formFields, setFormFields] = useState<any>({
        username: "",
        password: "",
    });

    const handleSumbit = async (e: any) => {
        e.preventDefault();
        if (!formFields["username"] || !formFields["password"]) return;

        dispatch(
            authActions.login({
                username: formFields["username"] as string,
                password: formFields["password"] as string,
            }) as any
        );
    };

    useEffect(() => {
        if (error) {
            setFormFields({ ...formFields, password: "" });
        }
    }, [error]);

    useEffect(() => {
        dispatch(authActions.clearError());
    }, [router.asPath]);

    return (
        <Page title="Chat Application / Login" isAuthPage={true}>
            <div className="w-full flex flex-col items-center justify-center gap-2 lg:gap-5">
                <div className="w-full">
                    <h1 className="text-3xl lg:text-4xl">Welcome back,</h1>
                    <h2 className="text-2xl lg:text-3xl -mt-1">
                        Don&apos;t have an account?{" "}
                        <Link href="/register" replace={true}>
                            <a className="text-primary hover:underline">
                                Register
                            </a>
                        </Link>
                    </h2>
                </div>
                <form
                    onSubmit={handleSumbit}
                    onChange={(e: any) => {
                        if (isError) {
                            dispatch(authActions.clearError());
                        }
                    }}
                    autoComplete="off"
                    className="w-full flex flex-col items-center justify-center gap-5"
                >
                    <FormGroup>
                        <label
                            htmlFor="usernameInput"
                            className="text-xl lg:text-2xl"
                        >
                            Username:{" "}
                        </label>
                        <Input
                            name="username"
                            id="usernameInput"
                            value={formFields["username"]}
                            onChange={(e: any) =>
                                setFormFields({
                                    ...formFields,
                                    [e.target.name]: e.target.value,
                                })
                            }
                            placeholder="johndoe"
                        />
                    </FormGroup>
                    <FormGroup>
                        <label
                            htmlFor="passwordInput"
                            className="text-xl lg:text-2xl"
                        >
                            Password:{" "}
                        </label>
                        <Input
                            name="password"
                            type="password"
                            id="passwordInput"
                            isForPassword={true}
                            value={formFields["password"]}
                            onChange={(e: any) =>
                                setFormFields({
                                    ...formFields,
                                    [e.target.name]: e.target.value,
                                })
                            }
                            placeholder="Passw0rd!"
                        />
                    </FormGroup>

                    <Button
                        onClick={handleSumbit}
                        isLoading={isLoading}
                        disabled={
                            !formFields["username"] || !formFields["password"]
                        }
                    >
                        Login
                    </Button>

                    <AnimatePresence>
                        {isError && (
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
                                {error.message}
                            </motion.p>
                        )}
                    </AnimatePresence>
                </form>
            </div>
            <div className="hidden lg:flex">
                <AuthIllustration />
            </div>
        </Page>
    );
};

export default LoginPage;
