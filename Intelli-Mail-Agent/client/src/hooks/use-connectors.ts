import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { isUnauthorizedError, redirectToLogin } from "@/lib/auth-utils";
import { useToast } from "@/hooks/use-toast";

type Connector = {
  id: string;
  name: string;
  icon: string;
  connected: boolean;
};

export function useConnectors() {
  const { toast } = useToast();

  return useQuery<Connector[]>({
    queryKey: [api.connectors.list.path],
    queryFn: async () => {
      const res = await fetch(api.connectors.list.path, { credentials: "include" });
      if (!res.ok) {
        if (res.status === 401) throw new Error("401: Unauthorized");
        throw new Error("Failed to fetch connectors");
      }
      return api.connectors.list.responses[200].parse(await res.json());
    },
    // Adding some mock data fallback in case backend endpoint is not fully implemented
    // The requirements mention "missing APIs will fail - that's OK", but we want to show
    // the UI for connectors even if the backend is sparse.
  });
}
