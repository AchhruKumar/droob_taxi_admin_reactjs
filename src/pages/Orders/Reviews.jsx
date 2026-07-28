"use client";
import React, { useEffect, useMemo, useState } from "react";
import MainLayout from "@/layouts/MainLayout";
import { useSelector } from "react-redux";
import { getRequest } from "@/utils/http-client/axiosClient";
import { ANLYTICS } from "@/utils/endPoints";
import { useToast } from "@/utils/toaster";
import { FilterIcon, SearchIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DatePicker } from "@/components/DatePicker";
import { Input } from "@/components/ui/input";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CustomTable from "@/components/ui/Table";

const ReviewsPage = () => {
  const toast = useToast();
  const { user } = useSelector((state) => state.login);

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [rating, setRating] = useState("");
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  const [openModal, setOpenModal] = useState(false);
  const [active, setActive] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(t);
  }, [search]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil((total || 0) / (limit || 10))),
    [total, limit]
  );

  const fetchReviews = async (resetPage = false) => {
    if (!user?.resturant?.id) return;
    try {
      setLoading(true);
      if (resetPage) setPage(1);

      const qs = new URLSearchParams();
      qs.append("page", String(resetPage ? 1 : page));
      qs.append("limit", String(limit));
      if (debouncedSearch) qs.append("search", debouncedSearch);
      if (rating) qs.append("rating", rating);
      if (fromDate && toDate) {
        qs.append("fromDate", fromDate.toISOString().split("T")[0]);
        qs.append("toDate", toDate.toISOString().split("T")[0]);
      }

      const url = `${ANLYTICS.REVIEWS}/${user?.resturant?.id}?${qs.toString()}`;
      const res = await getRequest(url);

      if (!res?.data?.success) {
        toast.error("Failed to load reviews");
        setLoading(false);
        return;
      }

      const data = res.data.data;
      setRows(data?.reviews || []);
      setTotal(data?.pagination?.total || 0);
      setLimit(data?.pagination?.limit || 10);
      setSummary(data?.summary || null);
    } catch (e) {
      console.error("Error fetching reviews:", e);
      toast.error("Error fetching reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [user, page, debouncedSearch, rating]);

  const applyDateFilter = () => fetchReviews(true);
  const clearDateFilter = () => {
    setFromDate(null);
    setToDate(null);
    setTimeout(() => fetchReviews(true), 0);
  };

  const getColorFromName = (name = "") => {
    const colors = [
      "#E0F7FA",
      "#F1F8E9",
      "#FFF9C4",
      "#FCE4EC",
      "#E3F2FD",
      "#F3E5F5",
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const columns = [
    {
      label: "#",
      key: "index",
      headerClassName: "w-[70px]",
      render: (_row, i) =>
        loading ? <Skeleton width={24} /> : (page - 1) * limit + (i + 1),
    },
    {
      label: "Customer",
      key: "customer",
      render: (row) =>
        loading ? (
          <div className="flex items-center gap-3">
            <Skeleton circle width={32} height={32} />
            <Skeleton width={120} />
          </div>
        ) : (
          <div className="flex items-center gap-3">
            {row.avatar ? (
              <img
                src={row.avatar}
                alt={row.customer}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div
                className="h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium text-gray-700"
                style={{ backgroundColor: getColorFromName(row.customer) }}
              >
                {row.customer?.charAt(0)?.toUpperCase() || "?"}
              </div>
            )}
            <span className="text-gray-800">{row.customer}</span>
          </div>
        ),
    },
    {
      label: "Date/Time",
      key: "dateTime",
      render: (row) =>
        loading ? <Skeleton width={120} /> : row.dateTime || "-",
    },
    {
      label: "Items",
      key: "items",
      render: (row) =>
        loading ? (
          <Skeleton width={60} />
        ) : (
          `${(row.items || []).reduce(
            (a, b) => a + (b?.quantity || 0),
            0
          )} items`
        ),
    },
    {
      label: "Review",
      key: "review",
      className: "max-w-[420px]",
      render: (row) =>
        loading ? (
          <Skeleton width={240} />
        ) : (
          <span className="line-clamp-1 text-gray-600">
            {row.review || "—"}
          </span>
        ),
    },
    {
      label: "Rating",
      key: "rating",
      render: (row) =>
        loading ? <Skeleton width={24} /> : <span>{row.rating}</span>,
    },
  ];

  const onRowClick = (row) => {
    if (loading) return;
    setActive(row);
    setOpenModal(true);
  };

  return (
    <MainLayout>
      <h2 className="text-[28px] font-medium pb-5 mb-6 border-b">
        Ratings &amp; Reviews
      </h2>

      <div className="flex justify-between items-center gap-3 flex-wrap mb-4">
        <div className="relative w-full sm:w-[320px]">
          <Input
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-10"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
            <SearchIcon size={20} />
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={rating}
            onValueChange={(v) => setRating(v === "all" ? "" : v)}
          >
            <SelectTrigger className="min-w-[140px]">
              <SelectValue placeholder="All Ratings" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Ratings</SelectItem>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="4.5">4</SelectItem>
              <SelectItem value="4">4</SelectItem>
              <SelectItem value="3.5">3.5</SelectItem>
              <SelectItem value="3">3</SelectItem>
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className="border border-gray-300 h-11 px-4 flex items-center gap-2"
              >
                Date Filter <FilterIcon className="size-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[320px]">
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
                    minDate={fromDate || undefined}
                    placeholder="To Date"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={applyDateFilter} className="min-w-[100px]">
                    Apply
                  </Button>
                  <Button
                    variant="outline"
                    onClick={clearDateFilter}
                    className="min-w-[100px]"
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="p-2.5 rounded-[10px] shadow bg-white">
        <CustomTable
          columns={columns}
          data={rows}
          loading={loading}
          stickyHeader
          onRowClick={onRowClick}
          pagination={{
            page,
            totalPages,
            onPrev: () => setPage((p) => Math.max(1, p - 1)),
            onNext: () => setPage((p) => Math.min(totalPages, p + 1)),
            onGoto: (p) => setPage(p),
            renderNumbers: true,
          }}
        />
        {/* {!loading && rows?.length === 0 && (
          <div className="text-center text-gray-500 py-10">
            No reviews found.
          </div>
        )} */}
      </div>

      {openModal && active ? (
        <div
          className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4"
          onClick={() => setOpenModal(false)}
        >
          <div
            className="bg-white w-full max-w-3xl rounded-2xl shadow-lg p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
              onClick={() => setOpenModal(false)}
            >
              ✕
            </button>

            <div className="flex items-center gap-4 mb-4">
              {active.avatar ? (
                <img
                  src={active.avatar}
                  alt={active.customer}
                  className="h-14 w-14 rounded-full object-cover"
                />
              ) : (
                <div
                  className="h-14 w-14 rounded-full flex items-center justify-center text-lg font-semibold text-gray-700"
                  style={{ backgroundColor: getColorFromName(active.customer) }}
                >
                  {active.customer?.charAt(0)?.toUpperCase() || "?"}
                </div>
              )}
              <div>
                <h3 className="text-xl font-semibold">{active.customer}</h3>
                <div className="flex gap-1 text-yellow-500 text-sm">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i}>
                      {i < Math.round(active.rating) ? "★" : "☆"}
                    </span>
                  ))}
                </div>
                <p className="text-gray-500 text-sm">{active.dateTime}</p>
              </div>
            </div>

            <div className="rounded-xl border overflow-hidden">
              <div className="grid grid-cols-3 bg-gray-50 px-4 py-3 font-medium">
                <span>Item</span>
                <span>Price</span>
                <span>Quantity</span>
              </div>
              <div className="divide-y">
                {(active.items || []).map((it, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-3 px-4 py-3 items-center"
                  >
                    <span className="truncate">{it.item}</span>
                    <span>₺ {Number(it.price || 0).toFixed(0)}</span>
                    <span>
                      <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-xs">
                        {it.quantity} x
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <h4 className="font-semibold mb-2">Reviews</h4>
              <p className="text-gray-700 leading-relaxed">
                {active.review || "—"}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </MainLayout>
  );
};

export default ReviewsPage;
