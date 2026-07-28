import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

export function PrivateRoute({ children }) {
  const { access_token, user } = useSelector((state) => state.login || {});
  const resturant = user?.resturant;
  console.log(resturant,"csndsldlsdsd")
  const location = useLocation();

  console.log("user--->", user);

  if (!access_token) {
    return <Navigate to="/login" replace />;
  }

  // if (!resturant && location.pathname !== "/restaurant-detail") {
  //   return <Navigate to="/restaurant-detail" replace />;
  // }

  return children;
}

export function PublicRoute({ children }) {
  const { access_token, user } = useSelector((state) => state.login || {});
  const resturant = user?.resturant;

  return access_token && resturant ? <Navigate to="/" replace /> : children;
}
