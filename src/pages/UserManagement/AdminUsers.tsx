import { AdminUsersView } from "./components/AdminUsersView";
import { useAdminUsersPage } from "./hooks/useAdminUsersPage";

export default function AdminUsers() {
  const props = useAdminUsersPage();
  return <AdminUsersView {...props} />;
}