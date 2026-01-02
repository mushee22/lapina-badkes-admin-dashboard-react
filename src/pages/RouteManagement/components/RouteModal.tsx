import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "../../../components/ui/modal";
import Button from "../../../components/ui/button/Button";
import InputField from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import { CreateRouteSchema, type Route, type CreateRouteInput } from "../../../types/route";

interface RouteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateRouteInput) => void;
    initialData?: Route | null;
    isLoading?: boolean;
}

export default function RouteModal({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    isLoading,
}: RouteModalProps) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<CreateRouteInput>({
        resolver: zodResolver(CreateRouteSchema),
        defaultValues: {
            is_active: true,
        },
    });

    useEffect(() => {
        if (initialData) {
            reset({
                name: initialData.name,
                code: initialData.code,
                description: initialData.description,
                is_active: initialData.is_active,
            });
        } else {
            reset({
                name: "",
                code: "",
                description: "",
                is_active: true,
            });
        }
    }, [initialData, reset, isOpen]);

    const handleFormSubmit = (data: CreateRouteInput) => {
        onSubmit(data);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="md">
            <div className="p-6">
                <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">
                    {initialData ? "Edit Route" : "Add New Route"}
                </h3>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                    <div>
                        <Label htmlFor="name">Route Name</Label>
                        <InputField
                            id="name"
                            placeholder="e.g. Downtown Route"
                            {...register("name")}
                            error={!!errors.name}
                            hint={errors.name?.message}
                        />
                    </div>

                    <div>
                        <Label htmlFor="code">Route Code</Label>
                        <InputField
                            id="code"
                            placeholder="e.g. DT-001"
                            {...register("code")}
                            error={!!errors.code}
                            hint={errors.code?.message}
                        />
                    </div>

                    <div>
                        <Label htmlFor="description">Description</Label>
                        <textarea
                            id="description"
                            rows={3}
                            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 outline-none transition-all focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 dark:border-white/[0.1] dark:bg-white/[0.02] dark:text-white dark:focus:border-brand-500"
                            placeholder="Route covering downtown area..."
                            {...register("description")}
                        />
                        {errors.description && (
                            <p className="mt-1 text-xs text-error-500">{errors.description.message}</p>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="is_active"
                            className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-600 dark:border-white/[0.1] dark:bg-white/[0.02]"
                            {...register("is_active")}
                        />
                        <Label htmlFor="is_active" className="mb-0">
                            Active
                        </Label>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <Button variant="outline" onClick={onClose} type="button">
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit" disabled={isLoading}>
                            {isLoading ? "Saving..." : initialData ? "Update Route" : "Create Route"}
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
