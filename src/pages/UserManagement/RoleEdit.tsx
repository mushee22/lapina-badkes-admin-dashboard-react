import { useNavigate, useParams } from "react-router";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { RoleForm } from "./components/RoleForm";
import { useRoleQuery, useUpdateRoleMutation } from "../../hooks/queries/roles";

export default function RoleEdit() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const roleId = Number(id);

    const { data: role, isLoading, isError } = useRoleQuery(roleId, !!roleId);
    const updateMutation = useUpdateRoleMutation();

    const handleSubmit = (values: any) => {
        updateMutation.mutate(
            { id: roleId, data: values },
            {
                onSuccess: () => {
                    navigate("/users/roles");
                },
            }
        );
    };

    const handleCancel = () => {
        navigate("/users/roles");
    };

    if (isLoading) return <div className="p-6">Loading role...</div>;
    if (isError || !role) return <div className="p-6 text-error-500">Failed to load role</div>;

    // Transform role data to form input shape
    // API returns permissions as array of objects, form expects array of IDs
    const initialValues = {
        name: role.name,
        guard_name: role.guard_name,
        description: "", // Description might not be in Role type from API list, but let's assume valid
        permissions: role.permissions ? role.permissions.map(p => p.id) : [],
    };

    return (
        <>
            <PageMeta title="Edit Role | Lapina Bakers Admin" description="Edit user role" />
            <PageBreadcrumb pageTitle="Edit Role" />
            <RoleForm
                title={`Edit Role: ${role.name}`}
                initialValues={initialValues}
                onSubmit={handleSubmit}
                isSubmitting={updateMutation.isPending}
                onCancel={handleCancel}
            />
        </>
    );
}
