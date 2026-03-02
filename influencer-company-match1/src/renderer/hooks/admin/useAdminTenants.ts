import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import adminTenantService, { CreateTenantDto, UpdateTenantDto } from '../../services/admin-tenant.service';

// Query keys
export const adminTenantsKeys = {
  all: ['admin', 'tenants'] as const,
  lists: () => [...adminTenantsKeys.all, 'list'] as const,
  list: (page?: number) => [...adminTenantsKeys.lists(), { page }] as const,
  details: () => [...adminTenantsKeys.all, 'detail'] as const,
  detail: (id: string) => [...adminTenantsKeys.details(), id] as const,
};

// Fetch all tenants
export const useAdminTenants = (page: number = 1, limit: number = 20) => {
  return useQuery({
    queryKey: adminTenantsKeys.list(page),
    queryFn: async () => {
      return await adminTenantService.getTenants(page, limit);
    },
  });
};

// Update tenant
export const useUpdateAdminTenant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateTenantDto }) => {
      return await adminTenantService.updateTenant(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminTenantsKeys.lists() });
    },
  });
};

// Create tenant
export const useCreateAdminTenant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTenantDto) => {
      return await adminTenantService.createTenant(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminTenantsKeys.lists() });
    },
  });
};

// Delete tenant
export const useDeleteAdminTenant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return await adminTenantService.deleteTenant(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminTenantsKeys.lists() });
    },
  });
};
