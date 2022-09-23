import { useSelector } from "react-redux";
import { RootState } from "../redux";

export default () => {
    return useSelector((state: RootState) => state.auth);
};
