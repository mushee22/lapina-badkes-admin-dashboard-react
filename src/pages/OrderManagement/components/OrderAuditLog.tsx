
import ComponentCard from "../../../components/common/ComponentCard";
import type { OrderAudit } from "../../../types/order";
import Badge from "../../../components/ui/badge/Badge";

interface OrderAuditLogProps {
    audits: OrderAudit[] | undefined;
}

const getActionBadgeColor = (action: string): "warning" | "info" | "success" | "error" | "light" | "brand" => {
    switch (action) {
        case "created":
            return "brand";
        case "status_changed":
            return "warning";
        case "delivery_boy_assigned":
            return "info";
        case "delivered":
            return "success";
        case "cancelled":
            return "error";
        case "invoice_generated":
            return "success";
        default:
            return "light";
    }
};

const formatActionText = (action: string) => {
    return action.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

export default function OrderAuditLog({ audits }: OrderAuditLogProps) {
    if (!audits || audits.length === 0) {
        return null;
    }

    return (
        <ComponentCard title="Order History">
            <div className="flow-root">
                <ul className="-mb-8">
                    {audits.map((audit, auditIdx) => (
                        <li key={audit.id}>
                            <div className="relative pb-8">
                                {auditIdx !== audits.length - 1 ? (
                                    <span
                                        className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-white/[0.1]"
                                        aria-hidden="true"
                                    />
                                ) : null}
                                <div className="relative flex space-x-3">
                                    <div>
                                        <span
                                            className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white dark:ring-gray-800 ${getActionBadgeColor(audit.action) === "brand" ? "bg-brand-500" :
                                                getActionBadgeColor(audit.action) === "success" ? "bg-success-500" :
                                                    getActionBadgeColor(audit.action) === "warning" ? "bg-warning-500" :
                                                        getActionBadgeColor(audit.action) === "error" ? "bg-error-500" :
                                                            getActionBadgeColor(audit.action) === "info" ? "bg-blue-500" : "bg-gray-500"
                                                }`}
                                        >
                                            {/* Simple Icon based on action, or generic dot */}
                                            <span className="h-2.5 w-2.5 rounded-full bg-white" />
                                        </span>
                                    </div>
                                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                        <div>
                                            <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">
                                                {formatActionText(audit.action)}
                                            </p>

                                            {audit.notes && (
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                    {audit.notes}
                                                </p>
                                            )}

                                            {/* Attribute Changes */}
                                            {audit.action === 'status_changed' && audit.old_value && audit.new_value && (
                                                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                                    <Badge variant="light" size="sm" color="warning">{audit.old_value}</Badge>
                                                    <span>→</span>
                                                    <Badge variant="light" size="sm" color="success">{audit.new_value}</Badge>
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-right text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                                            <div>{new Date(audit.created_at).toLocaleString()}</div>
                                            {audit.user && (
                                                <div className="text-xs mt-1 text-gray-400 dark:text-gray-500">
                                                    by {audit.user.name} ({audit.user.roles[0] || 'user'})
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </ComponentCard>
    );
}
