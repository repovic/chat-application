import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import AVAILABLE_THEMES from "../constants/AVAILABLE_THEMES";
import {
    CONVERSATION,
    CONVERSATIONS_OF_PARTICIPANT,
} from "../graphql/queries/conversation";
import { USER } from "../graphql/queries/user";
import createApolloClient from "../utils/createApolloClient";

export interface AppState {
    conversations: any[] | null;
    selectedConversation: any | null;
    selectedUser: any | null;

    // Search
    searchQuery: string;

    // Sidebar
    isEditingProfile: boolean;
    isStartingConversation: boolean;
    isConversationsLoading: boolean;

    // Conversaton Info
    isViewingConversationInfo: boolean;
    isConversationInfoLoading: boolean;

    // User Info
    isViewingUserInfo: boolean;
    isUserInfoLoading: boolean;

    // Color Themes
    currentTheme: any | null;
}

const initialState = {
    conversations: null,
    selectedConversation: null,
    selectedUser: null,

    searchQuery: "",

    isEditingProfile: false,
    isStartingConversation: false,
    isConversationsLoading: false,

    isViewingConversationInfo: false,
    isConversationInfoLoading: false,

    isViewingUserInfo: false,
    isUserInfoLoading: true,

    currentTheme: "default",
} as AppState;

const populate = createAsyncThunk("conversation/populate", () => {
    return new Promise(async (resolve, reject) => {
        try {
            const apolloClient = createApolloClient();

            const {
                data: { conversationsOfParticipant: payload },
            } = await apolloClient.query({
                query: CONVERSATIONS_OF_PARTICIPANT,
            });

            resolve(payload);
        } catch (error) {
            reject(error);
        }
    });
});

const selectConversation = createAsyncThunk(
    "conversation/selectConversation",
    (conversationId: string) => {
        return new Promise(async (resolve, reject) => {
            try {
                const apolloClient = createApolloClient();

                const {
                    data: { conversation: payload },
                } = await apolloClient.query({
                    query: CONVERSATION,
                    variables: {
                        conversationId,
                    },
                });

                resolve(payload);
            } catch (error) {
                reject(error);
            }
        });
    }
);

const selectUser = createAsyncThunk(
    "conversation/selectUser",
    (userId: string) => {
        return new Promise(async (resolve, reject) => {
            try {
                const apolloClient = createApolloClient();

                const {
                    data: { user: payload },
                } = await apolloClient.query({
                    query: USER,
                    variables: {
                        userId,
                    },
                });

                resolve(payload);
            } catch (error) {
                reject(error);
            }
        });
    }
);

const appSlice = createSlice({
    name: "app",
    initialState,
    reducers: {
        clearState: (state) => {
            state.conversations = null;
            state.selectedConversation = null;
            state.selectedUser = null;

            state.searchQuery = "";

            state.isEditingProfile = false;
            state.isStartingConversation = false;
            state.isConversationsLoading = false;

            state.isViewingConversationInfo = false;
            state.isConversationInfoLoading = false;

            state.isViewingUserInfo = false;
            state.isUserInfoLoading = false;
        },
        appendCreatedConversation: (state, action) => {
            state.conversations?.unshift(action.payload);
        },
        appendUpdatedConversation: (state, action) => {
            const updatedConversation = action.payload;

            if (state.selectedConversation?._id == updatedConversation._id) {
                state.selectedConversation = updatedConversation;
            }

            state.conversations = [
                updatedConversation,
                ...(state.conversations || []).filter(
                    (conversation: any) =>
                        conversation._id !== updatedConversation._id
                ),
            ];
        },
        setSearchQuery: (state, action) => {
            const searchQuery = action.payload;

            state.searchQuery = searchQuery || "";
        },
        toggleProfileEditing: (state) => {
            state.isStartingConversation = false;

            state.isEditingProfile = !state.isEditingProfile;
        },
        toggleConversationStarting: (state) => {
            state.isEditingProfile = false;

            state.isStartingConversation = !state.isStartingConversation;
        },
        toggleConversationInfo: (state) => {
            state.isUserInfoLoading = true;
            state.isViewingUserInfo = false;
            state.selectedUser = null;

            state.isViewingConversationInfo = !state.isViewingConversationInfo;
        },
        unselectConversation: (state) => {
            state.selectedConversation = null;
        },
        hideUserInfo: (state) => {
            state.isUserInfoLoading = true;
            state.isViewingUserInfo = false;
            state.selectedUser = null;
        },
        hideConversationInfo: (state) => {
            state.isViewingConversationInfo = false;
        },
        hideSideComponents: (state) => {
            state.isEditingProfile = false;
            state.isStartingConversation = false;
            state.isUserInfoLoading = true;
            state.isViewingUserInfo = false;
            state.selectedUser = null;
            state.isViewingConversationInfo = false;
        },
        changeTheme: (state, action) => {
            let themeName = action.payload;
            if (state.currentTheme === themeName) return;

            if (!Object.hasOwn(AVAILABLE_THEMES, themeName)) {
                themeName = "default";
            }

            // @ts-ignore
            const theme = AVAILABLE_THEMES[themeName as string];
            Object.keys(theme).forEach((key) => {
                (
                    document.querySelector(":root") as HTMLDivElement
                ).style?.setProperty(`--${key}-color`, theme[key as string]);
            });
            state.currentTheme = themeName;
            localStorage.setItem("currentTheme", themeName);
        },
    },
    extraReducers: {
        // @ts-expect-error
        [populate.pending]: (state) => {
            state.isConversationsLoading = true;
        },
        // @ts-expect-error
        [populate.fulfilled]: (state, action) => {
            state.conversations = action.payload;
            state.isConversationsLoading = false;
        },
        // @ts-expect-error
        [populate.rejected]: (state) => {
            state.isConversationsLoading = false;
        },
        // @ts-expect-error
        [selectConversation.pending]: (state) => {
            state.isConversationInfoLoading = true;
        },
        // @ts-expect-error
        [selectConversation.fulfilled]: (state, action) => {
            state.selectedConversation = action.payload;
            state.isConversationInfoLoading = false;
        },
        // @ts-expect-error
        [selectConversation.rejected]: (state) => {
            state.isConversationInfoLoading = false;
        },
        // @ts-expect-error
        [selectUser.pending]: (state) => {
            state.isViewingConversationInfo = false;

            state.isUserInfoLoading = true;
            state.isViewingUserInfo = true;
        },
        // @ts-expect-error
        [selectUser.fulfilled]: (state, action) => {
            state.selectedUser = action.payload;
            state.isUserInfoLoading = false;
        },
        // @ts-expect-error
        [selectUser.rejected]: (state) => {
            state.isUserInfoLoading = false;
            state.isViewingUserInfo = false;
        },
    },
});

export const appActions = {
    populate,
    selectConversation,
    selectUser,
    ...appSlice.actions,
};
export default appSlice.reducer;
