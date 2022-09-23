import { ErrorRounded } from "@mui/icons-material";
import { AnimatePresence, motion } from "framer-motion";
import type { NextPage } from "next";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import AuthIllustration from "../assets/authIllustration.svg";
import Button from "../components/Button";
import FormGroup from "../components/FormGroup";
import Input from "../components/Input";
import Page from "../components/Page";
import useAuth from "../hooks/useAuth";
import { authActions } from "../redux/authSlice";

const RegisterPage: NextPage = () => {
    const dispatch = useDispatch();

    const { isLoading, isError, error } = useAuth();

    const [form, setForm] = useState<any>({
        firstName: "",
        lastName: "",
        username: "",
        email: "",
        password: "",
    });
    const [currentStep, setCurrentStep] = useState(1);

    const handleSumbit = async (e: any) => {
        e.preventDefault();

        if (currentStep === 1 && (!form["firstName"] || !form["lastName"]))
            return;

        if (
            currentStep === 2 &&
            (!form["firstName"] ||
                !form["lastName"] ||
                !form["username"] ||
                !form["email"] ||
                !form["password"])
        )
            return;

        if (currentStep < 2)
            return setCurrentStep((currentStep) => currentStep + 1);

        dispatch(
            authActions.register({
                firstName: form["firstName"],
                lastName: form["lastName"],
                username: form["username"],
                email: form["email"],
                password: form["password"],
            }) as any
        );
    };

    useEffect(() => {
        if (error) {
            setForm({ ...form, password: "" });
        }
    }, [error, currentStep]);

    useEffect(() => {
        dispatch(authActions.clearError());
    }, [currentStep]);

    return (
        <Page title="Chat Application / Register" isAuthPage={true}>
            <div className="w-full flex flex-col items-center justify-center gap-2 lg:gap-5">
                <div className="w-full">
                    <h1 className="text-3xl lg:text-4xl">
                        Welcome
                        {currentStep > 1 && ` ${form["firstName"]}`},
                    </h1>
                    {currentStep === 1 && (
                        <h2 className="text-2xl lg:text-3xl -mt-1">
                            Already have an account?{" "}
                            <Link href="/login" replace={true}>
                                <a className="text-primary hover:underline">
                                    Login
                                </a>
                            </Link>
                        </h2>
                    )}
                    {currentStep === 2 && (
                        <h2 className="text-xl lg:text-3xl -mt-1">
                            One more step,{" "}
                            <span
                                onClick={() => {
                                    setForm({});
                                    setCurrentStep(1);
                                }}
                                className="text-primary hover:underline cursor-pointer"
                            >
                                go back?
                            </span>
                        </h2>
                    )}
                </div>
                <form
                    onSubmit={handleSumbit}
                    onChange={(e: any) => {
                        dispatch(authActions.clearError());
                    }}
                    autoComplete="off"
                    className="w-full flex flex-col items-center justify-center gap-5"
                >
                    {currentStep === 1 && (
                        <>
                            <FormGroup>
                                <label
                                    htmlFor="firstNameInput"
                                    className="text-xl lg:text-2xl"
                                >
                                    First Name:
                                </label>
                                <Input
                                    name="firstName"
                                    id="firstNameInput"
                                    value={form["firstName"]}
                                    onChange={(e: any) =>
                                        setForm({
                                            ...form,
                                            [e.target.name]: e.target.value,
                                        })
                                    }
                                    placeholder="John"
                                />
                            </FormGroup>

                            <FormGroup>
                                <label
                                    htmlFor="lastNameInput"
                                    className="text-xl lg:text-2xl"
                                >
                                    Last Name:
                                </label>
                                <Input
                                    name="lastName"
                                    id="lastNameInput"
                                    value={form["lastName"]}
                                    onChange={(e: any) =>
                                        setForm({
                                            ...form,
                                            [e.target.name]: e.target.value,
                                        })
                                    }
                                    placeholder="Doe"
                                />
                            </FormGroup>
                        </>
                    )}
                    {currentStep === 2 && (
                        <>
                            <FormGroup>
                                <label
                                    htmlFor="usernameInput"
                                    className="text-xl lg:text-2xl"
                                >
                                    Username:
                                </label>
                                <Input
                                    name="username"
                                    id="usernameInput"
                                    value={form["username"]}
                                    onChange={(e: any) =>
                                        setForm({
                                            ...form,
                                            [e.target.name]: e.target.value,
                                        })
                                    }
                                    placeholder="johndoe"
                                />
                            </FormGroup>

                            <FormGroup>
                                <label
                                    htmlFor="emailInput"
                                    className="text-xl lg:text-2xl"
                                >
                                    Email:
                                </label>
                                <Input
                                    name="email"
                                    id="emailInput"
                                    value={form["email"]}
                                    onChange={(e: any) =>
                                        setForm({
                                            ...form,
                                            [e.target.name]: e.target.value,
                                        })
                                    }
                                    placeholder="john@doe.com"
                                />
                            </FormGroup>

                            <FormGroup>
                                <label
                                    htmlFor="passwordInput"
                                    className="text-xl lg:text-2xl"
                                >
                                    Password:
                                </label>
                                <Input
                                    name="password"
                                    type="password"
                                    id="passwordInput"
                                    isForPassword={true}
                                    value={form["password"]}
                                    onChange={(e: any) =>
                                        setForm({
                                            ...form,
                                            [e.target.name]: e.target.value,
                                        })
                                    }
                                    placeholder="Passw0rd!"
                                />
                            </FormGroup>
                        </>
                    )}

                    <Button
                        onClick={handleSumbit}
                        isLoading={isLoading}
                        disabled={
                            currentStep === 1
                                ? !form["firstName"] || !form["lastName"]
                                : !form["username"] ||
                                  !form["email"] ||
                                  !form["password"]
                        }
                    >
                        {currentStep === 1 ? "Get Started" : "Register"}
                    </Button>

                    <AnimatePresence>
                        {isError && currentStep !== 1 && (
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

export default RegisterPage;
