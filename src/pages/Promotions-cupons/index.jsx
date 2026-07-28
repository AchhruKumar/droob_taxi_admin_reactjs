import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import MainLayout from "@/layouts/MainLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { SearchIcon, FilterIcon } from "@/components/icons";
import { FaPlus } from "react-icons/fa6";
import CustomTable from "@/components/ui/Table";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { getRequest, deleteRequest } from "@/utils/http-client/axiosClient";
import { useSelector } from "react-redux";
import { useToast } from "@/utils/toaster";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { WALLET } from "@/utils/endPoints";
import { DatePicker } from "@/components/DatePicker";
import { Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";

const PromotionsAndCoupons = () => {
  const { user } = useSelector((state) => state.login);
  const toast = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("promotions");
  const [search, setSearch] = useState("");
  const [date, setDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(false);

  const [promotions, setPromotions] = useState([]);
  const [coupons, setCoupons] = useState([]);

  const [promoPage, setPromoPage] = useState(1);
  const [promoTotalPages, setPromoTotalPages] = useState(1);

  const [couponPage, setCouponPage] = useState(1);
  const [couponTotalPages, setCouponTotalPages] = useState(1);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);

  const fetchPromotions = async (page = 1) => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      query.append("page", page);
      query.append("limit", 10);
      if (search) query.append("search", search);
      if (date) query.append("startDate", date);
      if (toDate) query.append("endDate", toDate);

      const res = await getRequest(
        `${WALLET.PROMOTIONS}/resturant?${query.toString()}&type=resturant`
      );

      const data = res?.data?.data;
      setPromotions(data?.promotions || []);
      setPromoPage(data?.page || 1);
      setPromoTotalPages(data?.totalPages || 1);
    } catch (err) {
      console.error("Failed to fetch promotions:", err);
      toast.error("Failed to load promotions");
    } finally {
      setLoading(false);
    }
  };

  const fetchCoupons = async (page = 1) => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      query.append("page", page);
      query.append("limit", 10);
      if (search) query.append("search", search);
      if (date) query.append("startDate", date);
      if (toDate) query.append("endDate", toDate);

      const res = await getRequest(
        `${WALLET.CUPPONS}/${user?.resturant?.id}?${query.toString()}`
      );

      const data = res?.data?.data;
      setCoupons(data?.coupons || []);
      setCouponPage(data?.page || 1);
      setCouponTotalPages(data?.totalPages || 1);
    } catch (err) {
      console.error("Failed to fetch coupons:", err);
      toast.error("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "promotions") fetchPromotions(promoPage);
    else fetchCoupons(couponPage);
  }, [activeTab, search, date, toDate, promoPage, couponPage]);

  const handleApplyDateFilter = () => {
    if (activeTab === "promotions") fetchPromotions();
    else fetchCoupons();
  };

  const handleEdit = (row) => navigate(`/add-coupon?id=${row.id}`);

  const handleDelete = (id) => {
    setSelectedCoupon(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      setLoading(true);
      const res = await deleteRequest(`${WALLET.DELETE}/${selectedCoupon}`);
      if (res?.status === 200) {
        toast.success("Coupon deleted successfully");
        fetchCoupons(couponPage);
      } else {
        toast.error("Failed to delete coupon");
      }
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Something went wrong while deleting");
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      setSelectedCoupon(null);
    }
  };

  const promotionColumns = [
    { label: "#", key: "id" },
    { label: "Title", key: "title" },
    { label: "Description", key: "description" },
    {
      label: "Created At",
      key: "createdAt",
      render: (row) =>
        new Date(row.createdAt).toLocaleString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
    },
  ];

  const couponColumns = [
    { label: "#", key: "id" },
    { label: "Coupon Name", key: "name" },
    {
      label: "Coupon Type",
      key: "discountType",
      render: (row) =>
        loading ? <Skeleton width={100} /> : <span className="capitalize">{row.discountType}</span> || "-",
    },
    {
      label: "Order Value",
      key: "minimumOrderValue",
      render: (row) =>
        loading ? <Skeleton width={100} /> : <span >SAR{row.minOrderValue}</span> || "-",
    },
    {
      label: "Discount Value",
      key: "discountValue",
      render: (row) =>
        loading ? <Skeleton width={100} /> : <span className="capitalize">{row.discountType === "percentage" ? `%${row.discountpercentage}` : `SAR${row.discountValue}`}</span> || "-",
    },
    { label: "Code", key: "code" },
    {
      label: "Start Date",
      key: "validFrom",
      render: (row) => new Date(row.validFrom).toLocaleDateString("en-GB"),
    },
    {
      label: "End Date",
      key: "validTill",
      render: (row) => new Date(row.validTill).toLocaleDateString("en-GB"),
    },
    { label: "Total Coupon", key: "usageLimit" },
    { label: "Used Coupon", key: "usedCount" },
    {
      label: "Action",
      key: "actions",
      render: (row) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
            onClick={() => handleEdit(row)}
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-red-600 hover:text-red-800 hover:bg-red-50"
            onClick={() => handleDelete(row.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <MainLayout>
      {/* Header */}
      <div className="pb-5 mb-10 border-b flex justify-between items-center flex-wrap">
        <h2 className="text-[28px] font-medium">Promotions & Coupons</h2>
        {activeTab === "coupons" && (
          <Button
            className="md:!px-8 flex items-center gap-2"
            onClick={() => navigate("/add-coupon")}
          >
            <FaPlus /> Add Coupon
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-transparent p-0 mb-7 flex gap-5">
          <TabsTrigger value="promotions">Promotions</TabsTrigger>
          <TabsTrigger value="coupons">Coupons</TabsTrigger>
        </TabsList>

        <TabsContent value="promotions">
          <div className="p-3 rounded-[10px] shadow">
            <div className="flex justify-between items-center flex-wrap gap-3 mb-4">
              <div className="relative w-full max-w-xs">
                <Input
                  placeholder="Search promotions..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <Button
                  variant="ghost"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  onClick={() => fetchPromotions(1)}
                >
                  <SearchIcon size={20} />
                </Button>
              </div>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    className="border border-gray-300 py-3 h-12"
                  >
                    Date Filter <FilterIcon className="size-6 ml-2" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <div className="grid gap-4">
                    <h4 className="font-medium">Select dates</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <DatePicker
                        selectedDate={date}
                        onDateChange={setDate}
                        placeholder="From Date"
                      />
                      <DatePicker
                        selectedDate={toDate}
                        onDateChange={setToDate}
                        minDate={date}
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

            {loading ? (
              <Skeleton count={5} height={40} />
            ) : (
              <CustomTable
                columns={promotionColumns}
                data={promotions}
                loading={loading}
                rowKey={(row) => row.id}
                pagination={{
                  page: promoPage,
                  totalPages: promoTotalPages,
                  onNext: () => promoPage < promoTotalPages && setPromoPage(promoPage + 1),
                  onPrev: () => promoPage > 1 && setPromoPage(promoPage - 1),
                  onGoto: (p) => setPromoPage(p),
                  renderNumbers: true,
                }}
              />
            )}
          </div>
        </TabsContent>

        <TabsContent value="coupons">
          <div className="p-3 rounded-[10px] shadow">
            {/* Filters */}
            <div className="flex justify-between items-center flex-wrap gap-3 mb-4">
              <div className="relative w-full max-w-xs">
                <Input
                  placeholder="Search coupons..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <Button
                  variant="ghost"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  onClick={() => fetchCoupons(1)}
                >
                  <SearchIcon size={20} />
                </Button>
              </div>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    className="border border-gray-300 py-3 h-12"
                  >
                    Date Filter <FilterIcon className="size-6 ml-2" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <div className="grid gap-4">
                    <h4 className="font-medium">Select dates</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <DatePicker
                        selectedDate={date}
                        onDateChange={setDate}
                        placeholder="From Date"
                      />
                      <DatePicker
                        selectedDate={toDate}
                        onDateChange={setToDate}
                        minDate={date}
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

            {/* Table */}
            {loading ? (
              <Skeleton count={5} height={40} />
            ) : (
              <CustomTable
                columns={couponColumns}
                data={coupons}
                loading={loading}
                rowKey={(row) => row.id}
                pagination={{
                  page: couponPage,
                  totalPages: couponTotalPages,
                  onNext: () => couponPage < couponTotalPages && setCouponPage(couponPage + 1),
                  onPrev: () => couponPage > 1 && setCouponPage(couponPage - 1),
                  onGoto: (p) => setCouponPage(p),
                  renderNumbers: true,
                }}
              />
            )}
          </div>
        </TabsContent>
      </Tabs>

      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Coupon"
        description="Are you sure you want to delete this coupon? This action cannot be undone."
        isDelete
        onDelete={confirmDelete}
        loading={loading}
      />
    </MainLayout>
  );
};

export default PromotionsAndCoupons;
