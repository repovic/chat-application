import { FC, ReactNode } from "react";

type FormGroupProps = {
    children: ReactNode;
    [propName: string]: any;
};
const FormGroup: FC<FormGroupProps> = ({ children }) => {
    return <div className="w-full flex flex-col gap-2">{children}</div>;
};

export default FormGroup;
