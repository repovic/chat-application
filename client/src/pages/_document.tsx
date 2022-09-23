import { Head, Html, Main, NextScript } from "next/document";

export default function Document() {
    return (
        <Html>
            <Head>
                <link
                    rel="apple-touch-icon"
                    sizes="180x180"
                    href="/apple-touch-icon.png"
                />
                <link
                    rel="icon"
                    type="image/png"
                    sizes="32x32"
                    href="/favicon-32x32.png"
                />
                <link
                    rel="icon"
                    type="image/png"
                    sizes="16x16"
                    href="/favicon-16x16.png"
                />
                <meta name="theme-color" content="#001021" />
                <meta name="msapplication-TileColor" content="#001021"></meta>
                <meta name="description" content="Real-time Chat Application" />
                <link rel="manifest" href="/manifest.webmanifest" />
                <link
                    rel="preconnect"
                    href={process.env.NEXT_PUBLIC_SERVER_URL}
                />
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}
