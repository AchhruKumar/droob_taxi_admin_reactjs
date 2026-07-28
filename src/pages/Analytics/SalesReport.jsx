"use client";
import React, { useEffect, useState } from "react";
import MainLayout from "@/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { DatePicker } from "@/components/DatePicker";
import {
  FilterIcon,
  CountIcon,
  VerifyIcon,
  CommissionIcon,
} from "@/components/icons";
import { getRequest } from "@/utils/http-client/axiosClient";
import { ANLYTICS } from "@/utils/endPoints";
import { useSelector } from "react-redux";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#6C63FF", "#E6B926", "#1CA7EC", "#88C664"];

export default function SalesReportPage() {
  const login = useSelector((state) => state.login);
  const restaurantId = login?.user?.resturant?.id;

  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [activeTab, setActiveTab] = useState("items");

  const [topItems, setTopItems] = useState(null);
  const [categorySales, setCategorySales] = useState(null);
  const [customerSegments, setCustomerSegments] = useState(null);

  const formatDateForQuery = (date) =>
    date ? new Date(date).toISOString().split("T")[0] : "";

  const fetchAnalytics = async () => {
    if (!restaurantId) return;
    try {
      setLoading(true);
      const start = formatDateForQuery(fromDate);
      const end = formatDateForQuery(toDate);

      const [itemsRes, categoryRes, customerRes] = await Promise.all([
        getRequest(`${ANLYTICS.TOP_ITEMS}/${restaurantId}?startDate=${start}&endDate=${end}`),
        getRequest(`${ANLYTICS.SALES_BY_CATEGORY}/${restaurantId}?startDate=${start}&endDate=${end}`),
        getRequest(`${ANLYTICS.CUSTOMER_SEGMENTS}/${restaurantId}?startDate=${start}&endDate=${end}`),
      ]);

      const parsedCategory = categoryRes?.data?.data
        ? {
            ...categoryRes.data.data,
            chart: (categoryRes.data.data.chart || []).map((c) => ({
              ...c,
              percentage: Number(c.percentage || 0),
            })),
          }
        : null;

      setTopItems(itemsRes?.data?.data || null);
      setCategorySales(parsedCategory);
      setCustomerSegments(customerRes?.data?.data || null);
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [restaurantId]);

  const handleApplyFilter = () => fetchAnalytics();

  const renderDate = (date) =>
    date ? new Date(date).toLocaleDateString("en-IN") : "-";

  const renderTopItemsTab = () => (
    <div className="grid lg:grid-cols-2 gap-6 mt-6">
      <div className="p-5 bg-white rounded-xl shadow">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-lg font-semibold">Top Selling Items</h3>
          <p className="text-sm text-gray-500">
            ({renderDate(fromDate)} - {renderDate(toDate)})
          </p>
        </div>
        {loading ? (
          <Skeleton height={280} />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={topItems?.chart || []}
              barSize={35}
              barGap={10}
              margin={{ top: 10, right: 20, left: 0, bottom: 50 }}
            >
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12 }}
                angle={-30}
                textAnchor="end"
              />
              <YAxis domain={[0, "dataMax + 1"]} />
              <Tooltip formatter={(v) => [`${v} orders`, "Orders"]} />
              <Bar dataKey="orders" fill="#88C664" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="p-5 bg-white rounded-xl shadow">
        <h3 className="text-lg font-semibold mb-4">Item Performance Details</h3>
        {loading ? (
          <Skeleton count={5} height={40} />
        ) : (
          <div className="space-y-4">
            {topItems?.performance?.map((item, i) => (
              <div
                key={i}
                className="flex justify-between items-center border-b pb-2"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-gray-100 w-7 h-7 rounded-full flex items-center justify-center font-semibold">
                    {item.rank}
                  </div>
                  <div>
                    <p className="font-medium">{item.itemName}</p>
                    <p className="text-sm text-gray-500">
                      {item.orders} orders
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">₹{item.revenue}</p>
                  <p className="text-xs text-gray-500">{item.percentage}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderCategoriesTab = () => (
    <div className="grid lg:grid-cols-2 gap-6 mt-6">
      <div className="p-5 bg-white rounded-xl shadow">
        <h3 className="text-lg font-semibold mb-4">Sales by Category</h3>
        {loading ? (
          <Skeleton height={300} />
        ) : categorySales?.chart?.length ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categorySales.chart}
                dataKey="percentage"
                nameKey="name"
                outerRadius={110}
                labelLine={false}
                label={({ name }) => name}
              >
                {categorySales.chart.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => [`${v}%`, "Share"]} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-gray-400 mt-20">No category data</p>
        )}
      </div>

      <div className="p-5 bg-white rounded-xl shadow">
        <h3 className="text-lg font-semibold mb-4">Item Performance Details</h3>
        {loading ? (
          <Skeleton count={5} height={40} />
        ) : (
          <div className="space-y-4">
            {categorySales?.performance?.map((cat, i) => (
              <div key={i}>
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[i % COLORS.length] }}
                    ></span>
                    <p>{cat.categoryName}</p>
                  </div>
                  <p className="text-sm font-semibold">{cat.percentage}</p>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: cat.percentage,
                      backgroundColor: COLORS[i % COLORS.length],
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderCustomersTab = () => (
    <div className="grid lg:grid-cols-2 gap-6 mt-6">
      <div className="p-5 bg-white rounded-xl shadow">
        <h3 className="text-lg font-semibold mb-4">Customer Segments</h3>
        {loading ? (
          <Skeleton count={2} height={60} />
        ) : (
          <div className="space-y-4">
            {customerSegments?.segments?.map((seg, i) => (
              <div
                key={i}
                className="flex justify-between p-4 rounded-lg border items-center"
              >
                <div>
                  <p className="font-semibold">{seg.label}</p>
                  <p className="text-sm text-gray-500">
                    {seg.count} customers
                  </p>
                </div>
                <p className="font-semibold">{seg.percentage}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-5 bg-white rounded-xl shadow">
        <h3 className="text-lg font-semibold mb-4">Payment Methods</h3>
        {loading ? (
          <Skeleton height={280} />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={customerSegments?.segments || []}
                dataKey="count"
                nameKey="label"
                outerRadius={110}
                label={({ label }) => label}
              >
                {customerSegments?.segments?.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );

  return (
    <MainLayout>
      {/* Header */}
      <div className="pb-6 mb-6 border-b flex justify-between items-center">
        <h2 className="text-3xl font-semibold">Sales Reports</h2>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2 border-gray-300">
              Date Filter <FilterIcon className="size-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="grid gap-4">
              <h4 className="font-medium">Select Date Range</h4>
              <div className="grid grid-cols-2 gap-2">
                <DatePicker selectedDate={fromDate} onDateChange={setFromDate} placeholder="From" />
                <DatePicker selectedDate={toDate} onDateChange={setToDate} placeholder="To" />
              </div>
              <Button onClick={handleApplyFilter}>Apply</Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="p-5 bg-white rounded-xl shadow flex items-center gap-4">
          <CountIcon className="size-8 text-[#88C664]" />
          <div>
            <p className="text-sm text-gray-500">Total Items Sold</p>
            <h3 className="text-2xl font-bold">
              {topItems?.summary?.totalItemsSold ?? 0}
            </h3>
          </div>
        </div>
        <div className="p-5 bg-white rounded-xl shadow flex items-center gap-4">
          <VerifyIcon className="size-8 text-[#6C63FF]" />
          <div>
            <p className="text-sm text-gray-500">Best Seller</p>
            <h3 className="text-lg font-bold">
              {topItems?.summary?.bestSeller ?? "-"}
            </h3>
            <p className="text-xs text-gray-400">
              {topItems?.summary?.bestSellerOrders ?? 0} orders this period
            </p>
          </div>
        </div>
        <div className="p-5 bg-white rounded-xl shadow flex items-center gap-4">
          <CommissionIcon className="size-8 text-[#E6B926]" />
          <div>
            <p className="text-sm text-gray-500">Category Leader</p>
            <h3 className="text-lg font-bold">
              {categorySales?.summary?.topCategory ?? "-"}
            </h3>
            <p className="text-xs text-gray-400">
              {categorySales?.summary?.topCategoryShare ?? "0%"} of total sales
            </p>
          </div>
        </div>
        <div className="p-5 bg-white rounded-xl shadow flex items-center gap-4">
          <FilterIcon className="size-8 text-[#1CA7EC]" />
          <div>
            <p className="text-sm text-gray-500">Avg Rating</p>
            <h3 className="text-lg font-bold">4.6</h3>
            <p className="text-xs text-gray-400">Based on 1,245 reviews</p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-transparent border-b mb-6">
          <TabsTrigger value="items" className="mr-5">
            Top Items
          </TabsTrigger>
          <TabsTrigger value="categories" className="mr-5">
            Categories
          </TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
        </TabsList>
        <TabsContent value="items">{renderTopItemsTab()}</TabsContent>
        <TabsContent value="categories">{renderCategoriesTab()}</TabsContent>
        <TabsContent value="customers">{renderCustomersTab()}</TabsContent>
      </Tabs>
    </MainLayout>
  );
}
