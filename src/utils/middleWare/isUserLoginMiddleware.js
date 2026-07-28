"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getToken } from "../Auth";

const withAuth = (WrappedComponent) => {
  const WithAuth = (props) => {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const token = getToken();
      const publicRoutes = ["/signup", "/forget-password", "/login"];

      const isTokenRoute = router.pathname.startsWith("/token/");

      if (!token) {
        if (!publicRoutes.includes(router.pathname) && !isTokenRoute) {
          router.push("/login");
        } else {
          setLoading(false);
        }
      } else {
        if (publicRoutes.includes(router.pathname) || isTokenRoute) {
          router.push("/my-projects");
        } else {
          setLoading(false);
        }
      }
    }, [router.pathname]); // Trigger effect on pathname change

    if (loading) {
      return <div>Loading...</div>;
    }

    return <WrappedComponent {...props} />;
  };

  WithAuth.displayName = "WithAuth";
  return WithAuth;
};

export default withAuth;
