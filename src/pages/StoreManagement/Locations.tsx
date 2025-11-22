import { useLocationsPage } from "./hooks/useLocationsPage";
import { LocationsView } from "./components/LocationsView";

export default function Locations() {
  const props = useLocationsPage();
  return <LocationsView {...props} />;
}