import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router";
import { useInvoicesPaginatedQuery, useDownloadOrderInvoiceMutation } from "../../hooks/queries/orders";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import Badge from "../../components/ui/badge/Badge";
import { DownloadIcon, EyeIcon, PencilIcon } from "../../icons";
import Pagination from "../../components/common/Pagination";
import { useModal } from "../../hooks/useModal";
import { useStoresPaginatedQuery } from "../../hooks/queries/stores";
import { useLocationsQuery } from "../../hooks/queries/locations";
import { useDeliveryBoysListQuery } from "../../hooks/queries/deliveryBoys";
import { useToast } from "../../context/ToastContext";
import { exportInvoices } from "../../services/reports";
import InvoiceModal from "../OrderManagement/components/InvoiceModal";
import EditInvoiceModal from "../OrderManagement/components/EditInvoiceModal";
import InvoiceExportModal from "./components/InvoiceExportModal";
import type { Invoice } from "../../types/order";
import Button from "../../components/ui/button/Button";

export default function Invoices() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState<number>(Number(searchParams.get("page")) || 1);
  const [perPage, _] = useState<number>(Number(searchParams.get("per_page")) || 15);
  const [search, setSearch] = useState<string>(searchParams.get("search") || "");

  const { data: invoicesRes, isLoading } = useInvoicesPaginatedQuery({
    page,
    per_page: perPage,
    search,
  });

  const downloadInvoiceMutation = useDownloadOrderInvoiceMutation();
  const { showToast } = useToast();
  const { isOpen: isInvoiceModalOpen, openModal: openInvoiceModal, closeModal: closeInvoiceModal } = useModal();
  const { isOpen: isEditModalOpen, openModal: openEditModal, closeModal: closeEditModal } = useModal();
  const { isOpen: isExportModalOpen, openModal: openExportModal, closeModal: closeExportModal } = useModal();
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Data for filters
  const { data: locations = [] } = useLocationsQuery();
  const { data: storesRes } = useStoresPaginatedQuery({ per_page: 100 });
  const stores = storesRes?.data ?? [];
  const { data: deliveryBoys = [] } = useDeliveryBoysListQuery({});

  useEffect(() => {
    const params = new URLSearchParams();
    if (page > 1) params.set("page", String(page));
    if (perPage !== 15) params.set("per_page", String(perPage));
    if (search) params.set("search", search);
    setSearchParams(params, { replace: true });
  }, [page, perPage, search, setSearchParams]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const invoices = invoicesRes?.data || [];
  const meta = invoicesRes?.meta;

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    openInvoiceModal();
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    openEditModal();
  };

  const getStatusColor = (status: string): "success" | "warning" | "error" | "info" | "light" => {
    const s = status.toLowerCase();
    if (s === "paid") return "success";
    if (s === "pending") return "warning";
    if (s === "cancelled") return "error";
    if (s === "overdue") return "error";
    return "info";
  };

  const handleExport = async (params: {
    store_id?: number;
    location_id?: number;
    start_date?: string;
    end_date?: string;
    delivery_boy_id?: number;
  }) => {
    setIsExporting(true);
    try {
      const blob = await exportInvoices(params);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoices-export-${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showToast("success", "Invoices exported successfully", "Success");
      closeExportModal();
    } catch (error) {
      showToast("error", error instanceof Error ? error.message : "Failed to export invoices", "Error");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <PageMeta title="All Invoices | Lapina Bakes Admin" description="View and manage all invoices" />
      <PageBreadcrumb pageTitle="All Invoices" />

      <div className="space-y-6">
        <ComponentCard
          title="Invoices List"
          headerRight={
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={openExportModal}
                startIcon={<DownloadIcon className="w-4 h-4" />}
              >
                Export Excel
              </Button>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Search invoice #"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-10 w-64 rounded-lg border border-gray-200 pl-10 pr-4 text-sm focus:border-brand-300 focus:outline-none focus:ring-4 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>
          }
        >
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-gray-700 dark:text-gray-400 text-gray-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Invoice #</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Order #</th>
                    <th className="px-4 py-3 font-medium">Customer</th>
                    <th className="px-4 py-3 font-medium">Amount</th>
                    <th className="px-4 py-3 font-medium text-center">Status</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                        <div className="flex flex-col items-center gap-2">
                          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent"></div>
                          Loading invoices...
                        </div>
                      </td>
                    </tr>
                  ) : invoices.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                        No invoices found.
                      </td>
                    </tr>
                  ) : (
                    invoices.map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-4 py-3 font-medium text-gray-800 dark:text-white">
                          {invoice.formatted_invoice_number || invoice.invoice_number}
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                          {new Date(invoice.invoice_date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          {invoice.order ? (
                            <div className="flex flex-col">
                              <Link
                                to={`/orders/${invoice.order.id}`}
                                className="text-brand-600 hover:underline font-medium"
                              >
                                {invoice.order.order_number}
                              </Link>
                              <div className="mt-1 flex flex-col gap-0.5 text-[11px] leading-tight text-gray-500 dark:text-gray-400">
                                <span className="font-medium text-gray-700 dark:text-gray-300">
                                  {invoice.order.store?.name || "No Store"}
                                </span>
                                <span className="flex items-center gap-1">
                                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                  {invoice.order.location?.name || "No Route"}
                                </span>
                              </div>
                            </div>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col">
                            <span className="text-gray-800 dark:text-white font-medium">
                              {invoice.billing_details?.customer_name || "—"}
                            </span>
                            {invoice.billing_details?.customer_phone && (
                              <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                {invoice.billing_details.customer_phone}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 min-w-[140px]">
                          <div className="flex flex-col text-[11px] space-y-0.5">
                            <div className="flex justify-between gap-3 text-gray-500 dark:text-gray-400">
                              <span>Subtotal:</span>
                              <span>₹{invoice.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between gap-3 text-gray-500 dark:text-gray-400">
                              <span>Tax:</span>
                              <span>₹{invoice.tax_amount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between gap-3 pt-1 mt-1 border-t border-gray-100 dark:border-gray-800">
                              <span className="font-semibold text-gray-800 dark:text-white">Total:</span>
                              <span className="font-bold text-brand-600 dark:text-brand-400">₹{invoice.total_amount.toFixed(2)}</span>
                            </div>
                            <div className="text-[10px] font-medium text-gray-400 dark:text-gray-500 mt-1 uppercase tracking-wider">
                              {invoice.items.length} {invoice.items.length === 1 ? 'Item' : 'Items'}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge variant="light" color={getStatusColor(invoice.status)} size="sm">
                            {invoice.status_label || invoice.status.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleViewInvoice(invoice)}
                              className="p-1.5 text-gray-500 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                              title="View Invoice"
                            >
                              <EyeIcon className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleEditInvoice(invoice)}
                              className="p-1.5 text-gray-500 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                              title="Edit Invoice"
                            >
                              <PencilIcon className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => downloadInvoiceMutation.mutate(invoice.id)}
                              disabled={downloadInvoiceMutation.isPending}
                              className="p-1.5 text-gray-500 hover:text-brand-600 dark:hover:text-brand-400 transition-colors disabled:opacity-50"
                              title="Download PDF"
                            >
                              <DownloadIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {meta && (
            <div className="mt-6">
              <Pagination
                meta={meta}
                onPageChange={setPage}
              />
            </div>
          )}
        </ComponentCard>
      </div>

      {selectedInvoice && (
        <InvoiceModal
          isOpen={isInvoiceModalOpen}
          closeModal={closeInvoiceModal}
          invoice={selectedInvoice}
        />
      )}

      {selectedInvoice && selectedInvoice.order && (
        <EditInvoiceModal
          isOpen={isEditModalOpen}
          onClose={closeEditModal}
          invoice={selectedInvoice}
          orderId={selectedInvoice.order.id}
        />
      )}

      <InvoiceExportModal
        isOpen={isExportModalOpen}
        onClose={closeExportModal}
        onExport={handleExport}
        stores={stores}
        locations={locations}
        deliveryBoys={deliveryBoys}
        isExporting={isExporting}
      />
    </>
  );
}
