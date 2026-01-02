import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as http from "./http";
import type { Route, CreateRouteInput, UpdateRouteInput } from "../types/route";

const routeService = {
    getAll: async () => {
        const { data } = await http.get<{ data: Route[] }>("/routes");
        return data;
    },
    getById: async (id: number) => {
        const { data } = await http.get<{ data: Route }>(`/routes/${id}`);
        return data;
    },
    create: async (route: CreateRouteInput) => {
        const { data } = await http.post<{ data: Route }>("/routes", route);
        return data;
    },
    update: async ({ id, ...route }: { id: number } & UpdateRouteInput) => {
        const { data } = await http.put<{ data: Route }>(`/routes/${id}`, route);
        return data;
    },
    delete: async (id: number) => {
        await http.del(`/routes/${id}`);
        return true;
    },
};

export const useRoutesQuery = () => {
    return useQuery({
        queryKey: ["routes"],
        queryFn: routeService.getAll,
    });
};

export const useRouteQuery = (id: number) => {
    return useQuery({
        queryKey: ["routes", id],
        queryFn: () => routeService.getById(id),
        enabled: !!id,
    });
};

export const useCreateRouteMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: routeService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["routes"] });
        },
    });
};

export const useUpdateRouteMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: routeService.update,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["routes"] });
        },
    });
};

export const useDeleteRouteMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: routeService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["routes"] });
        },
    });
};
