import webpush = require("web-push");
require("dotenv").config({
    path: `./src/environment/.env${
        ((process.env.NODE_ENV as string) && `.${process.env.NODE_ENV}`) || ""
    }`,
});

webpush.setVapidDetails(
    "mailto:repovic@repovic.dev",
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
);

export default {
    sendNotification: async (
        pushSubscription: PushSubscription,
        payload: any
    ) => {
        try {
            if (pushSubscription)
                return await webpush.sendNotification(
                    pushSubscription,
                    JSON.stringify({ ...payload, timestamp: Date.now() })
                );
        } catch (error) {}
    },
};
