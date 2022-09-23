import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import { useRouter } from "next/router";
import { ReactElement, useEffect, useState } from "react";
import createApolloClient from "../utils/createApolloClient";

export default ({ children }: any): ReactElement => {
    const router = useRouter();
    const [apolloClient, setApolloClient] = useState(
        new ApolloClient({
            cache: new InMemoryCache(),
        })
    );

    useEffect(() => {
        setApolloClient(createApolloClient());
    }, [router.asPath]);

    return <ApolloProvider client={apolloClient}>{children}</ApolloProvider>;
};
