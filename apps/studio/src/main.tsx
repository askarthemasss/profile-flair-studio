import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { App } from "./App";
import "./styles.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale data is served instantly; refresh in background.
      staleTime: 1000 * 60 * 2, // 2 min
      // Profile lookups are explicit and the anonymous GitHub budget is small;
      // tab focus should not silently spend it.
      refetchOnWindowFocus: false,
      retry: 2,
    },
  },
});

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("No #root element found");

createRoot(rootEl).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
        <Toaster position="bottom-right" theme="dark" />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
