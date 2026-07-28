import * as React from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import DroobnaLogo from "@/assets/droobna_logo_white.svg";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  AnalyticsIcon,
  DashboardIcon,
  FoodIcon,
  LogoutIcon,
  OrderIcon,
  ReviewsIcon,
  WalletIcon,
} from "./icons";
import { Button } from "./ui/button";
import { useDispatch, useSelector } from "react-redux";
import { logoutAction } from "@/modules/Auth/Login/LoginActions";
import { IMAGE_URL } from "@/utils/constants";
import { getRequest } from "@/utils/http-client/axiosClient";
import { DASHBOARD } from "@/utils/endPoints";
import { cancelled } from "redux-saga/effects";

export function AppSidebar({ ...props }) {
  const location = useLocation();
  const currentPath = location.pathname;
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.login);
  const firstLetter = user?.firstName?.[0]?.toUpperCase() || "?";

  const [orderCounts, setOrderCounts] = React.useState({
    totalOrders: 0,
    accepted: 0,
    preparing: 0,
    ready: 0,
    delivered: 0,
    newOrders: 0,
    cancelled: 0,
  });

  const isChildActive = (items) =>
    items.some((subItem) => currentPath === subItem.url);

  const handleLogout = () => {
    dispatch(logoutAction());
    window.location.reload();
  };

  const fetchOrderCounts = async () => {
    try {
      const res = await getRequest(
        `${DASHBOARD.GET}?restaurantId=${user?.resturant?.id}`,
      );
      if (res?.data?.data) {
        const { orderStatus, wallet } = res.data?.data;
        setOrderCounts({
          totalOrders: wallet?.totalOrders || 0,
          accepted: orderStatus?.accepted || 0,
          preparing: orderStatus?.preparing || 0,
          ready: orderStatus?.ready || 0,
          delivered: orderStatus?.delivered || 0,
          newOrders: orderStatus?.pending || 0,
        });
      }
    } catch (err) {
      console.error("Error fetching order counts:", err);
    }
  };

  React.useEffect(() => {
    if (user?.resturant?.id) {
      fetchOrderCounts();
    }
  }, [user]);

  const data = [
    { title: "Dashboard", url: "/", icon: <DashboardIcon /> },
    {
      title: "Order",
      url: "#",
      icon: <OrderIcon />,
      items: [
        { title: `All (${orderCounts.totalOrders})`, url: "/orders/all" },
        { title: `New Orders (${orderCounts.newOrders})`, url: "/orders/new" },
        {
          title: `Accepted (${orderCounts.accepted})`,
          url: "/orders/accepted",
        },
        {
          title: `Preparing (${orderCounts.preparing})`,
          url: "/orders/preparing",
        },
        { title: `Ready (${orderCounts.ready})`, url: "/orders/ready" },
        {
          title: `Driver Assigned (0)`,
          url: "/orders/driver-assigned",
        },
        {
          title: `Delivered (${orderCounts.delivered})`,
          url: "/orders/delivered",
        },
        {
          title: `Cancelled (${orderCounts.delivered})`,
          url: "/orders/cancelled",
        },
      ],
    },
    {
      title: "Food Menu",
      url: "#",
      icon: <FoodIcon />,
      items: [
        { title: "Add Menu", url: "/add-new-food" },
        { title: "Attribute", url: "/add-new-attribute" },
        { title: "Menu List", url: "/menu-list" },
      ],
    },
    { title: "Wallet", url: "/wallet", icon: <WalletIcon /> },
    {
      title: "Promotions/Coupons",
      url: "/promotions-and-coupons",
      icon: <WalletIcon />,
    },

    { title: "Reviews", url: "/reviews", icon: <ReviewsIcon /> },
    {
      title: "Analytics",
      url: "/analytics",
      icon: <AnalyticsIcon />,
      items: [
        { title: "Earnings", url: "/earnings" },
        { title: "Commission Paid ", url: "/commission-paid" },
        { title: "Orders", url: "/orders-report" },
        { title: "Sales Reports", url: "/sales-report" },
      ],
    },
  ];

  return (
    <Sidebar {...props}>
      <SidebarHeader className="pt-6 pb-11">
        <img
          src={DroobnaLogo}
          width={125}
          className="mx-auto"
          alt="Droobna Logo"
        />
      </SidebarHeader>

      <SidebarContent className="gap-5 px-2.5 pb-2.5">
        {data.map((item) =>
          item.items ? (
            <Collapsible
              key={item.title}
              title={item.title}
              defaultOpen={isChildActive(item.items)}
              className="group/collapsible"
            >
              <SidebarGroup>
                <SidebarGroupLabel
                  asChild
                  className={`group/label text-white text-sm ${
                    isChildActive(item.items) ? "bg-[#204275]" : ""
                  }`}
                >
                  <CollapsibleTrigger>
                    <div className="flex items-center gap-3.5">
                      {item.icon} {item.title}
                    </div>
                    <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                  </CollapsibleTrigger>
                </SidebarGroupLabel>

                <CollapsibleContent>
                  <SidebarGroupContent>
                    <SidebarMenu className="mt-2.5">
                      {item.items.map((subItem) => (
                        <SidebarMenuItem key={subItem.title}>
                          <SidebarMenuButton
                            className="ps-8 before:contents-[''] before:w-1 before:h-1 before:bg-white before:rounded-full before:inline-block"
                            asChild
                            isActive={currentPath === subItem.url}
                          >
                            <Link to={subItem.url}>{subItem.title}</Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </SidebarGroup>
            </Collapsible>
          ) : (
            <SidebarMenu key={item.title}>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={currentPath === item.url}>
                  <Link to={item.url} className="flex items-center gap-3.5">
                    {item.icon} {item.title}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          ),
        )}
      </SidebarContent>

      <SidebarFooter>
        <div className="profile-wrap flex w-full">
          <div className="flex items-center gap-2 bg-[#183A6D] py-3 px-5 rounded-s-[10px] w-full">
            <div className="relative">
              {user?.profileImg ? (
                <img
                  src={`${IMAGE_URL}/${user?.profileImg}`}
                  className="size-10 shrink-0 rounded-full object-cover bg-gray-950/5 outline -outline-offset-1 outline-gray-950/10 dark:outline-white/10"
                  alt="User Profile"
                />
              ) : (
                <div
                  style={{ backgroundColor: "#88C664" }}
                  className="size-10 shrink-0 rounded-full flex items-center justify-center text-white font-bold text-xl"
                >
                  {firstLetter}
                </div>
              )}
            </div>
            <Link to="/profile">Profile</Link>
          </div>
          <Button
            onClick={handleLogout}
            variant="destructive"
            className="h-full rounded-none rounded-e-[10px] px-3"
          >
            <LogoutIcon />
          </Button>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
