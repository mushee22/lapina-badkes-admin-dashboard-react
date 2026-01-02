import { useNavigate } from "react-router";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { RoleForm } from "./components/RoleForm";
import { useCreateRoleMutation } from "../../hooks/queries/roles";

export default function RoleCreate() {
    const navigate = useNavigate();
    const createMutation = useCreateRoleMutation();

    const handleSubmit = (values: any) => {
        createMutation.mutate(values, {
            onSuccess: () => {
                navigate("/users/roles");
            },
        });
    };

    const handleCancel = () => {
        navigate("/users/roles");
    };

    return (
        <>
            <PageMeta title="Create Role | Lapina Bakes Admin" description="Create a new user role" />
            <PageBreadcrumb pageTitle="Create Role" />
            <RoleForm
                title="Create New Role"
                onSubmit={handleSubmit}
                isSubmitting={createMutation.isPending}
                onCancel={handleCancel}
            />
        </>
    );
}
