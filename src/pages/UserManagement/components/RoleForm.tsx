import { useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import ComponentCard from "../../../components/common/ComponentCard";
import Label from "../../../components/form/Label";
import InputField from "../../../components/form/input/InputField";
import Button from "../../../components/ui/button/Button";
import { usePermissionsQuery } from "../../../hooks/queries/roles";
import Checkbox from "../../../components/form/input/Checkbox";

const RoleSchema = z.object({
    name: z.string().min(1, "Name is required"),
    guard_name: z.string().default("web"),
    permissions: z.array(z.number()),
    description: z.string().optional(),
});

type RoleFormInput = z.infer<typeof RoleSchema>;

type Props = {
    initialValues?: Partial<RoleFormInput>;
    onSubmit: (values: RoleFormInput) => void;
    isSubmitting: boolean;
    onCancel: () => void;
    title?: string;
};

export function RoleForm({ initialValues, onSubmit, isSubmitting, onCancel, title = "Role Details" }: Props) {
    const { data: permissionsRes, isLoading: isLoadingPermissions } = usePermissionsQuery();

    const {
        control,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<RoleFormInput>({
        resolver: zodResolver(RoleSchema) as any,
        defaultValues: {
            name: "",
            guard_name: "web",
            permissions: [],
            description: "",
            ...initialValues,
        },
    });

    const selectedPermissions = watch("permissions");

    // Helper to toggle a permission
    const handleTogglePermission = (id: number) => {
        const current = selectedPermissions || [];
        if (current.includes(id)) {
            setValue("permissions", current.filter((p) => p !== id));
        } else {
            setValue("permissions", [...current, id]);
        }
    };

    // Helper to toggle a whole group
    const handleToggleGroup = (ids: number[]) => {
        const current = selectedPermissions || [];
        const allSelected = ids.every((id) => current.includes(id));

        if (allSelected) {
            setValue("permissions", current.filter((id) => !ids.includes(id)));
        } else {
            const toAdd = ids.filter((id) => !current.includes(id));
            setValue("permissions", [...current, ...toAdd]);
        }
    };

    const permissionGroups = useMemo(() => {
        if (!permissionsRes?.permissions) return {};
        return permissionsRes.permissions;
    }, [permissionsRes]);

    return (
        <div className="space-y-6">
            <ComponentCard title={title}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div>
                            <Label htmlFor="name">Role Name</Label>
                            <Controller
                                name="name"
                                control={control}
                                render={({ field }) => (
                                    <InputField
                                        id="name"
                                        name={field.name}
                                        placeholder="e.g. Manager"
                                        value={field.value}
                                        onChange={field.onChange}
                                        error={!!errors.name}
                                        hint={errors.name?.message}
                                    />
                                )}
                            />
                        </div>
                        <div>
                            <Label htmlFor="guard_name">Guard Name</Label>
                            <Controller
                                name="guard_name"
                                control={control}
                                render={({ field }) => (
                                    <InputField
                                        id="guard_name"
                                        name={field.name}
                                        placeholder="web"
                                        value={field.value}
                                        onChange={field.onChange}
                                        disabled // Usually fixed to 'web'
                                    />
                                )}
                            />
                        </div>
                        <div className="col-span-1 md:col-span-2">
                            <Label htmlFor="description">Description</Label>
                            <Controller
                                name="description"
                                control={control}
                                render={({ field }) => (
                                    <InputField
                                        id="description"
                                        name={field.name}
                                        placeholder="Role description"
                                        value={field.value || ""}
                                        onChange={field.onChange}
                                    />
                                )}
                            />
                        </div>
                    </div>

                    <div className="border-t border-gray-100 pt-6 dark:border-white/[0.05]">
                        <h3 className="mb-4 text-lg font-medium text-gray-800 dark:text-white/90">Permissions</h3>

                        {isLoadingPermissions && <p className="text-gray-500">Loading permissions...</p>}

                        <div className="space-y-6">
                            {Object.entries(permissionGroups).map(([groupName, permissions]) => (
                                <div key={groupName} className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                                    <div className="mb-3 flex items-center justify-between">
                                        <h4 className="font-semibold text-gray-700 capitalize dark:text-gray-200">{groupName} Permissions</h4>
                                        <button
                                            type="button"
                                            onClick={() => handleToggleGroup(permissions.map(p => p.id))}
                                            className="text-sm text-brand-500 hover:text-brand-600"
                                        >
                                            Toggle All
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                        {permissions.map((permission) => (
                                            <div key={permission.id} className="flex items-start">
                                                <Checkbox
                                                    id={`perm-${permission.id}`}
                                                    checked={(selectedPermissions || []).includes(permission.id)}
                                                    onChange={() => handleTogglePermission(permission.id)}
                                                    label={permission.name}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                        {errors.permissions && <p className="text-sm text-error-500 mt-2">{errors.permissions.message}</p>}
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Saving..." : "Save Role"}
                        </Button>
                    </div>
                </form>
            </ComponentCard>
        </div>
    );
}
