import { StoresView } from "./components/StoresView";
import { useStoresPage } from "./hooks/useStoresPage";

export default function Stores() {
  const props = useStoresPage();
  return <StoresView {...props} />;
}