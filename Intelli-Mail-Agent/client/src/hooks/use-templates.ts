import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError, redirectToLogin } from "@/lib/auth-utils";
import type { InsertTemplate, Template } from "@shared/schema";

export function useTemplates() {
  const { toast } = useToast();

  return useQuery<Template[]>({
    queryKey: [api.templates.list.path],
    queryFn: async () => {
      const res = await fetch(api.templates.list.path, { credentials: "include" });
      if (!res.ok) {
        if (res.status === 401) throw new Error("401: Unauthorized");
        throw new Error("Failed to fetch templates");
      }
      return api.templates.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateTemplate() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: Omit<InsertTemplate, "userId">) => {
      const res = await fetch(api.templates.create.path, {
        method: api.templates.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        if (res.status === 401) throw new Error("401: Unauthorized");
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to create template");
      }
      return api.templates.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.templates.list.path] });
      toast({ title: "Success", description: "Template created successfully." });
    },
    onError: (err) => {
      if (isUnauthorizedError(err)) {
        redirectToLogin(toast);
      } else {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      }
    },
  });
}

export function useDeleteTemplate() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.templates.delete.path, { id });
      const res = await fetch(url, {
        method: api.templates.delete.method,
        credentials: "include",
      });
      if (!res.ok) {
        if (res.status === 401) throw new Error("401: Unauthorized");
        throw new Error("Failed to delete template");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.templates.list.path] });
      toast({ title: "Deleted", description: "Template removed." });
    },
    onError: (err) => {
      if (isUnauthorizedError(err)) {
        redirectToLogin(toast);
      } else {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      }
    },
  });
}
