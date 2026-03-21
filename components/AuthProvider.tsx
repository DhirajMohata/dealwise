'use client';

import { SessionProvider } from 'next-auth/react';
import { useState, useCallback, createContext, useContext, type ReactNode } from 'react';

// ---------------------------------------------------------------------------
// Auth Modal Context (for open/close state across components)
// ---------------------------------------------------------------------------

interface AuthModalContextType {
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
}

export const AuthModalContext = createContext<AuthModalContextType>({
  isAuthModalOpen: false,
  openAuthModal: () => {},
  closeAuthModal: () => {},
});

export function useAuthModal() {
  return useContext(AuthModalContext);
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const openAuthModal = useCallback(() => setIsAuthModalOpen(true), []);
  const closeAuthModal = useCallback(() => setIsAuthModalOpen(false), []);

  return (
    <SessionProvider>
      <AuthModalContext.Provider
        value={{ isAuthModalOpen, openAuthModal, closeAuthModal }}
      >
        {children}
      </AuthModalContext.Provider>
    </SessionProvider>
  );
}
