"use client";
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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Input } from "@/components/ui/input";

const TotalOrdersPage = () => {
  const login = useSelector((state) => state.login);
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [ordersData, setOrdersData] = useState(null);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchOrdersSummary = async () => {
    if (!login?.user?.resturant?.id) return;
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (fromDate && toDate) {
        query.append("startDate", fromDate.toISOString().split("T")[0]);
        query.append("endDate", toDate.toISOString().split("T")[0]);
      }
      if (search) query.append("search", search);

      const res = await getRequest(
        `${ANLYTICS.ORDER_SUMARY}/${
          login?.user?.resturant?.id
        }?${query.toString()}`
      );

      if (res?.data?.success) {
        setOrdersData(res.data.data);
      } else {
        toast.error("Failed to load order data");
      }
    } catch (err) {
      console.error("Error fetching order summary:", err);
      toast.error("Error fetching order summary");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdersSummary();
  }, [login]);

  const handleApplyDateFilter = () => fetchOrdersSummary();

  const handleSearchSubmit = () => {
    fetchOrdersSummary();
  };

  const columns = [
    { label: "Order ID", key: "orderId" },
    { label: "Customer", key: "customer" },
    { label: "Items", key: "itemsCount" },
    {
      label: "Total",
      key: "total",
      render: (row) => `₺ ${Number(row.total || 0).toFixed(2)}`,
    },
    { label: "Payment", key: "payment" },
    {
      label: "Status",
      key: "status",
      render: (row) => (
        <span
          className={`capitalize font-medium px-3 py-1 rounded-full text-xs ${
            row.status === "completed"
              ? "bg-green-100 text-green-700"
              : row.status === "pending"
              ? "bg-yellow-100 text-yellow-700"
              : row.status === "accepted"
              ? "bg-blue-100 text-blue-700"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      label: "Date/Time",
      key: "date",
      render: (row) =>
        new Date(row.date).toLocaleString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
    },
    {
      label: "Actions",
      key: "actions",
      render: (row) => (
        <Button
          size="sm"
          variant="outline"
          className="flex items-center gap-2 border-gray-300"
          onClick={() => {
            setSelectedOrder(row);
            setIsModalOpen(true);
          }}
        >
          👁 View
        </Button>
      ),
    },
  ];

  const overview = ordersData?.overview || {};
  const hourlyData = ordersData?.hourly || [];
  const tableData = ordersData?.table?.data || [];

  return (
    <MainLayout>
      {/* HEADER */}
      <div className="pb-6 mb-8 border-b flex justify-between items-center flex-wrap">
        <h2 className="text-[28px] font-semibold">Sales Summary</h2>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="flex items-center gap-2 border-gray-300"
            >
              Date Filter <FilterIcon className="size-5" />
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
                  placeholder="To Date"
                />
              </div>
              <Button onClick={handleApplyDateFilter} className="w-fit">
                Apply
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid grid-cols-1 xs:grid-cols-3 lg:grid-cols-3 gap-5 mb-10">
        {[
          {
            title: "Total Earnings",
            value: overview?.totalEarnings,
            color: "#88C664",
            icon: <CountIcon color="white" />,
          },
          {
            title: "Commission Paid",
            value: overview?.commissionPaid,
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {[
          {
            title: "Total Revenue",
            value: `₺${overview.totalRevenue || "0"}`,
          },
          {
            title: "Avg Order Value",
            value: `₺${overview.avgOrderValue || "0"}`,
          },
          {
            title: "Completed Orders",
            value: overview.totalOrders
              ? Math.floor(overview.totalOrders * 0.7)
              : 0,
          },
          {
            title: "Total Commission",
            value: `₺${overview.commissionPaid || "0"}`,
          },
        ].map((card, i) => (
          <div
            key={i}
            className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm flex flex-col"
          >
            <p className="text-gray-500 text-sm">{card.title}</p>
            <h3 className="text-xl font-semibold text-gray-800 mt-2">
              {card.value}
            </h3>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Orders by Hour</h3>
          <p className="text-sm text-gray-500">
            (
            {new Date().toLocaleDateString("en-GB", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
            )
          </p>
        </div>

        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={hourlyData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="hour"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "#777" }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "#777" }}
            />
            <Tooltip
              cursor={{ fill: "rgba(136,198,100,0.1)" }}
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #eee",
                borderRadius: "10px",
              }}
              formatter={(value) => [`Orders: ${value}`]}
              labelFormatter={(label) => `${label}`}
            />
            <Bar
              dataKey="orders"
              fill="#88C664"
              barSize={18}
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
          <h3 className="text-lg font-semibold">Order History</h3>
          <div className="flex gap-2 items-center">
            <Input
              placeholder="Search by Order ID or Customer"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-[250px]"
            />
            <Button onClick={handleSearchSubmit}>Search</Button>
          </div>
        </div>

        <CustomTable
          columns={columns}
          data={tableData}
          loading={loading}
          rowKey={(row) => row.orderId}
          pagination={{
            totalPages: ordersData?.table?.totalPages || 1,
            page: ordersData?.table?.page || 1,
          }}
        />
      </div>

      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg relative animate-fadeIn">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
              onClick={() => setIsModalOpen(false)}
            >
              ✕
            </button>
            <h3 className="text-2xl font-semibold mb-4">
              Order Details #{selectedOrder.orderId}
            </h3>
            <div className="space-y-3 text-gray-700">
              <p>
                <strong>Customer:</strong> {selectedOrder.customer}
              </p>
              <p>
                <strong>Status:</strong> {selectedOrder.status}
              </p>
              <p>
                <strong>Payment:</strong> {selectedOrder.payment}
              </p>
              <p>
                <strong>Total:</strong> ₺{selectedOrder.total}
              </p>
              <p>
                <strong>Date:</strong>{" "}
                {new Date(selectedOrder.date).toLocaleString("en-GB")}
              </p>
              <div>
                <strong>Items:</strong>
                <ul className="list-disc list-inside text-sm mt-2 text-gray-600">
                  {selectedOrder.itemsCount ? (
                    <li>{selectedOrder.itemsCount} total items in order</li>
                  ) : (
                    <li>No item details available</li>
                  )}
                </ul>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default TotalOrdersPage;
