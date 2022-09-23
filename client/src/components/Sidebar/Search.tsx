import { FC } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux";
import { appActions } from "../../redux/appSlice";
import Input from "../Input";

type SearchProps = {
    [propName: string]: any;
};
const Search: FC<SearchProps> = () => {
    const dispatch = useDispatch();
    const { searchQuery } = useSelector((state: RootState) => state.app);

    return (
        <div className="w-full h-20 px-5 bg-secondary flex items-center justify-between gap-2">
            <Input
                placeholder="Search conversations..."
                variant="tertiary"
                keyboardAlias={"\\"}
                value={searchQuery}
                isForSearch={true}
                clearValue={() => dispatch(appActions.setSearchQuery(""))}
                onChange={(e: any) => {
                    dispatch(appActions.setSearchQuery(e.target.value));
                }}
            />
        </div>
    );
};

export default Search;
