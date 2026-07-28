import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import MainLayout from "@/layouts/MainLayout";
import { useSelector } from "react-redux";
import { getRequest } from "@/utils/http-client/axiosClient";
import { ANLYTICS } from "@/utils/endPoints";
import { useToast } from "@/utils/toaster";
import { FilterIcon, CountIcon } from "@/components/icons";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DatePicker } from "@/components/DatePicker";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import CustomTable from "@/components/ui/Table";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
} from "recharts";

const EarningPage = () => {
  const login = useSelector((state) => state.login);
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [earnings, setEarnings] = useState(null);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  const fetchEarnings = async () => {
    if (!login?.user?.resturant?.id) return;
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (fromDate && toDate) {
        query.append("startDate", fromDate.toISOString().split("T")[0]);
        query.append("endDate", toDate.toISOString().split("T")[0]);
      }
      const res = await getRequest(
        `${ANLYTICS.EARNING}/${login?.user?.resturant?.id}?${query.toString()}`
      );
      if (res?.data?.success) {
        setEarnings(res.data.data);
      } else {
        toast.error("Failed to load earnings data");
      }
    } catch (err) {
      console.error("Error fetching earnings:", err);
      toast.error("Error fetching earnings data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEarnings();
  }, [login]);

  const handleApplyDateFilter = () => {
    fetchEarnings();
  };

  const columns = [
    { label: "Date", key: "date" },
    {
      label: "Revenue",
      key: "revenue",
      render: (row) => `₺ ${row.revenue}`,
    },
    { label: "Orders", key: "orders" },
    {
      label: "Avg Order Value",
      key: "avgOrderValue",
      render: (row) => `₺ ${row.avgOrderValue}`,
    },
    {
      label: "Growth",
      key: "growth",
      render: (row) => (
        <span
          className={`font-semibold ${
            row.trend === "up"
              ? "text-green-500"
              : row.trend === "down"
              ? "text-red-500"
              : "text-gray-500"
          }`}
        >
          {row.growth}
        </span>
      ),
    },
  ];

  const overview = earnings?.overview;
  const tableData = earnings?.table || [];
  const monthlyData = earnings?.monthly || [];

  const tooltipFormatter = (value, name, props) => {
    if (props && props.payload) {
      return `₺ ${Number(value).toFixed(2)}`;
    }
    return null;
  };

  return (
    <MainLayout>
      <div className="pb-5 mb-10 border-b flex justify-between items-center flex-wrap">
        <h2 className="text-[28px] font-medium">Earnings</h2>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              className="border border-gray-300 py-3 h-12 flex items-center"
            >
              Date Filter <FilterIcon className="size-5 ml-2" />
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <div className="grid gap-4">
              <h4 className="font-medium">Select Date Range</h4>
              <div className="grid grid-cols-2 gap-2">
                <DatePicker
                  selectedDate={fromDate}
                  onDateChange={setFromDate}
                  placeholder="From Date"
                />
                <DatePicker
                  selectedDate={toDate}
                  onDateChange={setToDate}
                  minDate={fromDate}
                  placeholder="To Date"
                />
              </div>
              <Button
                onClick={handleApplyDateFilter}
                variant="default"
                className="me-auto min-w-[130px]"
              >
                Apply
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {[
          {
            title: "Total Earnings",
            value: overview?.totalEarnings,
            color: "#88C664",
            icon: <CountIcon color="white" />,
          },
          {
            title: "Commission Paid",
            value: overview?.totalCommission,
            color: "#7BAE47",
            icon: <CountIcon color="white" />,
          },
          {
            title: "Total Orders",
            value: overview?.totalOrders,
            color: "#7BAE47",
            icon: <CountIcon color="white" />,
          },
        ].map((card, i) => (
          <div
            key={i}
            className="card p-5 rounded-[.625rem] text-white flex items-end justify-between"
            style={{ backgroundColor: card.color }}
          >
            <div>
              <p className="text-lg font-semibold mb-12">{card.title}</p>
              <p className="text-3xl flex items-center gap-2">
                <CountIcon color="white" />{" "}
                {loading ? <Skeleton width={60} /> : card.value || "0"}
              </p>
            </div>
            <div className="earning-icon bg-white/20 rounded-full h-[3.125rem] w-[3.125rem] flex items-center justify-center">
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-10">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">Monthly Earnings</h3>
          <p className="text-sm text-gray-500">(Jan 2025 – Dec 2025)</p>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          Revenue trends over the past year
        </p>

        {monthlyData?.length ? (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={monthlyData}
              margin={{ top: 20, right: 30, left: 10, bottom: 0 }}
            >
              <defs>
                <linearGradient
                  id="earningsGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#88C664" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#88C664" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#eaeaea"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: "#888" }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: "#888" }}
              />
              <Tooltip
                formatter={tooltipFormatter}
                labelFormatter={(label) => `${label}`}
                cursor={{ stroke: "#d9d9d9", strokeWidth: 1 }}
                contentStyle={{
                  backgroundColor: "white",
                  borderRadius: "10px",
                  border: "1px solid #eee",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                  padding: "10px 15px",
                }}
              />

              <Area
                type="monotone"
                dataKey="revenue"
                stroke="none"
                fill="url(#earningsGradient)"
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#88C664"
                strokeWidth={3}
                dot={{
                  r: 6,
                  fill: "#88C664",
                  stroke: "#fff",
                  strokeWidth: 3,
                }}
                activeDot={{
                  r: 8,
                  fill: "#7CB342",
                  stroke: "#fff",
                  strokeWidth: 3,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center text-gray-400 py-10">
            No monthly data available
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Earnings History</h3>
        <CustomTable
          columns={columns}
          data={tableData}
          loading={loading}
          rowKey={(row) => row.date}
        />
      </div>
    </MainLayout>
  );
};

export default EarningPage;
