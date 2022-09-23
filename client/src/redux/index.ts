import {
    combineReducers,
    configureStore,
    PayloadAction,
} from "@reduxjs/toolkit";
import { createWrapper } from "next-redux-wrapper";
import appReducer, { AppState } from "./appSlice";
import authReducer, { AuthState } from "./authSlice";

export interface RootState {
    auth: AuthState;
    app: AppState;
}

const combinedReducer = combineReducers({
    auth: authReducer,
    app: appReducer,
});

const rootReducer = (state: any, action: PayloadAction<any>) => {
    return combinedReducer(state, action);
};

export const makeStore = () =>
    configureStore({
        reducer: rootReducer,
    });

// { debug: true } in createWrapper
export const wrapper = createWrapper(makeStore);
