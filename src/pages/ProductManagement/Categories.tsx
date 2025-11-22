import { CategoriesView } from "./components/CategoriesView";
import { useCategoriesPage } from "./hooks/useCategoriesPage";

export default function Categories() {
  const props = useCategoriesPage();
  return <CategoriesView {...props} />;
}