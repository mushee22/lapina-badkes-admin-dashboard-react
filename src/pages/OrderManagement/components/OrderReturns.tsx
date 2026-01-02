import { useOrderReturnsQuery, useCancelOrderReturnMutation, useProcessOrderReturnMutation } from "../../../hooks/queries/orders";
import Badge from "../../../components/ui/badge/Badge";
import Button from "../../../components/ui/button/Button";
import type { ReturnOrderDetails } from "../../../types/order";

interface OrderReturnsProps {
    orderId: number;
}

export default function OrderReturns({ orderId }: OrderReturnsProps) {
    const { data: returnsData, isLoading, error } = useOrderReturnsQuery(orderId);
    const cancelMutation = useCancelOrderReturnMutation();
    const processMutation = useProcessOrderReturnMutation();

    if (isLoading) return <div className="p-4 text-center text-gray-500">Loading returns...</div>;
    if (error) return <div className="p-4 text-center text-error-500">Failed to load returns</div>;
    if (!returnsData || returnsData.returns.length === 0) return null;

    const handleCancel = (returnId: number) => {
        if (confirm("Are you sure you want to cancel this return?")) {
            cancelMutation.mutate({ id: returnId, orderId });
        }
    };

    const handleProcess = (returnId: number) => {
        if (confirm("Are you sure you want to process this return?")) {
            processMutation.mutate({ id: returnId, orderId });
        }
    };

    const getStatusColor = (status: string): "warning" | "success" | "error" | "light" => {
        switch (status) {
            case "pending": return "warning";
            case "processed": return "success";
            case "cancelled": return "error";
            default: return "light";
        }
    };

    return (
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Order Returns</h3>
                <div className="text-sm text-gray-500">
                    Total Returns: {returnsData.summary.total_returns} | Pending: {returnsData.summary.pending}
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th className="px-6 py-3">Product</th>
                            <th className="px-6 py-3">Quantities</th>
                            <th className="px-6 py-3">Reason</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Date</th>
                            <th className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {returnsData.returns.map((ret: ReturnOrderDetails) => (
                            <tr key={ret.id} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                    {ret.order_item?.product?.name || `Item #${ret.order_item_id}`}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="space-y-1 text-xs">
                                        <div>Returned: <span className="font-medium">{ret.returned_quantity}</span></div>
                                        {ret.defective_quantity > 0 && <div>Defective: <span className="text-error-600">{ret.defective_quantity}</span></div>}
                                        {ret.restocking_quantity > 0 && <div>Restock: <span className="text-success-600">{ret.restocking_quantity}</span></div>}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                    {ret.reason || "-"}
                                </td>
                                <td className="px-6 py-4">
                                    <Badge color={getStatusColor(ret.status)}>
                                        {ret.status}
                                    </Badge>
                                </td>
                                <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                    {new Date(ret.created_at).toLocaleString()}
                                </td>
                                <td className="px-6 py-4">
                                    {ret.status === "pending" && (
                                        <div className="flex gap-2">
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                onClick={() => handleProcess(ret.id)}
                                                disabled={processMutation.isPending}
                                                className="bg-brand-500 hover:bg-brand-600 dark:bg-brand-500 dark:hover:bg-brand-600"
                                            >
                                                Process
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleCancel(ret.id)}
                                                disabled={cancelMutation.isPending}
                                                className="text-error-600 border-error-200 hover:bg-error-50 dark:border-error-800 dark:hover:bg-error-900/20"
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
