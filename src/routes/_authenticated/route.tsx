import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { RouteError } from "@/components/layout/RouteError";
import { supabase } from "@/integrations/supabase/client";
import { rememberIntendedPath } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      rememberIntendedPath(location.pathname);
      throw redirect({ to: "/", search: { signin: true } });
    }
  },
  errorComponent: RouteError,
  component: () => <Outlet />,
});
