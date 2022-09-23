import { makeExecutableSchema } from "@graphql-tools/schema";
import { ApolloServerPluginDrainHttpServer } from "apollo-server-core";
import { ApolloServer } from "apollo-server-express";
import * as cookieParser from "cookie-parser";
import * as cors from "cors";
import * as express from "express";
import { useServer } from "graphql-ws/lib/use/ws";
import { createServer } from "http";
import mongoose, { MongooseError } from "mongoose";
import { Server } from "ws";
import { resolvers, typeDefs } from "./graphql";
import authMiddleware from "./middlewares/auth.middleware";
import { userService } from "./services";
const { graphqlUploadExpress } = require("graphql-upload");
require("dotenv").config({
    path: (process.env.NODE_ENV as string)
        ? `./src/environment/.env.${process.env.NODE_ENV}`
        : "./.env",
});

const app = express();

app.use(
    cors({
        origin: process.env.CLIENT_ORIGIN.split(" ") || [],
        methods: ["GET", "POST"],
        credentials: true,
    })
);
app.use(cookieParser());
app.use(authMiddleware);

app.use("/static", express.static("public"));
app.use(graphqlUploadExpress());

const httpServer = createServer(app);

// TODO: Implement Rate Limiting
const schema = makeExecutableSchema({ typeDefs, resolvers });

const server = new ApolloServer({
    schema,
    context: ({ req, res }) => ({ req, res }),
    cache: "bounded",
    plugins: [
        ApolloServerPluginDrainHttpServer({ httpServer }),
        {
            async serverWillStart() {
                return {
                    async drainServer() {
                        await serverCleanup.dispose();
                    },
                };
            },
        },
    ],
});

const wsServer = new Server({
    server: httpServer,
    path: "/subscriptions",
});

const handleConnect = async (ctx: any) => {
    try {
        const subscriptionToken = ctx.connectionParams[
            "X-Subscription-Token"
        ] as string;

        if (!subscriptionToken) {
            return;
        }

        const { userId } = await userService.validateSubscriptionToken(
            ctx.connectionParams["X-Subscription-Token"] as string
        );

        await userService.updateOnlineStatus({
            userId,
            onlineStatus: true,
        });
    } catch (error) {}
};

const handleDisconnect = async (ctx: any) => {
    try {
        const subscriptionToken = ctx.connectionParams[
            "X-Subscription-Token"
        ] as string;

        if (!subscriptionToken) {
            return;
        }

        const { userId } = await userService.validateSubscriptionToken(
            ctx.connectionParams["X-Subscription-Token"] as string
        );

        await userService.updateLastOnline({
            userId,
            lastOnline: Date.now(),
        });
    } catch (error) {}
};

const serverCleanup = useServer(
    {
        schema,
        onConnect: handleConnect,
        onComplete: handleConnect,
        context: async (ctx, msg, args) => {
            try {
                const { userId } = await userService.validateSubscriptionToken(
                    ctx.connectionParams["X-Subscription-Token"] as string
                );

                return {
                    userId,
                };
            } catch (error) {
                return {
                    userId: null,
                };
            }
        },
        onError: handleDisconnect,
        onClose: handleDisconnect,
    },
    wsServer
);

console.log("=".repeat(51));
(async () => {
    await mongoose
        .connect(process.env.MONGODB_CONNECTION_STRING as string)
        .then(() => {
            console.log("[Server]: Successfully connected to MongoDB server!");
        })
        .catch((err: MongooseError) => {
            console.error(
                `[Server]: Couldn't connect to MongoDB server: ${err.message}`
            );
            process.exit();
        });

    await server.start();
    server.applyMiddleware({
        app,
        cors: false,
        path: "/graphql",
    });

    const PORT = process.env.PORT || 5555;
    httpServer.listen(PORT, () => {
        console.log(
            `[Server]: Successfully started in`,
            `\x1b[31m${process.env.NODE_ENV}\x1b[0m`,
            `mode!`
        );

        console.log(`[Server]: Listens at port: \x1b[31m${PORT}\x1b[0m`);
        console.log("=".repeat(51));
    });
})();
