
import { Modal } from "../../../components/ui/modal";
import Button from "../../../components/ui/button/Button";
import type { Invoice } from "../../../types/order";
import { DownloadIcon } from "../../../icons";
import { useDownloadOrderInvoiceMutation } from "../../../hooks/queries/orders";

interface InvoiceModalProps {
    isOpen: boolean;
    closeModal: () => void;
    invoice: Invoice | null | undefined;
    orderId?: number;
}

export default function InvoiceModal({ isOpen, closeModal, invoice, orderId }: InvoiceModalProps) {
    const downloadInvoiceMutation = useDownloadOrderInvoiceMutation();

    if (!invoice) return null;

    const handleDownload = () => {
        if (orderId) {
            downloadInvoiceMutation.mutate(orderId);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={closeModal} size="4xl">
            <div className="flex flex-col h-full max-h-[90vh]">
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/[0.05]">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                            Invoice #{invoice.invoice_number}
                            <span
                                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide ${invoice.status === "paid"
                                    ? "bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400"
                                    : "bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400"
                                    }`}
                            >
                                {invoice.status}
                            </span>
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Issued on {new Date(invoice.invoice_date).toLocaleDateString()}
                        </p>
                    </div>
                    <button
                        onClick={closeModal}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                        <span className="sr-only">Close</span>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Modal Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {/* Billing & Delivery Info Cards */}
                    {invoice.billing_details && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-5 rounded-2xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.05]">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Billed To</h4>
                                <div className="space-y-1">
                                    <p className="text-base font-semibold text-gray-900 dark:text-white">
                                        {invoice.billing_details.customer_name || "N/A"}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {invoice.billing_details.customer_email}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {invoice.billing_details.customer_phone}
                                    </p>
                                </div>
                            </div>

                            {invoice.billing_details.delivery_address && (
                                <div className="p-5 rounded-2xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.05]">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Shipped To</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                        {invoice.billing_details.delivery_address}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Items Table */}
                    <div>
                        <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Item Details</h4>
                        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-white/[0.05] shadow-sm">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50/50 dark:bg-white/[0.02]">
                                    <tr>
                                        <th className="px-5 py-4 font-semibold text-gray-600 dark:text-gray-300">Item Description</th>
                                        <th className="px-5 py-4 font-semibold text-gray-600 dark:text-gray-300 text-right w-24">Qty</th>
                                        <th className="px-5 py-4 font-semibold text-gray-600 dark:text-gray-300 text-right w-32">Unit Price</th>
                                        <th className="px-5 py-4 font-semibold text-gray-600 dark:text-gray-300 text-right w-32">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                    {invoice.items.map((item, index) => (
                                        <tr key={index} className="hover:bg-gray-50/30 dark:hover:bg-white/[0.01]">
                                            <td className="px-5 py-4 text-gray-900 dark:text-white font-medium">{item.product_name}</td>
                                            <td className="px-5 py-4 text-right text-gray-600 dark:text-gray-400">{item.quantity}</td>
                                            <td className="px-5 py-4 text-right text-gray-600 dark:text-gray-400">₹{parseFloat(item.unit_price).toFixed(2)}</td>
                                            <td className="px-5 py-4 text-right text-gray-900 dark:text-white font-medium">₹{item.total_price.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Summary Section */}
                    <div className="flex justify-end">
                        <div className="w-full md:w-80 space-y-3">
                            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                                <span>Subtotal</span>
                                <span>₹{invoice.subtotal.toFixed(2)}</span>
                            </div>
                            {invoice.tax_amount > 0 && (
                                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                                    <span>Tax (GST)</span>
                                    <span>+ ₹{invoice.tax_amount.toFixed(2)}</span>
                                </div>
                            )}
                            {invoice.discount_amount > 0 && (
                                <div className="flex justify-between text-sm text-success-600 dark:text-success-400">
                                    <span>Discount</span>
                                    <span>- ₹{invoice.discount_amount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="pt-3 border-t border-gray-100 dark:border-white/[0.05]">
                                <div className="flex justify-between items-center">
                                    <span className="text-base font-bold text-gray-900 dark:text-white">Total Amount</span>
                                    <span className="text-xl font-bold text-brand-600 dark:text-brand-400">₹{invoice.total_amount.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-white/[0.05] bg-gray-50/50 dark:bg-white/[0.02]">
                    <Button variant="outline" onClick={closeModal} size="sm">
                        Close
                    </Button>
                    <Button
                        variant="primary"
                        startIcon={<DownloadIcon className="w-4 h-4" />}
                        onClick={handleDownload}
                        disabled={downloadInvoiceMutation.isPending}
                        size="sm"
                    >
                        {downloadInvoiceMutation.isPending ? "Downloading..." : "Download PDF"}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
