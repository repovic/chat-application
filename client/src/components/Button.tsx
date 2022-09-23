import { motion } from "framer-motion";
import { FC, ReactNode } from "react";
import { ClipLoader } from "react-spinners";

type ButtonProps = {
    isLoading?: boolean;
    children: ReactNode;
    [propName: string]: any;
};
const Button: FC<ButtonProps> = ({ isLoading, children, ...restProps }) => {
    return (
        <motion.button
            whileTap={{ scale: 0.9 }}
            className="w-full text-xl lg:text-2xl text-white px-5 py-3 flex items-center justify-center gap-1 rounded bg-primary cursor-pointer disabled:bg-secondary disabled:cursor-not-allowed"
            {...restProps}
        >
            {isLoading && <ClipLoader color="#FFF" size={25} />}
            {isLoading ? "Loading..." : children}
        </motion.button>
    );
};

export default Button;
