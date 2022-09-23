import {
    ApolloClient,
    ApolloLink,
    concat,
    InMemoryCache,
    split,
} from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { getMainDefinition, Observable } from "@apollo/client/utilities";
import { createUploadLink } from "apollo-upload-client";
import { createClient } from "graphql-ws";
import { REFRESH_TOKEN } from "../graphql/mutations/auth";
import { makeStore } from "../redux";
import { authActions } from "../redux/authSlice";

export default () => {
    let apolloClient: ApolloClient<any> = new ApolloClient({
        cache: new InMemoryCache(),
    });

    const store = makeStore();

    const accessToken =
        store.getState().auth.accessToken ||
        localStorage.getItem("accessToken");
    const subscriptionToken =
        store.getState().auth.subscriptionToken ||
        localStorage.getItem("subscriptionToken");

    const authMiddleware = new ApolloLink((operation, forward) => {
        operation.setContext(({ headers = {} }) => ({
            headers: {
                ...headers,
                "X-Access-Token": accessToken || "",
            },
        }));

        return forward(operation);
    });

    const uploadLink = createUploadLink({
        uri: process.env.NEXT_PUBLIC_GRAPHQL_URI,
        credentials: "include",
    });

    let activeSocket: any, timedOut: any;
    const wsLink = new GraphQLWsLink(
        createClient({
            url: process.env.NEXT_PUBLIC_SUBSCRIPTIONS_URI as string,
            connectionParams: {
                "X-Subscription-Token": subscriptionToken || "",
            },
            keepAlive: 10_000,
            on: {
                connected: (socket) => {
                    activeSocket = socket;
                },
                ping: (received) => {
                    if (!received)
                        timedOut = setTimeout(() => {
                            if (activeSocket.readyState === WebSocket.OPEN)
                                activeSocket.close(4408, "Request Timeout");
                        }, 5_000);
                },
                pong: (received) => {
                    if (received) clearTimeout(timedOut);
                },
            },
        })
    );

    let isRefreshingToken = false;
    const errorLink = onError(
        ({ graphQLErrors, networkError, operation, forward }): any => {
            if (graphQLErrors) {
                for (let err of graphQLErrors) {
                    switch (err.extensions.code) {
                        case "UNAUTHENTICATED":
                            if (accessToken && !isRefreshingToken) {
                                return new Observable((observer) => {
                                    isRefreshingToken = true;
                                    apolloClient
                                        .mutate({
                                            mutation: REFRESH_TOKEN,
                                        })
                                        .then(
                                            ({
                                                data: { refreshToken: payload },
                                            }: any) => {
                                                store.dispatch(
                                                    authActions.updateState({
                                                        ...payload,
                                                        isAuthenticated: true,
                                                    })
                                                );

                                                operation.setContext(
                                                    ({ headers = {} }) => ({
                                                        headers: {
                                                            ...headers,
                                                            "x-access-token":
                                                                payload.accessToken,
                                                        },
                                                    })
                                                );
                                            }
                                        )
                                        .then(() => {
                                            const subscriber = {
                                                next: observer.next.bind(
                                                    observer
                                                ),
                                                error: observer.error.bind(
                                                    observer
                                                ),
                                                complete:
                                                    observer.complete.bind(
                                                        observer
                                                    ),
                                            };

                                            forward(operation).subscribe(
                                                subscriber
                                            );
                                        })
                                        .finally(() => {
                                            isRefreshingToken = false;
                                        })
                                        .catch((error) => {
                                            store.dispatch(
                                                authActions.logout() as any
                                            );
                                            observer.error(error);
                                        });
                                });
                            }
                    }
                }
            }
        }
    );

    const splitLink = split(
        ({ query }) => {
            const definition = getMainDefinition(query);
            return (
                definition.kind === "OperationDefinition" &&
                definition.operation === "subscription"
            );
        },
        wsLink,
        concat(authMiddleware, uploadLink)
    );

    apolloClient = new ApolloClient({
        link: ApolloLink.from([errorLink, splitLink]),
        ssrMode: typeof window === "undefined",
        cache: new InMemoryCache(),
        credentials: "include",
    });

    return apolloClient;
};
