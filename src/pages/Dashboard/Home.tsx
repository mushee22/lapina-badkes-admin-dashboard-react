import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import Autocomplete from "../../components/form/Autocomplete";
import DatePicker from "../../components/form/date-picker";
import Badge from "../../components/ui/badge/Badge";
import { useOverviewQuery } from "../../hooks/queries/overview";
import { useLocationsQuery } from "../../hooks/queries/locations";
import {
  BoxIconLine,
  GroupIcon,
  DollarLineIcon,
  BoxIcon,
} from "../../icons";

export default function Home() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Initialize filters from URL params
  const [locationId, setLocationId] = useState<number | undefined>(
    searchParams.get("location_id") ? Number(searchParams.get("location_id")) : undefined
  );
  const [dateFrom, setDateFrom] = useState<string | undefined>(searchParams.get("date_from") || undefined);
  const [dateTo, setDateTo] = useState<string | undefined>(searchParams.get("date_to") || undefined);
  
  // Fetch locations for filter
  const { data: locations = [] } = useLocationsQuery();
  
  // Fetch overview data
  const { data: overview, isLoading } = useOverviewQuery({
    location_id: locationId,
    date_from: dateFrom,
    date_to: dateTo,
  });
  
  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (locationId) params.set("location_id", String(locationId));
    if (dateFrom) params.set("date_from", dateFrom);
    if (dateTo) params.set("date_to", dateTo);
    
    setSearchParams(params, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationId, dateFrom, dateTo]);

  return (
    <>
      <PageMeta
        title="React.js Ecommerce Dashboard | Lapina Bakes Admin - React.js Admin Dashboard Template"
        description="This is React.js Ecommerce Dashboard page for Lapina Bakes Admin - React.js Tailwind CSS Admin Dashboard Template"
      />
      
      {/* Filters */}
      <ComponentCard title="Dashboard Filters" className="mb-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Autocomplete
              options={[
                { value: "", label: "All Locations" },
                ...locations.map((location) => ({ value: String(location.id), label: location.name }))
              ]}
              placeholder="Filter by Location"
              value={locationId ? String(locationId) : ""}
              onChange={(value) => setLocationId(value ? Number(value) : undefined)}
            />
          </div>
          <div>
            <DatePicker
              key={`date_from_${dateFrom || 'empty'}`}
              id="date_from"
              placeholder="Date From"
              defaultDate={dateFrom || undefined}
              onChange={(_dates, currentDateString) => {
                setDateFrom(currentDateString || undefined);
              }}
            />
          </div>
          <div>
            <DatePicker
              key={`date_to_${dateTo || 'empty'}`}
              id="date_to"
              placeholder="Date To"
              defaultDate={dateTo || undefined}
              onChange={(_dates, currentDateString) => {
                setDateTo(currentDateString || undefined);
              }}
            />
          </div>
          <div>
            {(locationId || dateFrom || dateTo) && (
              <button
                onClick={() => {
                  setLocationId(undefined);
                  setDateFrom(undefined);
                  setDateTo(undefined);
                }}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </ComponentCard>

      {isLoading ? (
        <div className="text-center py-8 text-gray-500">Loading dashboard data...</div>
      ) : overview ? (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${overview?.users ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}>
            <ComponentCard title="Total Orders" className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-3xl font-bold text-gray-800 dark:text-white/90">
                    {overview?.orders?.total || 0}
                  </p>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Order Placed: {overview?.orders?.order_placed || 0} | Delivered: {overview?.orders?.delivered || 0}
                  </p>
                  <button
                    onClick={() => {
                      const params = new URLSearchParams();
                      if (locationId) params.set("location_id", String(locationId));
                      if (dateFrom) params.set("date_from", dateFrom);
                      if (dateTo) params.set("date_to", dateTo);
                      const query = params.toString();
                      navigate(`/orders/all${query ? `?${query}` : ""}`);
                    }}
                    className="mt-3 text-sm font-medium text-primary hover:text-primary/80 dark:text-primary-400 dark:hover:text-primary-300"
                  >
                    View Orders →
                  </button>
                </div>
                <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-xl">
                  <BoxIconLine className="text-primary size-6" />
                </div>
              </div>
            </ComponentCard>

            <ComponentCard title="Total Revenue" className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-gray-800 dark:text-white/90">
                    ₹{(overview?.revenue?.total_amount || 0).toFixed(2)}
                  </p>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Delivered: ₹{(overview?.revenue?.completed_amount || 0).toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center justify-center w-12 h-12 bg-success/10 rounded-xl">
                  <DollarLineIcon className="text-success size-6" />
                </div>
              </div>
            </ComponentCard>

            {overview?.users && (
              <ComponentCard title="Total Users" className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-gray-800 dark:text-white/90">
                      {overview.users.total_users || 0}
                    </p>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Active: {overview.users.active_users || 0}
                    </p>
                  </div>
                  <div className="flex items-center justify-center w-12 h-12 bg-info/10 rounded-xl">
                    <GroupIcon className="text-info size-6" />
                  </div>
                </div>
              </ComponentCard>
            )}

            <ComponentCard title="Total Stores" className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-gray-800 dark:text-white/90">
                    {overview?.stores?.total_stores || 0}
                  </p>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Active: {overview?.stores?.active_stores || 0}
                  </p>
                </div>
                <div className="flex items-center justify-center w-12 h-12 bg-warning/10 rounded-xl">
                  <BoxIcon className="text-warning size-6" />
                </div>
              </div>
            </ComponentCard>
        </div>

          {/* Orders Breakdown */}
          <ComponentCard title="Orders Breakdown">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              <div
                className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors"
                onClick={() => {
                  const params = new URLSearchParams();
                  params.set("status", "order_placed");
                  if (locationId) params.set("location_id", String(locationId));
                  if (dateFrom) params.set("date_from", dateFrom);
                  if (dateTo) params.set("date_to", dateTo);
                  navigate(`/orders/all?${params.toString()}`);
                }}
              >
                <p className="text-sm text-gray-500 dark:text-gray-400">Order Placed</p>
                <p className="mt-1 text-2xl font-bold text-gray-800 dark:text-white/90">
                  {overview?.orders?.order_placed || 0}
                </p>
              </div>
              <div
                className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors"
                onClick={() => {
                  const params = new URLSearchParams();
                  params.set("status", "ready_to_dispatch");
                  if (locationId) params.set("location_id", String(locationId));
                  if (dateFrom) params.set("date_from", dateFrom);
                  if (dateTo) params.set("date_to", dateTo);
                  navigate(`/orders/all?${params.toString()}`);
                }}
              >
                <p className="text-sm text-gray-500 dark:text-gray-400">Ready to Dispatch</p>
                <p className="mt-1 text-2xl font-bold text-gray-800 dark:text-white/90">
                  {overview?.orders?.ready_to_dispatch || 0}
                </p>
              </div>
              <div
                className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors"
                onClick={() => {
                  const params = new URLSearchParams();
                  params.set("status", "delivered");
                  if (locationId) params.set("location_id", String(locationId));
                  if (dateFrom) params.set("date_from", dateFrom);
                  if (dateTo) params.set("date_to", dateTo);
                  navigate(`/orders/all?${params.toString()}`);
                }}
              >
                <p className="text-sm text-gray-500 dark:text-gray-400">Delivered</p>
                <p className="mt-1 text-2xl font-bold text-gray-800 dark:text-white/90">
                  {overview?.orders?.delivered || 0}
                </p>
              </div>
              <div
                className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors"
                onClick={() => {
                  const params = new URLSearchParams();
                  params.set("status", "cancelled");
                  if (locationId) params.set("location_id", String(locationId));
                  if (dateFrom) params.set("date_from", dateFrom);
                  if (dateTo) params.set("date_to", dateTo);
                  navigate(`/orders/all?${params.toString()}`);
                }}
              >
                <p className="text-sm text-gray-500 dark:text-gray-400">Cancelled</p>
                <p className="mt-1 text-2xl font-bold text-gray-800 dark:text-white/90">
                  {overview?.orders?.cancelled || 0}
                </p>
              </div>
              <div
                className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors"
                onClick={() => {
                  const params = new URLSearchParams();
                  params.set("status", "out_for_delivery");
                  if (locationId) params.set("location_id", String(locationId));
                  if (dateFrom) params.set("date_from", dateFrom);
                  if (dateTo) params.set("date_to", dateTo);
                  navigate(`/orders/all?${params.toString()}`);
                }}
              >
                <p className="text-sm text-gray-500 dark:text-gray-400">Out of Delivery</p>
                <p className="mt-1 text-2xl font-bold text-gray-800 dark:text-white/90">
                  {overview?.orders?.out_of_delivery || 0}
                </p>
              </div>
            </div>
          </ComponentCard>

          {/* Revenue Breakdown */}
          <ComponentCard title="Revenue Breakdown">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Amount</p>
                <p className="mt-1 text-2xl font-bold text-gray-800 dark:text-white/90">
                  ₹{(overview?.revenue?.total_amount || 0).toFixed(2)}
                </p>
              </div>
              <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">Delivered Amount</p>
                <p className="mt-1 text-2xl font-bold text-success">
                  ₹{(overview?.revenue?.completed_amount || 0).toFixed(2)}
                </p>
              </div>
              <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">Order Placed Amount</p>
                <p className="mt-1 text-2xl font-bold text-warning">
                  ₹{(overview?.revenue?.order_placed_amount || 0).toFixed(2)}
                </p>
              </div>
            </div>
          </ComponentCard>

          {/* Time Period Stats */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <ComponentCard title="Today" className="p-5">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Total Orders</span>
                  <span className="text-lg font-bold text-gray-800 dark:text-white/90">
                    {overview?.today?.total || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Amount</span>
                  <span className="text-lg font-bold text-gray-800 dark:text-white/90">
                    ₹{(overview?.today?.amount || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </ComponentCard>

            <ComponentCard title="This Week" className="p-5">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Total Orders</span>
                  <span className="text-lg font-bold text-gray-800 dark:text-white/90">
                    {overview?.this_week?.total || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Amount</span>
                  <span className="text-lg font-bold text-gray-800 dark:text-white/90">
                    ₹{(overview?.this_week?.amount || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </ComponentCard>

            <ComponentCard title="This Month" className="p-5">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Total Orders</span>
                  <span className="text-lg font-bold text-gray-800 dark:text-white/90">
                    {overview?.this_month?.total || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Amount</span>
                  <span className="text-lg font-bold text-gray-800 dark:text-white/90">
                    ₹{(overview?.this_month?.amount || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </ComponentCard>
        </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {overview?.users && (
              <ComponentCard title="Users" className="p-5">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Customers</span>
                    <span className="font-semibold text-gray-800 dark:text-white/90">
                      {overview.users.customers || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Store Owners</span>
                    <span className="font-semibold text-gray-800 dark:text-white/90">
                      {overview.users.store_owners || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Delivery Boys</span>
                    <span className="font-semibold text-gray-800 dark:text-white/90">
                      {overview.users.delivery_boys || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Admins</span>
                    <span className="font-semibold text-gray-800 dark:text-white/90">
                      {overview.users.admins || 0}
                    </span>
                  </div>
                </div>
              </ComponentCard>
            )}

            <ComponentCard title="Stores" className="p-5">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Total</span>
                  <span className="font-semibold text-gray-800 dark:text-white/90">
                    {overview?.stores?.total_stores || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Active</span>
                  <span className="font-semibold text-success">
                    {overview?.stores?.active_stores || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Inactive</span>
                  <span className="font-semibold text-error">
                    {overview?.stores?.inactive_stores || 0}
                  </span>
                </div>
              </div>
            </ComponentCard>

            <ComponentCard title="Locations" className="p-5">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Total</span>
                  <span className="font-semibold text-gray-800 dark:text-white/90">
                    {overview?.locations?.total_locations || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Active</span>
                  <span className="font-semibold text-success">
                    {overview?.locations?.active_locations || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Inactive</span>
                  <span className="font-semibold text-error">
                    {overview?.locations?.inactive_locations || 0}
                  </span>
                </div>
              </div>
            </ComponentCard>

            {overview?.products && (
              <ComponentCard title="Products" className="p-5">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Total</span>
                    <span className="font-semibold text-gray-800 dark:text-white/90">
                      {overview.products.total_products || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Available</span>
                    <span className="font-semibold text-success">
                      {overview.products.available_products || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Low Stock</span>
                    <span className="font-semibold text-warning">
                      {overview.products.low_stock_products || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Out of Stock</span>
                    <span className="font-semibold text-error">
                      {overview.products.out_of_stock_products || 0}
                    </span>
                  </div>
                </div>
              </ComponentCard>
            )}
        </div>

          {/* Delivery Boys Stats */}
          <ComponentCard title="Delivery Boys" className="p-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
                <p className="mt-1 text-2xl font-bold text-gray-800 dark:text-white/90">
                  {overview?.delivery_boys?.total_delivery_boys || 0}
                </p>
              </div>
              <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">Active</p>
                <p className="mt-1 text-2xl font-bold text-success">
                  {overview?.delivery_boys?.active_delivery_boys || 0}
                </p>
              </div>
              <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">Assigned Orders</p>
                <p className="mt-1 text-2xl font-bold text-gray-800 dark:text-white/90">
                  {overview?.delivery_boys?.assigned_orders || 0}
                </p>
              </div>
              <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">Unassigned Orders</p>
                <p className="mt-1 text-2xl font-bold text-warning">
                  {overview?.delivery_boys?.unassigned_orders || 0}
                </p>
              </div>
            </div>
          </ComponentCard>

          {/* Top Stores */}
          {overview?.top_stores && overview.top_stores.length > 0 && (
            <ComponentCard title="Top Stores">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {overview.top_stores.map((store) => (
                  <div
                    key={store.id}
                    className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.03]"
                    onClick={() => navigate(`/stores/${store.id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-white/90">
                          {store.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {store.orders_count} orders
                        </p>
                      </div>
                      <Badge color={store.orders_count > 0 ? "success" : "light"} size="sm">
                        {store.orders_count}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </ComponentCard>
          )}

          {/* Top Locations */}
          {overview?.top_locations && overview.top_locations.length > 0 && (
            <ComponentCard title="Top Locations">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {overview.top_locations.map((location) => (
                  <div
                    key={location.id}
                    className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.03]"
                    onClick={() => navigate(`/orders/all?location_id=${location.id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-white/90">
                          {location.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {location.code} • {location.orders_count} orders
                        </p>
                      </div>
                      <Badge color={location.orders_count > 0 ? "success" : "light"} size="sm">
                        {location.orders_count}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </ComponentCard>
          )}

          {/* Top Delivery Boys */}
          {overview?.top_delivery_boys && overview.top_delivery_boys.length > 0 && (
            <ComponentCard title="Top Delivery Boys">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {overview.top_delivery_boys.map((deliveryBoy) => (
                  <div
                    key={deliveryBoy.id}
                    className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.03]"
                    onClick={() => navigate(`/users/delivery-boys/${deliveryBoy.id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-white/90">
                          {deliveryBoy.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {deliveryBoy.email}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Delivered: {deliveryBoy.delivered_orders_count} orders
                        </p>
                      </div>
                      <Badge color={deliveryBoy.delivered_orders_count > 0 ? "success" : "light"} size="sm">
                        {deliveryBoy.delivered_orders_count}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </ComponentCard>
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">No data available</div>
      )}
    </>
  );
}
