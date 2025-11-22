import { useProductsPage } from "./hooks/useProductsPage";
import { ProductsView } from "./components/ProductsView";

export default function Products() {
  const pageData = useProductsPage();
  return <ProductsView {...pageData} />;
}
