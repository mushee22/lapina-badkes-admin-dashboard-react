import { OutletUsersView } from "./components/OutletUsersView";
import { useOutletUsersPage } from "./hooks/useOutletUsersPage";

export default function OutletUsers() {
  const props = useOutletUsersPage();
  return <OutletUsersView {...props} />;
}
