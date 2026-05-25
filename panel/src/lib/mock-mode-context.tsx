"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";

interface MockModeContextValue {
  isMockEnabled: boolean;
  toggle: () => void;
}

const MockModeContext = createContext<MockModeContextValue>({
  isMockEnabled: true,
  toggle: () => {},
});

function getInitialMockState(): boolean {
  if (typeof window === "undefined") return true;
  const stored = localStorage.getItem("mockEnabled");
  if (stored === null) return true;
  return stored === "true";
}

export function MockModeProvider({ children }: { children: React.ReactNode }) {
  const [isMockEnabled, setIsMockEnabled] = useState(getInitialMockState);

  useEffect(() => {
    localStorage.setItem("mockEnabled", String(isMockEnabled));
  }, [isMockEnabled]);

  const toggle = useCallback(() => setIsMockEnabled((p) => !p), []);

  return (
    <MockModeContext.Provider value={{ isMockEnabled, toggle }}>
      {children}
    </MockModeContext.Provider>
  );
}

export function useMockMode() {
  return useContext(MockModeContext);
}
