import { RolesView } from "./components/RolesView";
import { useRolesPage } from "./hooks/useRolesPage";

export default function Roles() {
    const props = useRolesPage();
    return <RolesView {...props} />;
}
