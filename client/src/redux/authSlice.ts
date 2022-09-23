import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
    LOGIN,
    LOGOUT,
    REGISTER,
    SUBSCRIBE_TO_PUSH_SERVICE,
    UNSUBSCRIBE_FROM_PUSH_SERVICE,
} from "../graphql/mutations/auth";
import { USER } from "../graphql/queries/user";
import createApolloClient from "../utils/createApolloClient";

export interface AuthState {
    accessToken: string | null;
    subscriptionToken: string | null;
    user: any | null;
    error: any | null;

    isAuthenticated: boolean;
    isLoading: boolean;
    isError: boolean;
}

const initialState = {
    accessToken: null,
    subscriptionToken: null,
    user: null,
    error: null,

    isAuthenticated: false,
    isLoading: true,
    isError: false,
} as AuthState;

const populate = createAsyncThunk("auth/populate", async () => {
    return new Promise(async (resolve, reject) => {
        try {
            const apolloClient = createApolloClient();

            const {
                data: { user: payload },
            } = await apolloClient.query({
                query: USER,
            });

            resolve(payload);
        } catch (error) {
            reject(error);
        }
    });
});

interface RegisterParameters {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    password: string;
}
const register = createAsyncThunk(
    "auth/register",
    async (
        { firstName, lastName, username, email, password }: RegisterParameters,
        { dispatch }
    ) => {
        return new Promise(async (resolve, reject) => {
            try {
                const apolloClient = createApolloClient();

                await apolloClient.mutate({
                    mutation: REGISTER,
                    variables: {
                        firstName,
                        lastName,
                        username,
                        email,
                        password,
                    },
                });

                dispatch(
                    login({
                        username,
                        password,
                    })
                );
            } catch (error) {
                reject(error);
            }
        });
    }
);

interface LoginParameters {
    username: string;
    password: string;
}
const login = createAsyncThunk(
    "auth/login",
    async ({ username, password }: LoginParameters) => {
        return new Promise(async (resolve, reject) => {
            try {
                const apolloClient = createApolloClient();

                const {
                    data: { login: payload },
                } = await apolloClient.mutate({
                    mutation: LOGIN,
                    variables: {
                        username,
                        password,
                    },
                });

                resolve(payload);
            } catch (error) {
                reject(error);
            }
        });
    }
);

const subscribeToPushService = createAsyncThunk(
    "auth/subscribeToPushService",
    async (subscription: any) => {
        return new Promise(async (resolve, reject) => {
            try {
                const apolloClient = createApolloClient();

                subscription = subscription.toJSON();

                if (!subscription) throw new Error();

                const {
                    data: { subscribeToPushService: payload },
                } = await apolloClient.mutate({
                    mutation: SUBSCRIBE_TO_PUSH_SERVICE,
                    variables: subscription,
                });

                resolve(payload);
            } catch (error) {
                reject(error);
            }
        });
    }
);

const logout = createAsyncThunk("auth/logout", async (_, { dispatch }) => {
    return new Promise(async (resolve, reject) => {
        try {
            dispatch(unsubscribeFromPushService());
            const apolloClient = createApolloClient();

            const {
                data: { logout: payload },
            } = await apolloClient.mutate({
                mutation: LOGOUT,
            });

            resolve(payload);
        } catch (error) {
            reject(error);
        }
    });
});

const unsubscribeFromPushService = createAsyncThunk(
    "auth/unsubscribeFromPushService",
    async () => {
        return new Promise(async (resolve, reject) => {
            try {
                const apolloClient = createApolloClient();

                const subscription = JSON.parse(
                    localStorage.getItem("pushSubscription") as any
                );

                if (!subscription) throw new Error();

                const {
                    data: { subscribeToPushService: payload },
                } = await apolloClient.mutate({
                    mutation: UNSUBSCRIBE_FROM_PUSH_SERVICE,
                    variables: subscription,
                });

                resolve(payload);
            } catch (error) {
                reject(error);
            }
        });
    }
);

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
            state.isError = false;
        },
        updateState: (state, action) => {
            const { accessToken, user, isAuthenticated, isLoading } =
                action.payload;

            localStorage.setItem("accessToken", accessToken);

            state.accessToken = accessToken;

            state.user = user;
            state.isAuthenticated = isAuthenticated || state.isAuthenticated;
            state.isLoading = isLoading || state.isLoading;
        },
        updateUser: (state, action) => {
            const user = action.payload;

            state.user = user;
        },
    },
    extraReducers: {
        // @ts-expect-error
        [populate.pending]: (state) => {
            state.isLoading = true;
        },
        // @ts-expect-error
        [populate.fulfilled]: (state, action) => {
            state.accessToken = localStorage.getItem("accessToken");

            state.user = action.payload;
            state.isAuthenticated = true;
            state.isLoading = false;
        },
        // @ts-expect-error
        [populate.rejected]: (state) => {
            localStorage.setItem("accessToken", "");
            localStorage.setItem("subscriptionToken", "");

            state.accessToken = null;
            state.subscriptionToken = null;

            state.user = null;
            state.isAuthenticated = false;
            state.isLoading = false;
        },
        // @ts-expect-error
        [register.pending]: (state) => {
            state.error = null;
            state.isLoading = true;
            state.isError = false;
        },
        // @ts-expect-error
        [register.fulfilled]: (state, action) => {},
        // @ts-expect-error
        [register.rejected]: (state, { error }) => {
            state.error = error;
            state.isLoading = false;
            state.isError = true;
        },
        // @ts-expect-error
        [login.pending]: (state) => {
            state.error = null;
            state.isLoading = true;
            state.isError = false;
        },
        // @ts-expect-error
        [login.fulfilled]: (state, action) => {
            const { user, accessToken, subscriptionToken } = action.payload;

            localStorage.setItem("accessToken", accessToken);
            localStorage.setItem("subscriptionToken", subscriptionToken);

            state.accessToken = accessToken;
            state.subscriptionToken = subscriptionToken;

            state.user = user;
            state.error = null;
            state.isAuthenticated = true;
            state.isError = false;
            state.isLoading = false;
        },
        // @ts-expect-error
        [login.rejected]: (state, { error }) => {
            localStorage.setItem("accessToken", "");
            localStorage.setItem("subscriptionToken", "");

            state.accessToken = null;
            state.subscriptionToken = null;

            state.user = null;
            state.isAuthenticated = false;
            state.isLoading = false;
            state.isError = true;
            state.error = error;
        },
        // @ts-expect-error
        [logout.pending]: (state) => {
            state.isLoading = true;
        },
        // @ts-expect-error
        [logout.fulfilled]: (state) => {
            localStorage.setItem("accessToken", "");
            localStorage.setItem("subscriptionToken", "");

            state.accessToken = null;
            state.subscriptionToken = null;

            state.user = null;
            state.error = null;
            state.isAuthenticated = false;
            state.isError = false;
            state.isLoading = false;
        },
        // @ts-expect-error
        [logout.rejected]: (state, { error }) => {
            localStorage.setItem("accessToken", "");
            localStorage.setItem("subscriptionToken", "");

            state.accessToken = null;
            state.subscriptionToken = null;

            state.user = null;
            state.error = null;
            state.isAuthenticated = false;
            state.isError = false;
            state.isLoading = false;
        },
        // @ts-expect-error
        [subscribeToPushService.pending]: (state, action) => {
            localStorage.setItem("pushSubscription", "");
        },
        // @ts-expect-error
        [subscribeToPushService.fulfilled]: (state, action) => {
            const {
                endpoint,
                expirationTime,
                keys: { auth, p256dh },
            } = action.payload;

            localStorage.setItem(
                "pushSubscription",
                JSON.stringify({
                    endpoint,
                    expirationTime,
                    keys: { auth, p256dh },
                })
            );
        },
        // @ts-expect-error
        [subscribeToPushService.rejected]: (state, action) => {},
        // @ts-expect-error
        [unsubscribeFromPushService.pending]: (state, action) => {},
        // @ts-expect-error
        [unsubscribeFromPushService.fulfilled]: (state, action) => {
            localStorage.setItem("pushSubscription", "");
        },
        // @ts-expect-error
        [unsubscribeFromPushService.rejected]: (state, action) => {},
    },
});

export const authActions = {
    populate,
    register,
    login,
    logout,
    subscribeToPushService,
    unsubscribeFromPushService,
    ...authSlice.actions,
};
export default authSlice.reducer;
