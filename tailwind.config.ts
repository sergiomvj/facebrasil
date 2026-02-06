import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: 'class', // Enable dark mode via class strategy
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#F97316', // Orange-500
                    dark: '#EA580C', // Orange-600
                },
                'accent-yellow': '#FCD34D',
                background: "var(--background)",
                foreground: "var(--foreground)",
            },
        },
    },
    plugins: [],
};

export default config;
