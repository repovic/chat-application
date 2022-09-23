/** @type {import('next').NextConfig} */
const withPWA = require("next-pwa");

const nextConfig = {
    reactStrictMode: true,
    images: {
        domains: process.env.IMAGES_DOMAINS.split(" ") || [],
    },
    webpack(config) {
        config.module.rules.push({
            test: /\.svg$/,
            use: ["@svgr/webpack"],
        });

        return config;
    },
};

module.exports = withPWA({
    ...nextConfig,
    pwa: {
        dest: "public",
    },
});
