import { Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ForgotPassword from "../pages/ForgotPassword";
import OtpVerification from "../pages/OtpVerification";
import CreateNewPass from "../pages/CreateNewPass";
import RestaurantDetail from "../pages/RestaurantDetail";
import DashboardHome from "../pages/Dashboard/index";
import OrdersPage from "../pages/Orders";
import OrdersDetailPage from "@/pages/Orders/orderdetail";
import AddNewFood from "@/pages/FoodMenu";
import MenuList from "@/pages/FoodMenu/MenuList";
import FoodDetail from "@/pages/FoodMenu/FoodDetail";
import Profile from "@/pages/Profile";
import { PrivateRoute, PublicRoute } from "./RoutesTypes";
import NotFound from "@/pages/Notfound";
import WalletPage from "@/pages/Wallet";
import AddMethod from "@/pages/Wallet/AddMethod";
import EditFood from "@/pages/FoodMenu/EditFood";
import NewOrders from "@/pages/Orders/NewOrders";
import AcceptedOrder from "@/pages/Orders/AcceptedOrder";
import Preparing from "@/pages/Orders/Preparing";
import ReadyOrders from "@/pages/Orders/ReadyOrders";
import DriverAssigned from "@/pages/Orders/DriverAssigned";
import Delivered from "@/pages/Orders/Delivered";
import Cancelled from "@/pages/Orders/Cancelled";
import PromotionsAndCupons from "@/pages/Promotions-cupons";
import AddCoupon from "@/pages/Promotions-cupons/AddMethod";
import EarningPage from "@/pages/Analytics";
import ComminsionPaidPage from "@/pages/Analytics/ComminsionPaid";
import TotalordersPage from "@/pages/Analytics/TotalOrders";
import SalesReportPage from "@/pages/Analytics/SalesReport";
import ReviewsPage from "@/pages/Orders/Reviews";
import AddAttribute from "@/pages/FoodMenu/Attribute/AddAttribute";

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        }
      />
      <Route
        path="/otp-verification"
        element={
          <PublicRoute>
            <OtpVerification />
          </PublicRoute>
        }
      />
      <Route
        path="/create-new-password"
        element={
          <PublicRoute>
            <CreateNewPass />
          </PublicRoute>
        }
      />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <DashboardHome />
          </PrivateRoute>
        }
      />
      <Route
        path="/restaurant-detail"
        element={
          <PrivateRoute>
            <RestaurantDetail />
          </PrivateRoute>
        }
      />
      <Route
        path="/orders/all"
        element={
          <PrivateRoute>
            <OrdersPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/orders/:id"
        element={
          <PrivateRoute>
            <OrdersDetailPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/orders/new"
        element={
          <PrivateRoute>
            <NewOrders />
          </PrivateRoute>
        }
      />
      <Route
        path="/orders/accepted"
        element={
          <PrivateRoute>
            <AcceptedOrder />
          </PrivateRoute>
        }
      />
      <Route
        path="/orders/preparing"
        element={
          <PrivateRoute>
            <Preparing />
          </PrivateRoute>
        }
      />
      <Route
        path="/orders/ready"
        element={
          <PrivateRoute>
            <ReadyOrders />
          </PrivateRoute>
        }
      />
      <Route
        path="/orders/driver-assigned"
        element={
          <PrivateRoute>
            <DriverAssigned />
          </PrivateRoute>
        }
      />
      <Route
        path="/orders/delivered"
        element={
          <PrivateRoute>
            <Delivered />
          </PrivateRoute>
        }
      />
         <Route
        path="/orders/cancelled"
        element={
          <PrivateRoute>
            <Cancelled />
          </PrivateRoute>
        }
      />
      <Route
        path="/add-new-food"
        element={
          <PrivateRoute>
            <AddNewFood />
          </PrivateRoute>
        }
      />
      <Route
        path="/edit-food/:id"
        element={
          <PrivateRoute>
            <EditFood />
          </PrivateRoute>
        }
      />

       <Route
        path="/add-new-attribute"
        element={
          <PrivateRoute>
            <AddAttribute />
          </PrivateRoute>
        }
      />
      <Route
        path="/menu-list"
        element={
          <PrivateRoute>
            <MenuList />
          </PrivateRoute>
        }
      />
      <Route
        path="/food-detail/:id"
        element={
          <PrivateRoute>
            <FoodDetail />
          </PrivateRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        }
      />
      <Route
        path="/wallet"
        element={
          <PrivateRoute>
            <WalletPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/add-payment-mode"
        element={
          <PrivateRoute>
            <AddMethod />
          </PrivateRoute>
        }
      />
      <Route
        path="/add-coupon"
        element={
          <PrivateRoute>
            <AddCoupon />
          </PrivateRoute>
        }
      />
      <Route
        path="/promotions-and-coupons"
        element={
          <PrivateRoute>
            <PromotionsAndCupons />
          </PrivateRoute>
        }
      />{" "}
      <Route
        path="/earnings"
        element={
          <PrivateRoute>
            <EarningPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/commission-paid"
        element={
          <PrivateRoute>
            <ComminsionPaidPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/orders-report"
        element={
          <PrivateRoute>
            <TotalordersPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/sales-report"
        element={
          <PrivateRoute>
            <SalesReportPage />
          </PrivateRoute>
        }
      />{" "}
      <Route
        path="/reviews"
        element={
          <PrivateRoute>
            <ReviewsPage />
          </PrivateRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;
