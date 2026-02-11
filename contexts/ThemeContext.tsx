'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}

// Create context with a default value to prevent SSR errors
const ThemeContext = createContext<ThemeContextType>({
    theme: 'dark',
    toggleTheme: () => { },
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>('dark');

    useEffect(() => {
        // Load theme from localStorage or default to dark
        const savedTheme = localStorage.getItem('theme') as Theme | null;
        if (savedTheme && savedTheme !== 'dark') {
            setTheme(savedTheme);
            document.documentElement.classList.remove('light', 'dark'); // Clear existing classes
            document.documentElement.classList.add(savedTheme);
        } else {
            setTheme('dark');
            document.documentElement.classList.remove('light', 'dark'); // Clear existing classes
            document.documentElement.classList.add('dark');
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
    };

    // Provide default values during SSR to prevent errors
    const value = {
        theme,
        toggleTheme,
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    return context;
}
