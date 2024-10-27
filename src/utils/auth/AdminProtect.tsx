'use client';

import React from 'react';
import { useIsAdmin } from './useIsAdmin';

interface AdminProtectProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

const AdminProtect: React.FC<AdminProtectProps> = ({ children, fallback }) => {
    const isAdmin = useIsAdmin();

    if (!isAdmin) {
        return fallback || null;
    }

    return <>{children}</>;
};

export default AdminProtect;
