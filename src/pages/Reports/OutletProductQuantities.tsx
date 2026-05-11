import { useState, useEffect } from "react";
import { useRoutesQuery } from "../../services/routes";
import {
  getOrderProductQuantities,
  exportOrderProductQuantities,
  OrderProductQuantitiesResponse,
} from "../../services/reports";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import { DownloadIcon } from "../../icons";
import { useToast } from "../../context/ToastContext";

export default function OutletProductQuantities() {
  const [routeId, setRouteId] = useState<number | undefined>();
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [reportData, setReportData] = useState<OrderProductQuantitiesResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedRoutes, setExpandedRoutes] = useState<Set<number | string>>(new Set());
  const [expandedStores, setExpandedStores] = useState<Set<string>>(new Set());

  const { showToast } = useToast();
  const { data: routes = [], isLoading: routesLoading } = useRoutesQuery();

  // Fetch report data
  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getOrderProductQuantities({
        location_id: routeId,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      });
      setReportData(data);
      // Auto-expand first route and its first store on initial load
      if (data.by_route.length > 0) {
        const firstRouteId = data.by_route[0].route.id ?? "unassigned";
        setExpandedRoutes(new Set([firstRouteId]));
        if (data.by_route[0].stores.length > 0) {
          setExpandedStores(new Set([`${firstRouteId}-${data.by_route[0].stores[0].store.id}`]));
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch report");
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch on mount
  useEffect(() => {
    fetchReport();
  }, []);

  const handleGenerateReport = (e: React.FormEvent) => {
    e.preventDefault();
    fetchReport();
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await exportOrderProductQuantities({
        location_id: routeId,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `outlet-product-quantities-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showToast("success", "Report exported successfully", "Success");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to export report";
      showToast("error", message, "Error");
    } finally {
      setExporting(false);
    }
  };

  const handleReset = () => {
    setRouteId(undefined);
    setStartDate("");
    setEndDate("");
  };

  const toggleRoute = (routeId: number | string) => {
    setExpandedRoutes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(routeId)) {
        newSet.delete(routeId);
      } else {
        newSet.add(routeId);
      }
      return newSet;
    });
  };

  const toggleStore = (routeId: number | string, storeId: number) => {
    const key = `${routeId}-${storeId}`;
    setExpandedStores((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    if (!reportData) return;
    const allRoutes = new Set<number | string>();
    const allStores = new Set<string>();
    reportData.by_route.forEach((route) => {
      const routeKey = route.route.id ?? "unassigned";
      allRoutes.add(routeKey);
      route.stores.forEach((store) => {
        allStores.add(`${routeKey}-${store.store.id}`);
      });
    });
    setExpandedRoutes(allRoutes);
    setExpandedStores(allStores);
  };

  const collapseAll = () => {
    setExpandedRoutes(new Set());
    setExpandedStores(new Set());
  };

  return (
    <>
      <PageMeta
        title="Outlet Product Quantities Report | Lapina Bakes Admin"
        description="View daily product quantities by outlet"
      />
      <PageBreadcrumb pageTitle="Outlet Product Quantities" />

      <div className="space-y-6">
        {/* Filters Card */}
        <ComponentCard title="Report Filters">
          <form onSubmit={handleGenerateReport} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Route/Outlet Selection */}
              <div>
                <label htmlFor="route" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Outlet Route
                </label>
                <select
                  id="route"
                  value={routeId ?? ""}
                  onChange={(e) => setRouteId(e.target.value ? Number(e.target.value) : undefined)}
                  disabled={routesLoading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">All Routes</option>
                  {routes.map((route) => (
                    <option key={route.id} value={route.id}>
                      {route.name} ({route.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Start Date */}
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              {/* End Date */}
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Loading..." : "Generate Report"}
              </button>
              <button
                type="button"
                onClick={handleExport}
                disabled={exporting || loading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <DownloadIcon className="w-4 h-4" />
                {exporting ? "Exporting..." : "Export Excel"}
              </button>
              <button
                type="button"
                onClick={handleReset}
                disabled={loading}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Reset
              </button>
            </div>
          </form>
        </ComponentCard>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Report Results */}
        <ComponentCard title="Product Quantities Report">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Loading report data...</p>
            </div>
          ) : !reportData || reportData.by_route.length === 0 ? (
            <div className="text-center py-8">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No data available</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Try adjusting your filters or date range to see results.
              </p>
            </div>
          ) : (
            <>
              {/* Summary Stats */}
              <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4">
                  <p className="text-sm font-medium text-primary-600 dark:text-primary-400">Total Quantity</p>
                  <p className="mt-1 text-2xl font-semibold text-primary-900 dark:text-primary-100">
                    {reportData.summary.total_quantity.toLocaleString()}
                  </p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">Distinct Orders</p>
                  <p className="mt-1 text-2xl font-semibold text-green-900 dark:text-green-100">
                    {reportData.summary.distinct_orders.toLocaleString()}
                  </p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Distinct Products</p>
                  <p className="mt-1 text-2xl font-semibold text-blue-900 dark:text-blue-100">
                    {reportData.summary.distinct_products.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Expand/Collapse Controls */}
              <div className="mb-4 flex gap-2">
                <button
                  onClick={expandAll}
                  className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Expand All
                </button>
                <button
                  onClick={collapseAll}
                  className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Collapse All
                </button>
              </div>

              {/* Hierarchical Display: Route → Store → Products */}
              <div className="space-y-4">
                {reportData.by_route.map((routeData) => {
                  const routeKey = routeData.route.id ?? "unassigned";
                  const isRouteExpanded = expandedRoutes.has(routeKey);

                  return (
                    <div key={routeKey} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                      {/* Route Header */}
                      <button
                        onClick={() => toggleRoute(routeKey)}
                        className="w-full px-4 py-3 bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <svg
                            className={`w-5 h-5 text-primary-600 dark:text-primary-400 transition-transform ${isRouteExpanded ? "rotate-90" : ""
                              }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                          <div className="text-left">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                              {routeData.route.name}
                            </h3>
                            {routeData.route.code && (
                              <p className="text-sm text-gray-600 dark:text-gray-400">Code: {routeData.route.code}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {routeData.stores.length} store{routeData.stores.length !== 1 ? "s" : ""}
                          </span>
                          <span className="px-3 py-1 bg-primary-600 text-white rounded-full text-sm font-medium">
                            {routeData.total_quantity.toLocaleString()}
                          </span>
                        </div>
                      </button>

                      {/* Stores List */}
                      {isRouteExpanded && (
                        <div className="p-4 space-y-3 bg-white dark:bg-gray-900">
                          {routeData.stores.map((storeData) => {
                            const storeKey = `${routeKey}-${storeData.store.id}`;
                            const isStoreExpanded = expandedStores.has(storeKey);

                            return (
                              <div
                                key={storeData.store.id}
                                className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                              >
                                {/* Store Header */}
                                <button
                                  onClick={() => toggleStore(routeKey, storeData.store.id)}
                                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors flex items-center justify-between"
                                >
                                  <div className="flex items-center gap-2">
                                    <svg
                                      className={`w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform ${isStoreExpanded ? "rotate-90" : ""
                                        }`}
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                    <h4 className="font-medium text-gray-900 dark:text-gray-100">{storeData.store.name}</h4>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      {storeData.products.length} product{storeData.products.length !== 1 ? "s" : ""}
                                    </span>
                                    <span className="px-2.5 py-0.5 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-sm font-medium">
                                      {storeData.total_quantity.toLocaleString()}
                                    </span>
                                  </div>
                                </button>

                                {/* Products Table */}
                                {isStoreExpanded && (
                                  <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                      <thead className="bg-gray-50 dark:bg-gray-800">
                                        <tr>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                            Product
                                          </th>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                            SKU
                                          </th>
                                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                            Orders
                                          </th>
                                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                            Quantity
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                                        {storeData.products.map((product) => (
                                          <tr key={product.product_id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                            <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">
                                              {product.name}
                                            </td>
                                            <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                                              {product.sku || "-"}
                                            </td>
                                            <td className="px-4 py-2 text-sm text-right text-gray-700 dark:text-gray-300">
                                              {product.orders_count}
                                            </td>
                                            <td className="px-4 py-2 text-right">
                                              <span className="inline-flex items-center px-2 py-0.5 rounded text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                {product.quantity.toLocaleString()}
                                              </span>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </ComponentCard>
      </div>
    </>
  );
}
