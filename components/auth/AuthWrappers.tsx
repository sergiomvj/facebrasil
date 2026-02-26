'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

export const SignedIn: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading || !user) return null;

    return <>{children}</>;
};

export const SignedOut: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading || user) return null;

    return <>{children}</>;
};
