/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/pages/**/*.{ts,tsx}", "./src/components/**/*.{ts,tsx}"],
    theme: {
        extend: {
            colors: {
                primary: "var(--primary-color)",
                secondary: "var(--secondary-color)",
                tertiary: "var(--tertiary-color)",
            },
        },
    },
    plugins: [],
};

/**
 * Purple:
 * {
        primary: "#b701fb",
        secondary: "#36004b",
        tertiary: "#180021",
    },

    Red:
    {
        primary: "#fb0801",
        secondary: "#4b0100",
        tertiary: "#210000",
    }

    Vaibrant Blue:
    {
        primary: "#010ffb",
        secondary: "#00054b",
        tertiary: "#000221",
    }

    Orange:
    {
        primary: "#fb7001",
        secondary: "#4b2100",
        tertiary: "#210e00",
    },

    Pink 1/1:
    {
        primary: "#fb01ca",
        secondary: "#4b003d",
        tertiary: "#21001b",
    }
 */
