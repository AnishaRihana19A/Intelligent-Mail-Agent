import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError, redirectToLogin } from "@/lib/auth-utils";
import type { InsertCampaign, Campaign, UpdateCampaignRequest } from "@shared/schema";

export function useCampaigns() {
  return useQuery<Campaign[]>({
    queryKey: [api.campaigns.list.path],
    queryFn: async () => {
      const res = await fetch(api.campaigns.list.path, { credentials: "include" });
      if (!res.ok) {
        if (res.status === 401) throw new Error("401: Unauthorized");
        throw new Error("Failed to fetch campaigns");
      }
      return api.campaigns.list.responses[200].parse(await res.json());
    },
  });
}

export function useCampaign(id: number) {
  return useQuery<Campaign>({
    queryKey: [api.campaigns.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.campaigns.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) {
        if (res.status === 401) throw new Error("401: Unauthorized");
        throw new Error("Failed to fetch campaign");
      }
      return api.campaigns.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateCampaign() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: Omit<InsertCampaign, "userId">) => {
      const res = await fetch(api.campaigns.create.path, {
        method: api.campaigns.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        if (res.status === 401) throw new Error("401: Unauthorized");
        throw new Error("Failed to create campaign");
      }
      return api.campaigns.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.campaigns.list.path] });
      toast({ title: "Campaign Created", description: "Your new campaign is ready." });
    },
    onError: (err) => {
      if (isUnauthorizedError(err)) redirectToLogin(toast);
      else toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
}

export function useUpdateCampaign() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: { generatedEmail: string } }) => {
      const url = buildUrl(api.campaigns.update.path, { id });
      const res = await fetch(url, {
        method: api.campaigns.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        if (res.status === 401) throw new Error("401: Unauthorized");
        throw new Error("Failed to update campaign");
      }
      return api.campaigns.update.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.setQueryData([api.campaigns.get.path, data.id], data);
      queryClient.invalidateQueries({ queryKey: [api.campaigns.list.path] });
      toast({ title: "Saved", description: "Campaign updated successfully." });
    },
    onError: (err) => {
      if (isUnauthorizedError(err)) redirectToLogin(toast);
      else toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
}

export function useGenerateEmail() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.campaigns.generate.path, { id });
      const res = await fetch(url, {
        method: api.campaigns.generate.method,
        credentials: "include",
      });
      if (!res.ok) {
        if (res.status === 401) throw new Error("401: Unauthorized");
        throw new Error("Failed to generate email");
      }
      return api.campaigns.generate.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.setQueryData([api.campaigns.get.path, data.id], data);
      queryClient.invalidateQueries({ queryKey: [api.campaigns.list.path] });
      toast({ title: "Email Generated", description: "AI has drafted your email." });
    },
    onError: (err) => {
      if (isUnauthorizedError(err)) redirectToLogin(toast);
      else toast({ title: "Generation Failed", description: err.message, variant: "destructive" });
    },
  });
}

export function useSendEmail() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.campaigns.send.path, { id });
      const res = await fetch(url, {
        method: api.campaigns.send.method,
        credentials: "include",
      });
      if (!res.ok) {
        if (res.status === 401) throw new Error("401: Unauthorized");
        throw new Error("Failed to send email");
      }
      return api.campaigns.send.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.setQueryData([api.campaigns.get.path, data.id], data);
      queryClient.invalidateQueries({ queryKey: [api.campaigns.list.path] });
      toast({ title: "Email Sent!", description: "Your campaign email is on its way." });
    },
    onError: (err) => {
      if (isUnauthorizedError(err)) redirectToLogin(toast);
      else toast({ title: "Send Failed", description: err.message, variant: "destructive" });
    },
  });
}

export function useDeleteCampaign() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.campaigns.delete.path, { id });
      const res = await fetch(url, {
        method: api.campaigns.delete.method,
        credentials: "include",
      });
      if (!res.ok) {
        if (res.status === 401) throw new Error("401: Unauthorized");
        throw new Error("Failed to delete campaign");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.campaigns.list.path] });
      toast({ title: "Deleted", description: "Campaign removed." });
    },
    onError: (err) => {
      if (isUnauthorizedError(err)) redirectToLogin(toast);
      else toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
}
