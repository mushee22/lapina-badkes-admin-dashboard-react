import { useParams, useNavigate } from "react-router";
import { useDeliveryBoyQuery, useUpdateDeliveryBoyMutation, useAssignDeliveryBoyLocationsMutation } from "../../hooks/queries/deliveryBoys";
import { useLocationsQuery } from "../../hooks/queries/locations";
import { useOverviewQuery } from "../../hooks/queries/overview";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";
import { Modal } from "../../components/ui/modal";
import Label from "../../components/form/Label";
import InputField from "../../components/form/input/InputField";
import Switch from "../../components/form/switch/Switch";
import Checkbox from "../../components/form/input/Checkbox";
import Radio from "../../components/form/input/Radio";
import Autocomplete from "../../components/form/Autocomplete";
import DatePicker from "../../components/form/date-picker";
import { useModal } from "../../hooks/useModal";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { AdminUserCreateSchema } from "../../types/userManagement";
import type { AdminUserInput } from "../../types/userManagement";
import { ChevronLeftIcon, PencilIcon, BoxIcon, BoxIconLine, DollarLineIcon } from "../../icons";
import { useToast } from "../../context/ToastContext";
import { z } from "zod";
import type { AssignUserLocationsInput } from "../../services/adminUsers";
import Badge from "../../components/ui/badge/Badge";

const DeliveryBoyUpdateSchema = AdminUserCreateSchema.extend({
  password: z.union([
    z.string().min(6, "Password must be at least 6 characters"),
    z.string().length(0),
  ]),
});

type DeliveryBoyUpdateInput = z.input<typeof DeliveryBoyUpdateSchema>;

export default function DeliveryBoyDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { data: deliveryBoy, isLoading } = useDeliveryBoyQuery(id ? Number(id) : null);
  const { data: locations = [] } = useLocationsQuery();
  
  // Filter state for overview
  const [locationId, setLocationId] = useState<number | undefined>(undefined);
  const [startDate, setStartDate] = useState<string | undefined>(undefined);
  const [endDate, setEndDate] = useState<string | undefined>(undefined);
  
  // Get assigned locations for this delivery boy
  const assignedLocations = deliveryBoy?.locations || [];
  
  // Fetch overview data for this delivery boy
  const { data: overview, isLoading: isLoadingOverview } = useOverviewQuery({
    delivery_boy_id: id ? Number(id) : undefined,
    location_id: locationId,
    date_from: startDate,
    date_to: endDate,
  });
  
  const { isOpen: isEditOpen, openModal: openEditModal, closeModal: closeEditModal } = useModal();
  const { isOpen: isLocationModalOpen, openModal: openLocationModal, closeModal: closeLocationModal } = useModal();

  const updateMutation = useUpdateDeliveryBoyMutation();
  const assignLocationsMutation = useAssignDeliveryBoyLocationsMutation();

  // Location assignment state
  const [selectedLocationIds, setSelectedLocationIds] = useState<number[]>([]);
  const [primaryLocationId, setPrimaryLocationId] = useState<number | undefined>(undefined);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DeliveryBoyUpdateInput>({
    resolver: zodResolver(DeliveryBoyUpdateSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      password: "",
      active: true,
    },
  });

  useEffect(() => {
    if (deliveryBoy && isEditOpen) {
      reset({
        name: deliveryBoy.name,
        email: deliveryBoy.email,
        phone: deliveryBoy.phone || "",
        address: deliveryBoy.address || "",
        password: "",
        active: deliveryBoy.is_active === 1,
      });
    }
  }, [deliveryBoy, isEditOpen, reset]);

  useEffect(() => {
    if (isLocationModalOpen && deliveryBoy) {
      // Initialize with existing locations
      const existingLocationIds = deliveryBoy.locations?.map((loc) => loc.id) || [];
      const existingPrimaryId = deliveryBoy.primary_location?.id;
      setSelectedLocationIds(existingLocationIds);
      setPrimaryLocationId(existingPrimaryId);
    }
  }, [isLocationModalOpen, deliveryBoy]);

  const onUpdateSubmit = handleSubmit((values: DeliveryBoyUpdateInput) => {
    if (!id || !deliveryBoy) return;

    const payload: Partial<AdminUserInput> = {
      name: values.name,
      email: values.email,
      phone: values.phone,
      address: values.address,
      roles: deliveryBoy.roles,
    };
    if (values.password && values.password !== "") {
      payload.password = values.password;
    }
    if (values.active !== undefined) {
      payload.active = values.active;
    }

    updateMutation.mutate(
      { id: Number(id), data: payload },
      {
        onSuccess: () => {
          closeEditModal();
        },
      }
    );
  });

  const handleLocationToggle = (locationId: number) => {
    setSelectedLocationIds((prev) => {
      if (prev.includes(locationId)) {
        const newIds = prev.filter((id) => id !== locationId);
        if (primaryLocationId === locationId) {
          setPrimaryLocationId(undefined);
        }
        return newIds;
      } else {
        return [...prev, locationId];
      }
    });
  };

  const handlePrimaryLocationChange = (locationId: string) => {
    const id = Number(locationId);
    setPrimaryLocationId(id);
    if (!selectedLocationIds.includes(id)) {
      setSelectedLocationIds((prev) => [...prev, id]);
    }
  };

  const handleAssignLocations = () => {
    if (!id) return;
    
    if (selectedLocationIds.length === 0) {
      showToast("error", "Please select at least one location", "Validation Error");
      return;
    }

    const input: AssignUserLocationsInput = {
      location_ids: selectedLocationIds,
      primary_location_id: primaryLocationId,
    };

    assignLocationsMutation.mutate(
      { id: Number(id), input },
      {
        onSuccess: () => {
          closeLocationModal();
        },
      }
    );
  };

  if (isLoading) {
    return (
      <>
        <PageMeta title="Delivery Boy Details | Lapina Bakes Admin" description="Delivery boy details" />
        <PageBreadcrumb pageTitle="Delivery Boy Details" />
        <div className="space-y-6">
          <ComponentCard title="">
            <div className="px-5 py-4 text-center text-gray-500">Loading delivery boy details...</div>
          </ComponentCard>
        </div>
      </>
    );
  }

  if (!deliveryBoy) {
    return (
      <>
        <PageMeta title="Delivery Boy Details | Lapina Bakes Admin" description="Delivery boy details" />
        <PageBreadcrumb pageTitle="Delivery Boy Details" />
        <div className="space-y-6">
          <ComponentCard title="">
            <div className="px-5 py-4 text-center text-gray-500">Delivery boy not found</div>
            <div className="mt-4 flex justify-center">
              <Button variant="outline" size="sm" onClick={() => navigate("/users/delivery-boys")}>
                Back to Delivery Boys
              </Button>
            </div>
          </ComponentCard>
        </div>
      </>
    );
  }

  return (
    <>
      <PageMeta title={`${deliveryBoy.name} | Lapina Bakes Admin`} description="Delivery boy details" />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/50 dark:from-gray-900 dark:via-slate-900/80 dark:to-blue-900/30 -mx-6 -my-6 px-6 py-6">
        <PageBreadcrumb pageTitle="Delivery Boy Details" />
        <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={() => navigate("/users/delivery-boys")} startIcon={<ChevronLeftIcon className="w-4 h-4" />}>
            Back to Delivery Boys
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={openLocationModal} startIcon={<BoxIcon className="w-4 h-4" />}>
              Assign Locations
            </Button>
            <Button variant="primary" size="sm" onClick={openEditModal} startIcon={<PencilIcon className="w-4 h-4" />}>
              Update
            </Button>
          </div>
        </div>

        <ComponentCard title="Delivery Boy Information">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <h3 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Basic Information</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Name:</span>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">{deliveryBoy.name}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Email:</span>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{deliveryBoy.email}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Phone:</span>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{deliveryBoy.phone || "—"}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Address:</span>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{deliveryBoy.address || "—"}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Status:</span>
                  <div className="mt-1">
                    <Badge color={deliveryBoy.is_active === 1 ? "success" : "error"}>
                      {deliveryBoy.is_active === 1 ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Primary Location</h3>
              {deliveryBoy.primary_location ? (
                <div className="space-y-3">
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Name:</span>
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">{deliveryBoy.primary_location.name}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Code:</span>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{deliveryBoy.primary_location.code}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Address:</span>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{deliveryBoy.primary_location.address}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">City:</span>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{deliveryBoy.primary_location.city}</p>
                  </div>
                  {deliveryBoy.primary_location.state && (
                    <div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">State:</span>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{deliveryBoy.primary_location.state}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">No primary location assigned</p>
              )}
            </div>
          </div>
        </ComponentCard>

        <ComponentCard title={`Assigned Locations (${deliveryBoy.locations_count || 0})`}>
          {deliveryBoy.locations && deliveryBoy.locations.length > 0 ? (
            <div className="overflow-hidden rounded-xl border-2 border-blue-100/60 bg-gradient-to-br from-white via-blue-50/20 to-indigo-50/30 dark:border-blue-800/40 dark:bg-gradient-to-br dark:from-gray-800/70 dark:via-blue-900/20 dark:to-indigo-900/30 shadow-lg">
              <div className="max-w-full overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b-2 border-blue-200/60 bg-gradient-to-r from-blue-100/40 via-indigo-100/50 to-purple-100/40 dark:border-blue-700/60 dark:bg-gradient-to-r dark:from-blue-900/30 dark:via-indigo-900/40 dark:to-purple-900/30">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Name</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Code</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Address</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wider">City</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Status</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Primary</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-100/60 dark:divide-blue-800/40">
                    {deliveryBoy.locations.map((location, index) => (
                      <tr key={location.id} className={`hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors duration-200 ${index % 2 === 0 ? 'bg-white/80 dark:bg-gray-800/40' : 'bg-blue-25/30 dark:bg-blue-950/20'}`}>
                        <td className="px-5 py-4 text-sm text-gray-800 dark:text-white/90">{location.name}</td>
                        <td className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">{location.code}</td>
                        <td className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">{location.address}</td>
                        <td className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">{location.city}</td>
                        <td className="px-5 py-4 text-sm">
                          <Badge color={location.is_active ? "success" : "error"}>
                            {location.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="px-5 py-4 text-sm">
                          {location.is_primary === 1 ? (
                            <Badge color="success">Primary</Badge>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">No locations assigned</p>
          )}
        </ComponentCard>

        {/* Delivery Boy Overview */}
        {isLoadingOverview ? (
          <ComponentCard title="Overview">
            <div className="px-5 py-4 text-center text-gray-500">Loading overview data...</div>
          </ComponentCard>
        ) : overview ? (
          <>
            {/* Overview Filters */}
            <ComponentCard title="Overview Filters" className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border-blue-200 dark:border-blue-800">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <Autocomplete
                    options={[
                      { value: "", label: "All Locations" },
                      ...assignedLocations.map((location) => ({ value: String(location.id), label: location.name }))
                    ]}
                    placeholder="Filter by Location"
                    value={locationId ? String(locationId) : ""}
                    onChange={(value) => setLocationId(value ? Number(value) : undefined)}
                  />
                </div>
                <div>
                  <DatePicker
                    key={`start_date_${startDate || 'empty'}`}
                    id="start_date"
                    placeholder="Start Date"
                    defaultDate={startDate || undefined}
                    onChange={(_dates, currentDateString) => {
                      setStartDate(currentDateString || undefined);
                    }}
                  />
                </div>
                <div>
                  <DatePicker
                    key={`end_date_${endDate || 'empty'}`}
                    id="end_date"
                    placeholder="End Date"
                    defaultDate={endDate || undefined}
                    onChange={(_dates, currentDateString) => {
                      setEndDate(currentDateString || undefined);
                    }}
                  />
                </div>
                <div>
                  {(locationId || startDate || endDate) && (
                    <button
                      onClick={() => {
                        setLocationId(undefined);
                        setStartDate(undefined);
                        setEndDate(undefined);
                      }}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>
            </ComponentCard>

            <ComponentCard title="Overview Statistics" className="bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50/80 dark:from-gray-900/50 dark:via-slate-900/50 dark:to-blue-900/20 border-gray-200/80 dark:border-gray-700/80">
              <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="p-4 rounded-xl border-2 border-blue-100/80 dark:border-blue-800/60 bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/50 dark:from-gray-800/50 dark:via-blue-900/20 dark:to-indigo-900/30 hover:shadow-lg transition-all duration-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Orders</p>
                    <BoxIconLine className="text-primary size-5" />
                  </div>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white/90">
                    {overview?.orders?.total || 0}
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Order Placed: {overview?.orders?.order_placed || 0} | Delivered: {overview?.orders?.delivered || 0}
                  </p>
                  <button
                    onClick={() => {
                      const params = new URLSearchParams();
                      params.set("delivery_boy_id", id || "");
                      if (locationId) params.set("location_id", String(locationId));
                      if (startDate) params.set("date_from", startDate);
                      if (endDate) params.set("date_to", endDate);
                      navigate(`/orders/all?${params.toString()}`);
                    }}
                    className="mt-2 text-sm font-medium text-primary hover:text-primary/80"
                  >
                    View Orders →
                  </button>
                </div>

                <div className="p-4 rounded-xl border-2 border-emerald-100/80 dark:border-emerald-800/60 bg-gradient-to-br from-white via-emerald-50/30 to-green-50/50 dark:from-gray-800/50 dark:via-emerald-900/20 dark:to-green-900/30 hover:shadow-lg transition-all duration-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</p>
                    <DollarLineIcon className="text-success size-5" />
                  </div>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white/90">
                    ₹{(overview?.revenue?.total_amount || 0).toFixed(2)}
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Delivered: ₹{(overview?.revenue?.completed_amount || 0).toFixed(2)}
                  </p>
                </div>

                <div className="p-4 rounded-xl border-2 border-amber-100/80 dark:border-amber-800/60 bg-gradient-to-br from-white via-amber-50/30 to-yellow-50/50 dark:from-gray-800/50 dark:via-amber-900/20 dark:to-yellow-900/30 hover:shadow-lg transition-all duration-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Assigned Orders</p>
                    <BoxIcon className="text-warning size-5" />
                  </div>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white/90">
                    {overview?.delivery_boys?.assigned_orders || 0}
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Unassigned: {overview?.delivery_boys?.unassigned_orders || 0}
                  </p>
                </div>
              </div>

              {/* Orders Breakdown */}
              <div>
                <h4 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">Orders Breakdown</h4>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                  <div className="p-3 rounded-lg border-2 border-warning-200 bg-gradient-to-br from-warning-50 to-warning-100/50 dark:from-warning-900/20 dark:to-warning-800/10 dark:border-warning-800">
                    <p className="text-xs font-medium text-warning-700 dark:text-warning-300">Order Placed</p>
                    <p className="mt-1 text-lg font-bold text-warning-800 dark:text-warning-200">
                      {overview?.orders?.order_placed || 0}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg border-2 border-info-200 bg-gradient-to-br from-info-50 to-info-100/50 dark:from-info-900/20 dark:to-info-800/10 dark:border-info-800">
                    <p className="text-xs font-medium text-info-700 dark:text-info-300">Ready to Dispatch</p>
                    <p className="mt-1 text-lg font-bold text-info-800 dark:text-info-200">
                      {overview?.orders?.ready_to_dispatch || 0}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 dark:border-blue-800">
                    <p className="text-xs font-medium text-blue-700 dark:text-blue-300">Out of Delivery</p>
                    <p className="mt-1 text-lg font-bold text-blue-800 dark:text-blue-200">
                      {overview?.orders?.out_of_delivery || 0}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg border-2 border-success-200 bg-gradient-to-br from-success-50 to-success-100/50 dark:from-success-900/20 dark:to-success-800/10 dark:border-success-800">
                    <p className="text-xs font-medium text-success-700 dark:text-success-300">Delivered</p>
                    <p className="mt-1 text-lg font-bold text-success-800 dark:text-success-200">
                      {overview?.orders?.delivered || 0}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg border-2 border-error-200 bg-gradient-to-br from-error-50 to-error-100/50 dark:from-error-900/20 dark:to-error-800/10 dark:border-error-800">
                    <p className="text-xs font-medium text-error-700 dark:text-error-300">Cancelled</p>
                    <p className="mt-1 text-lg font-bold text-error-800 dark:text-error-200">
                      {overview?.orders?.cancelled || 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* Time Period Stats */}
              <div>
                <h4 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">Time Period Statistics</h4>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="p-3 rounded-lg border-2 border-cyan-200 bg-gradient-to-br from-cyan-50 to-cyan-100/50 dark:from-cyan-900/20 dark:to-cyan-800/10 dark:border-cyan-800">
                    <p className="text-xs font-medium text-cyan-700 dark:text-cyan-300">Today</p>
                    <p className="mt-1 text-lg font-bold text-cyan-800 dark:text-cyan-200">
                      {overview?.today?.total || 0} orders
                    </p>
                    <p className="text-xs font-medium text-cyan-700 dark:text-cyan-300">
                      ₹{(overview?.today?.amount || 0).toFixed(2)}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-900/20 dark:to-indigo-800/10 dark:border-indigo-800">
                    <p className="text-xs font-medium text-indigo-700 dark:text-indigo-300">This Week</p>
                    <p className="mt-1 text-lg font-bold text-indigo-800 dark:text-indigo-200">
                      {overview?.this_week?.total || 0} orders
                    </p>
                    <p className="text-xs font-medium text-indigo-700 dark:text-indigo-300">
                      ₹{(overview?.this_week?.amount || 0).toFixed(2)}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg border-2 border-pink-200 bg-gradient-to-br from-pink-50 to-pink-100/50 dark:from-pink-900/20 dark:to-pink-800/10 dark:border-pink-800">
                    <p className="text-xs font-medium text-pink-700 dark:text-pink-300">This Month</p>
                    <p className="mt-1 text-lg font-bold text-pink-800 dark:text-pink-200">
                      {overview?.this_month?.total || 0} orders
                    </p>
                    <p className="text-xs font-medium text-pink-700 dark:text-pink-300">
                      ₹{(overview?.this_month?.amount || 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </ComponentCard>
          </>
        ) : null}
        </div>
      </div>

      {/* Edit Modal */}
      <Modal isOpen={isEditOpen} onClose={closeEditModal} className="w-full max-w-2xl mx-4 sm:mx-6">
        <div className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">Update Delivery Boy</h3>
          <form noValidate onSubmit={onUpdateSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <InputField
                      id="name"
                      name={field.name}
                      placeholder="Enter name"
                      value={field.value}
                      onChange={field.onChange}
                      error={!!errors.name}
                      hint={errors.name?.message as string}
                    />
                  )}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <InputField
                      id="email"
                      name={field.name}
                      type="email"
                      placeholder="Enter email"
                      value={field.value}
                      onChange={field.onChange}
                      error={!!errors.email}
                      hint={errors.email?.message as string}
                    />
                  )}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <InputField
                      id="phone"
                      name={field.name}
                      type="tel"
                      placeholder="Enter phone number"
                      value={field.value || ""}
                      onChange={field.onChange}
                      error={!!errors.phone}
                      hint={errors.phone?.message as string}
                    />
                  )}
                />
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Controller
                  name="address"
                  control={control}
                  render={({ field }) => (
                    <InputField
                      id="address"
                      name={field.name}
                      placeholder="Enter address"
                      value={field.value || ""}
                      onChange={field.onChange}
                      error={!!errors.address}
                      hint={errors.address?.message as string}
                    />
                  )}
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <InputField
                      id="password"
                      name={field.name}
                      type="password"
                      placeholder="Leave empty to keep current password"
                      value={field.value}
                      onChange={field.onChange}
                      error={!!errors.password}
                      hint={errors.password?.message as string}
                    />
                  )}
                />
              </div>
              <div>
                <Label htmlFor="active">Active</Label>
                <Controller
                  name="active"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      label=""
                      defaultChecked={field.value ?? true}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={closeEditModal} disabled={updateMutation.isPending}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Updating..." : "Update"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </Modal>

      {/* Location Assignment Modal */}
      <Modal isOpen={isLocationModalOpen} onClose={closeLocationModal} className="w-full max-w-2xl mx-4 sm:mx-6">
        <div className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
            Assign Locations to {deliveryBoy.name}
          </h3>
          
          {locations.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400">No locations available.</p>
          ) : (
            <div className="space-y-6">
              <div>
                <Label className="mb-3 block">Select Locations</Label>
                <div className="max-h-64 space-y-2 overflow-y-auto rounded-lg border border-gray-200 bg-white p-4 dark:border-white/[0.05] dark:bg-white/[0.03]">
                  {locations.map((location) => (
                    <div key={location.id} className="flex items-center justify-between py-2">
                      <Checkbox
                        id={`location-${location.id}`}
                        checked={selectedLocationIds.includes(location.id)}
                        onChange={() => handleLocationToggle(location.id)}
                        label={`${location.name} - ${location.address}`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {selectedLocationIds.length > 0 && (
                <div>
                  <Label className="mb-3 block">Primary Location (Optional)</Label>
                  <div className="space-y-2 rounded-lg border border-gray-200 bg-white p-4 dark:border-white/[0.05] dark:bg-white/[0.03]">
                    {selectedLocationIds.map((locationId) => {
                      const location = locations.find((l) => l.id === locationId);
                      if (!location) return null;
                      return (
                        <Radio
                          key={location.id}
                          id={`primary-${location.id}`}
                          name="primary_location"
                          value={String(location.id)}
                          checked={primaryLocationId === location.id}
                          onChange={handlePrimaryLocationChange}
                          label={`${location.name} - ${location.address}`}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeLocationModal}
                  disabled={assignLocationsMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleAssignLocations}
                  disabled={assignLocationsMutation.isPending || selectedLocationIds.length === 0}
                >
                  {assignLocationsMutation.isPending ? "Assigning..." : "Assign Locations"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}

