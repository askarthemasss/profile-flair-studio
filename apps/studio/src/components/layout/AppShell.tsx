import React, { type ReactNode } from "react";
import { Header } from "./Header.js";
import { ErrorBoundary } from "./ErrorBoundary.js";

interface AppShellProps {
  children: ReactNode;
  hideHeader?: boolean;
}

export const AppShell: React.FC<AppShellProps> = ({ children, hideHeader = false }) => {
  return (
    <div className="flex min-h-screen w-full flex-col bg-obsidian text-ink antialiased">
      {!hideHeader && <Header />}
      <ErrorBoundary>
        <main className="flex-1 w-full">{children}</main>
      </ErrorBoundary>
    </div>
  );
};
