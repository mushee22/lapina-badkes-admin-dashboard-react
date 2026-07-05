import { useState, useEffect } from "react";
import { Modal } from "../../../components/ui/modal";
import Button from "../../../components/ui/button/Button";
import Select from "../../../components/form/Select";
import Autocomplete from "../../../components/form/Autocomplete";
import DatePicker from "../../../components/form/date-picker";
import Label from "../../../components/form/Label";
import { useLocationsQuery } from "../../../hooks/queries/locations";
import { useStoresPaginatedQuery } from "../../../hooks/queries/stores";
import { useDebouncedValue } from "../../../hooks/useDebouncedValue";
import type { AdminUser } from "../../../types/userManagement";

interface InvoiceExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (params: {
    store_id?: number;
    location_id?: number;
    start_date?: string;
    end_date?: string;
    delivery_boy_id?: number;
  }) => void;
  deliveryBoys: AdminUser[];
  isExporting: boolean;
}

export default function InvoiceExportModal({
  isOpen,
  onClose,
  onExport,
  deliveryBoys,
  isExporting,
}: InvoiceExportModalProps) {
  const [storeId, setStoreId] = useState<number | undefined>();
  const [locationId, setLocationId] = useState<number | undefined>();
  const [startDate, setStartDate] = useState<string | undefined>();
  const [endDate, setEndDate] = useState<string | undefined>();
  const [deliveryBoyId, setDeliveryBoyId] = useState<number | undefined>();

  const [locationSearch, setLocationSearch] = useState("");
  const debouncedLocationSearch = useDebouncedValue(locationSearch, 400);
  const { data: locations = [] } = useLocationsQuery({ search: debouncedLocationSearch, per_page: 100 });

  const [storeSearch, setStoreSearch] = useState("");
  const debouncedStoreSearch = useDebouncedValue(storeSearch, 400);
  const { data: storesRes } = useStoresPaginatedQuery({ search: debouncedStoreSearch, per_page: 100 });
  const stores = storesRes?.data ?? [];

  useEffect(() => {
    if (!isOpen) {
      setLocationSearch("");
      setStoreSearch("");
    }
  }, [isOpen]);

  const handleExport = () => {
    onExport({
      store_id: storeId,
      location_id: locationId,
      start_date: startDate,
      end_date: endDate,
      delivery_boy_id: deliveryBoyId,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="p-6">
        <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
          Export Invoices
        </h3>
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
          Filter the invoices you want to export to Excel.
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <Label>Location (Route)</Label>
            <Autocomplete
              options={[
                { value: "", label: "All Locations" },
                ...locations.map((loc) => ({ value: String(loc.id), label: loc.name })),
              ]}
              placeholder="Select Location"
              value={locationId ? String(locationId) : ""}
              onChange={(value) => setLocationId(value ? Number(value) : undefined)}
              onSearchChange={setLocationSearch}
            />
          </div>

          <div className="space-y-1">
            <Label>Outlet (Store)</Label>
            <Autocomplete
              options={[
                { value: "", label: "All Outlets" },
                ...stores.map((store) => ({ value: String(store.id), label: store.name })),
              ]}
              placeholder="Select Outlet"
              value={storeId ? String(storeId) : ""}
              onChange={(value) => setStoreId(value ? Number(value) : undefined)}
              onSearchChange={setStoreSearch}
            />
          </div>

          <div className="space-y-1">
            <Label>Delivery Boy</Label>
            <Select
              options={[
                { value: "", label: "All Delivery Boys" },
                ...deliveryBoys.map((db) => ({ value: String(db.id), label: db.name })),
              ]}
              placeholder="Select Delivery Boy"
              value={deliveryBoyId ? String(deliveryBoyId) : ""}
              onChange={(value) => setDeliveryBoyId(value ? Number(value) : undefined)}
            />
          </div>

          <div className="hidden sm:block"></div>

          <div>
            <DatePicker
              id="export-date-from"
              label="Date From"
              placeholder="Select Date From"
              defaultDate={startDate}
              onChange={(_dates, dateStr) => setStartDate(dateStr || undefined)}
            />
          </div>

          <div>
            <DatePicker
              id="export-date-to"
              label="Date To"
              placeholder="Select Date To"
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
