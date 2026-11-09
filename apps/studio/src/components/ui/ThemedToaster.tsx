import React from "react";
import { Toaster } from "sonner";
import { useUiThemeStore } from "../../store/ui-theme-store.js";

export const ThemedToaster: React.FC = () => {
  const theme = useUiThemeStore((state) => state.theme);

  return (
    <Toaster
      position="bottom-right"
      theme={theme}
      toastOptions={{
        style: {
          background: "var(--card-glass-hover)",
          color: "var(--charcoal)",
          border: "1px solid var(--card-border)",
          borderRadius: "var(--r-lg)",
          boxShadow: "var(--card-shadow)",
          fontFamily: "var(--font-sans)",
          fontSize: "0.78rem",
        },
      }}
    />
  );
};
