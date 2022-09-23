import {
    SearchOffRounded,
    VisibilityOffRounded,
    VisibilityRounded,
} from "@mui/icons-material";
import { FC, useEffect, useRef, useState } from "react";

type InputProps = {
    variant?: "primary" | "secondary" | "tertiary";
    isForPassword?: boolean;
    isForSearch?: boolean;
    clearValue?: any;
    keyboardAlias?: any;
    [propName: string]: any;
};
const Input: FC<InputProps> = ({
    variant = "secondary",
    isForPassword,
    isForSearch,
    clearValue,
    keyboardAlias,
    ...rest
}) => {
    const { type: restType, ...restProps } = rest;

    const [type, setType] = useState(restType || "text");
    const [isFocused, setIsFocused] = useState(false);

    const inputRef = useRef<HTMLInputElement>(null);
    const toggleType = (e: any) => {
        e.preventDefault();
        setType(type === "text" ? "password" : "text");
    };

    useEffect(() => {
        if (keyboardAlias) {
            window.addEventListener("keydown", (e: KeyboardEvent) => {
                if (e.key?.toLowerCase() === keyboardAlias.toLowerCase()) {
                    if (!isFocused) {
                        e.preventDefault();
                        inputRef.current?.focus();
                    }
                }
            });
        }
    }, [keyboardAlias]);

    return (
        <div className="w-full relative">
            <input
                className={`w-full px-5 py-3 ${
                    isForPassword || isForSearch ? "pr-14" : ""
                } text-xl lg:text-2xl text-white border-none outline-none focus:outline-2 focus:outline-primary rounded bg-${variant}`}
                type={type}
                ref={inputRef}
                onFocus={() => {
                    setIsFocused(true);
                }}
                onBlur={() => {
                    setIsFocused(false);
                }}
                onKeyDown={(e) => {
                    if (e.key === "Enter" && inputRef.current?.value !== "")
                        setIsFocused(false);
                }}
                {...restProps}
            />

            {!isFocused && keyboardAlias && !isForPassword && (
                <p className="hidden lg:flex absolute right-5 top-1/2 pointer-events-none -translate-y-1/2 bg-secondary text-sm rounded px-2 py-1">
                    {keyboardAlias}
                </p>
            )}

            {isForPassword && (
                <div
                    onMouseDown={toggleType}
                    className="w-14 flex items-center justify-center cursor-pointer text-2xl text-white absolute right-0 top-1/2 -translate-y-1/2"
                >
                    {type == "password" ? (
                        <VisibilityRounded />
                    ) : (
                        <VisibilityOffRounded />
                    )}
                </div>
            )}

            {isForSearch && isFocused && inputRef.current?.value && (
                <div
                    onMouseDown={() => {
                        clearValue();
                    }}
                    className="w-14 flex items-center justify-center cursor-pointer text-2xl text-white absolute right-0 top-1/2 -translate-y-1/2"
                >
                    <SearchOffRounded />
                </div>
            )}
        </div>
    );
};

export default Input;
