import React from 'react';
import { StudioAuthProvider } from '@/components/auth/StudioAuthProvider';

export default function SignOutLayout({ children }: { children: React.ReactNode }) {
    return <StudioAuthProvider>{children}</StudioAuthProvider>;
}
