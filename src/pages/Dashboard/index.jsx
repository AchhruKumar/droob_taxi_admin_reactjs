import React, { useEffect, useState } from "react";
import MainLayout from "@/layouts/MainLayout";
import CounterImg from "@/assets/counter-bg.jpg";
import {
  AcceptedIcon,
  CommissionIcon,
  CountIcon,
  DeliveredIcon,
  PreparingIcon,
  ReadyIcon,
  TotalOrdersIcon,
} from "@/components/icons";
import { useSelector } from "react-redux";
import { IMAGE_URL } from "@/utils/constants";
import { getRequest } from "@/utils/http-client/axiosClient";
import { DASHBOARD } from "@/utils/endPoints";
import { Skeleton } from "@/components/ui/skeleton";


import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const DashboardHome = () => {
  const { user } = useSelector((state) => state.login);

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  const chartData = stats?.monthlyData || [
    { name: "Jan", earnings: 5500, orders: 170 },
    { name: "Feb", earnings: 7800, orders: 250 },
    { name: "Mar", earnings: 6200, orders: 210 },
    { name: "Apr", earnings: 11000, orders: 280 },
    { name: "May", earnings: 9000, orders: 190 },
    { name: "Jun", earnings: 8200, orders: 200 },
    { name: "Jul", earnings: 12000, orders: 240 },
  ];

  const fetchDashboardDetails = async () => {
    try {
      setLoading(true);
      const res = await getRequest(
        `${DASHBOARD.GET}?restaurantId=${user?.resturant?.id}`,
      );
      if (res?.data?.data) {
        setStats(res?.data?.data);
      }
    } catch (err) {
      console.error("Error fetching dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.resturant?.id) {
      fetchDashboardDetails();
    }
  }, [user]);

  const orderStats = [
    {
      title: "Accepted",
      count: stats?.orderStatus?.accepted || 0,
      icon: <AcceptedIcon />,
    },
    {
      title: "Preparing",
      count: stats?.orderStatus?.preparing || 0,
      icon: <PreparingIcon />,
    },
    {
      title: "Ready",
      count: stats?.orderStatus?.ready || 0,
      icon: <ReadyIcon />,
    },
    {
      title: "Delivered",
      count: stats?.orderStatus?.delivered || 0,
      icon: <DeliveredIcon />,
    },
  ];

  const earningStats = [
    {
      title: "Total Earnings",
      count: stats?.wallet?.totalEarning || "0",
      icon: <CountIcon color="white" />,
    },
    {
      title: "Commission Paid",
      count: stats?.wallet?.commissionPaid || "0",
      icon: <CommissionIcon />,
    },
    {
      title: "Total Orders",
      count: stats?.wallet?.totalOrders || 0,
      icon: <TotalOrdersIcon />,
    },
  ];

  return (
    <MainLayout>
      <div
        className={
          "px-5 py-8 relative rounded-[10px] bg-cover bg-no-repeat bg-center text-white overflow-hidden before:contents-[''] before:bg-black/30 before:absolute before:left-0 before:top-0 before:h-full before:w-full mb-12"
        }
        style={{ backgroundImage: `url(${CounterImg})` }}
      >
        <div className="relative z-1">
          <div className="flex items-center gap-4 mb-14">
            <div>
              {loading ? (
                <>
                  <Skeleton className="h-6 w-40 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </>
              ) : (
                <>
                  <p className="text-[26px]">Welcome {`${user?.firstName}`}!</p>
                  <p className="text-sm font-medium">{`${user?.resturant?.name}`}</p>
                </>
              )}
            </div>
          </div>

          <p className="text-[22px] mb-5">Order Status</p>

          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-5">
            {loading
              ? Array(4)
                  .fill(0)
                  .map((_, idx) => (
                    <Skeleton key={idx} className="h-[120px] rounded-[10px]" />
                  ))
              : orderStats.map((item, idx) => (
                  <div
                    key={idx}
                    className="order-item p-5 rounded-[10px] bg-theme-primary/50"
                  >
                    <p className="text-sm font-semibold mb-8">{item.title}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-6xl leading-none">{item.count}</p>
                      <div className="item-icon h-[50px] w-[50px] rounded-full bg-white/20 flex items-center justify-center">
                        {item.icon}
                      </div>
                    </div>
                  </div>
                ))}
          </div>
        </div>
      </div>

      {/* Earnings Cards */}
      <div className="grid grid-cols-1 xs:grid-cols-3 lg:grid-cols-3 gap-5">
        {loading
          ? Array(3)
              .fill(0)
              .map((_, idx) => (
                <Skeleton key={idx} className="h-[150px] rounded-[10px]" />
              ))
          : earningStats.map((item, idx) => (
              <div
                key={idx}
                className="card p-5 rounded-[10px] text-droobGray-900 bg-droobGray-200 flex items-end justify-between"
              >
                <div>
                  <p className="text-xl font-semibold mb-12">{item.title}:</p>
                  <p className="text-3xl leading-none flex items-center gap-1">
                    <CountIcon /> {item.count}
                  </p>
                </div>
                <div className="earning-icon bg-theme-primary rounded-full h-[50px] w-[50px] flex items-center justify-center">
                  {item.icon}
                </div>
              </div>
            ))}
      </div>
    </MainLayout>
  );
};

export default DashboardHome;
