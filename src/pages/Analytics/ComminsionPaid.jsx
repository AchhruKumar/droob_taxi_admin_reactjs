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

const ComminsionPaidPage = () => {
  const login = useSelector((state) => state.login);
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [commissionData, setCommissionData] = useState(null);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  const fetchCommission = async () => {
    if (!login?.user?.resturant?.id) return;
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (fromDate && toDate) {
        query.append("startDate", fromDate.toISOString().split("T")[0]);
        query.append("endDate", toDate.toISOString().split("T")[0]);
      }
      const res = await getRequest(
        `${ANLYTICS.COMMISSION}/${login?.user?.resturant?.id}?${query.toString()}`,
      );
      if (res?.data?.success) {
        setCommissionData(res.data.data);
      } else {
        toast.error("Failed to load commission data");
      }
    } catch (err) {
      console.error("Error fetching commission data:", err);
      toast.error("Error fetching commission data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommission();
  }, [login]);

  const handleApplyDateFilter = () => {
    fetchCommission();
  };

  const columns = [
    { label: "Date", key: "date" },
    {
      label: "Revenue",
      key: "revenue",
      render: (row) => `₺ ${Number(row.revenue).toFixed(2)}`,
    },
    {
      label: "Commission",
      key: "commission",
      render: (row) => `₺ ${Number(row.commission).toFixed(2)}`,
    },
    {
      label: "Rate",
      key: "rate",
      render: (row) => row.rate || "0%",
    },
    {
      label: "Orders",
      key: "orders",
    },
    {
      label: "Avg Commission per Order",
      key: "avgCommission",
      render: (row) => `₺ ${Number(row.avgCommission).toFixed(2)}`,
    },
  ];

  const summary = commissionData?.summary;
  const tableData = commissionData?.table?.data || [];

  return (
    <MainLayout>
      <div className="pb-5 mb-10 border-b flex justify-between items-center flex-wrap">
        <h2 className="text-[28px] font-medium">Commission Paid</h2>

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

      <div className="grid grid-cols-1 xs:grid-cols-3 lg:grid-cols-3 gap-5 mb-10">
        {[
          {
            title: "Total Earnings",
            value: summary?.totalEarnings,
            color: "#88C664",
            icon: <CountIcon color="white" />,
          },
          {
            title: "Commission Paid",
            value: summary?.commissionPaid,
            color: "#7BAE47",
            icon: <CountIcon color="white" />,
          },
          {
            title: "Total Orders",
            value: summary?.totalOrders,
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

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Commission History</h3>
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

export default ComminsionPaidPage;
