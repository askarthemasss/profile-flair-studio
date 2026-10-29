import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { setConnected } from "../services/connection-service.js";
import { AppShell } from "../components/layout/AppShell.js";
import { Loader2 } from "lucide-react";

export const AuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Process query or hash fragment from OAuth callback
    const handleAuth = async () => {
      await setConnected(true);
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    };

    handleAuth();
  }, [navigate]);

  return (
    <AppShell hideHeader>
      <div className="flex min-h-[60vh] w-full flex-col items-center justify-center text-center">
        <Loader2 className="h-8 w-8 animate-spin text-ember" />
        <h2 className="mt-4 font-display text-lg font-semibold text-ink">
          Authenticating with GitHub...
        </h2>
        <p className="mt-1 text-xs text-ink-muted">
          Securing session and returning to your dashboard.
        </p>
      </div>
    </AppShell>
  );
};
