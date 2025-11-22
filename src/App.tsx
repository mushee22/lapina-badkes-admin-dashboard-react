import { BrowserRouter as Router, Routes, Route } from "react-router";
import { AuthProvider } from "./context/AuthContext.tsx";
import { ToastProvider } from "./context/ToastContext";
import AuthGate from "./components/common/AuthGate";
import SignIn from "./pages/AuthPages/SignIn";
import NotFound from "./pages/OtherPage/NotFound";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import AdminUsers from "./pages/UserManagement/AdminUsers";
import DeliveryBoys from "./pages/UserManagement/DeliveryBoys";
import AllOrders from "./pages/OrderManagement/AllOrders";
import PendingOrders from "./pages/OrderManagement/PendingOrders";
import Locations from "./pages/StoreManagement/Locations";
import Stores from "./pages/StoreManagement/Stores";
import Settings from "./pages/Settings";
import Transactions from "./pages/Transactions";
import OrdersInvoice from "./pages/Reports/OrdersInvoice";
import UserReport from "./pages/Reports/UserReport";
import StoreWiseReport from "./pages/Reports/StoreWiseReport";
import ProtectedRoute from "./components/common/ProtectedRoute";
import Categories from "./pages/ProductManagement/Categories.tsx";
import Products from "./pages/ProductManagement/Products.tsx";
import ProductCreate from "./pages/ProductManagement/ProductCreate.tsx";
import ProductDetails from "./pages/ProductManagement/ProductDetails.tsx";
import ProductEdit from "./pages/ProductManagement/ProductEdit.tsx";
import StoreDetails from "./pages/StoreManagement/StoreDetails.tsx";
import StoreCreate from "./pages/StoreManagement/StoreCreate.tsx";
import StoreEdit from "./pages/StoreManagement/StoreEdit.tsx";
import OrderDetails from "./pages/OrderManagement/OrderDetails.tsx";
import ManualOrderCreate from "./pages/OrderManagement/ManualOrderCreate.tsx";
import DeliveryBoyDetails from "./pages/UserManagement/DeliveryBoyDetails.tsx";
import Overview from "./pages/Dashboard/Overview.tsx";

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AuthGate>
          <Router>
            <ScrollToTop />
            <Routes>
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}> 
              <Route index path="/" element={<Home />} />
              <Route path="/users/admin" element={<AdminUsers />} />
              <Route path="/users/delivery-boys/:id" element={<DeliveryBoyDetails />} />
              <Route path="/users/delivery-boys" element={<DeliveryBoys />} />
              <Route path="/orders/manual-create" element={<ManualOrderCreate />} />
              <Route path="/orders/:id" element={<OrderDetails />} />
              <Route path="/orders/all" element={<AllOrders />} />
              <Route path="/orders/pending" element={<PendingOrders />} />
              <Route path="/products/categories" element={<Categories />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/new" element={<ProductCreate />} />
              <Route path="/products/:id" element={<ProductDetails />} />
              <Route path="/products/:id/edit" element={<ProductEdit />} />
              <Route path="/stores/locations" element={<Locations />} />
              <Route path="/stores/new" element={<StoreCreate />} />
              <Route path="/stores/:id/edit" element={<StoreEdit />} />
              <Route path="/stores/:id" element={<StoreDetails />} />
              <Route path="/stores" element={<Stores />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/reports/invoices" element={<OrdersInvoice />} />
              <Route path="/reports/users" element={<UserReport />} />
              <Route path="/reports/stores" element={<StoreWiseReport />} />
              <Route path="/overview/store/:storeId" element={<Overview />} />
              <Route path="/overview/delivery-boy/:deliveryBoyId" element={<Overview />} />
            </Route>
          </Route>
          <Route path="/signin" element={<SignIn />} />
          <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </AuthGate>
      </ToastProvider>
    </AuthProvider>
  );
}
