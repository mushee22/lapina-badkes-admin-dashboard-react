import { useState } from "react";
import { Modal } from "../../../components/ui/modal";
import Button from "../../../components/ui/button/Button";
import Select from "../../../components/form/Select";
import DatePicker from "../../../components/form/date-picker";
import Label from "../../../components/form/Label";
import type { Store } from "../../../types/store";
import type { Location } from "../../../types/location";

interface ProductQuantityExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (params: {
    store_id?: number;
    location_id?: number;
    start_date?: string;
    end_date?: string;
  }) => void;
  stores: Store[];
  locations: Location[];
  isExporting: boolean;
  initialFilters?: {
    storeId?: number;
    locationId?: number;
    dateFrom?: string;
    dateTo?: string;
  };
}

export default function ProductQuantityExportModal({
  isOpen,
  onClose,
  onExport,
  stores,
  locations,
  isExporting,
  initialFilters,
}: ProductQuantityExportModalProps) {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const today = new Date();

  const [storeId, setStoreId] = useState<number | undefined>(initialFilters?.storeId);
  const [routeId, setRouteId] = useState<number | undefined>(initialFilters?.locationId);
  const [startDate, setStartDate] = useState<string | undefined>(
    initialFilters?.dateFrom || yesterday.toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState<string | undefined>(
    initialFilters?.dateTo || today.toISOString().split("T")[0]
  );

  const handleExport = () => {
    onExport({
      store_id: storeId,
      location_id: routeId,
      start_date: startDate,
      end_date: endDate,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="p-6">
        <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
          Export Product Quantities For Production
        </h3>
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
          Filter the data you want to export to Excel.
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <Label>Location (Route)</Label>
            <Select
              options={[
                { value: "", label: "All Locations" },
                ...locations.map((loc) => ({ value: String(loc.id), label: loc.name })),
              ]}
              placeholder="Select Location"
              value={routeId ? String(routeId) : ""}
              onChange={(value) => setRouteId(value ? Number(value) : undefined)}
            />
          </div>

          <div className="space-y-1">
            <Label>Outlet (Store)</Label>
            <Select
              options={[
                { value: "", label: "All Outlets" },
                ...stores.map((store) => ({ value: String(store.id), label: store.name })),
              ]}
              placeholder="Select Outlet"
              value={storeId ? String(storeId) : ""}
              onChange={(value) => setStoreId(value ? Number(value) : undefined)}
            />
          </div>

          <div>
            <DatePicker
              id="export-date-from"
              label="Start Date"
              placeholder="Select Start Date"
              defaultDate={startDate}
              onChange={(_dates, dateStr) => setStartDate(dateStr || undefined)}
            />
          </div>

          <div>
            <DatePicker
              id="export-date-to"
              label="End Date"
              placeholder="Select End Date"
              defaultDate={endDate}
              onChange={(_dates, dateStr) => setEndDate(dateStr || undefined)}
            />
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={isExporting}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? "Exporting..." : "Export Excel"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
