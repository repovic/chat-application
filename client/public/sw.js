"use strict";

const cacheVersion = "v1-development";
const cacheName = `chat-application-${cacheVersion}`;

const cacheFiles = ["/", "/register", "/login", "/logout"];

self.addEventListener("install", function (event) {
    console.log("[ServiceWorker]: Successfully installed!");

    event.waitUntil(
        caches.open(cacheName).then(function (cache) {
            console.log("[ServiceWorker]: Caching pages...");
            return cache.addAll(cacheFiles);
        })
    );
});

self.addEventListener("activate", function (event) {
    console.log("[ServiceWorker]: Successfully activated!");
});

self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            if (response) {
                return response;
            }

            var fetchRequest = event.request.clone();

            return fetch(fetchRequest).then((response) => {
                if (
                    !response ||
                    response.status !== 200 ||
                    response.type !== "basic"
                ) {
                    return response;
                }

                if (
                    event.request.url.startsWith("http") &&
                    !event.request.url.includes("_next") &&
                    !event.request.url.includes("graphql")
                ) {
                    const responseToCache = response.clone();

                    caches.open(cacheName).then(function (cache) {
                        cache.put(event.request, responseToCache);
                    });
                }

                return response;
            });
        })
    );
});

self.addEventListener("push", (event) => {
    const notificationContent = event.data.json();

    const { title, ...rest } = notificationContent;
    console.log(
        `[ServiceWorker]: Received push notification: \"${rest.body}\"`
    );
    self.registration.showNotification(title || "Chat Application", rest);
});
