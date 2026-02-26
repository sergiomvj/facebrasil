'use client';

import { ThemeProvider } from '@/contexts/ThemeContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { DailyActivityTriggers } from './DailyActivityTriggers';

export function ClientLayout({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider>
            <DailyActivityTriggers />
            <div className="flex flex-col min-h-screen">

                <Navbar />
                <main className="flex-grow">
                    {children}
                </main>
                <Footer />
            </div>
        </ThemeProvider>
    );
}
