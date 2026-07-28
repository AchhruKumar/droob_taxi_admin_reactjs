import MainLayout from "@/layouts/MainLayout";
import { React, useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import {
  DeleteIcon,
  EditIcon,
  FilterIcon,
  SearchIcon,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "@/components/icons";
import { DatePicker } from "@/components/DatePicker";
import { Label } from "@/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { getRequest, patchRequest } from "@/utils/http-client/axiosClient";
import { ORDERS } from "@/utils/endPoints";
import { useSelector } from "react-redux";
import { IMAGE_URL, RESPONSE_CODE } from "@/utils/constants";
import CustomTable from "@/components/ui/Table";
import Skeleton from "react-loading-skeleton";
import { useToast } from "@/utils/toaster";

const Preparing = () => {
  const DEFAULT_LIMIT = 10;
  const DEBOUNCE_MS = 400;
  const toast = useToast();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.login);
  const [date, setDate] = useState(undefined);
  const [toDate, setToDate] = useState(undefined);
  const [orderList, setOrderList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statuses, setStatuses] = useState({});

  console.log("dataeee", date, toDate);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [search]);

  const columns = [
    {
      label: "#",
      key: "id",
      headerClassName: "w-[80px]",
      render: (orderList) =>
        loading ? <Skeleton width={40} /> : orderList.id || <span>-</span>,
    },
    {
      label: "Order",
      key: "order",
      render: (orderList) =>
        loading ? (
          <Skeleton width={40} />
        ) : (
          (
            <Link
              to={`/orders/${orderList.orderId}`}
              className="text-blue-500 underline"
            >
              {orderList.orderId}
            </Link>
          ) || <span>-</span>
        ),
    },
    {
      label: "Date/Time",
      key: "dateTime",
      render: (orderList) =>
        loading ? (
          <Skeleton width={70} />
        ) : orderList.dateTime ? (
          `${orderList.dateTime}`
        ) : (
          "-"
        ),
    },
    {
      label: "Assigned Driver",
      key: "assignedDriver",
      className: "text-center",
      render: (orderList) =>
        loading ? <Skeleton width={100} /> : orderList.assignedDriver || "-",
    },
    {
      label: "Order Status",
      key: "orderStatus",
      render: (orderList) =>
        loading ? (
          <Skeleton width={100} />
        ) : (
          (
            <div
              className={
                'order-status text-xs capitalize font-medium px-2 py-1 rounded-full bg-current/18 inline-flex items-center before:content-[""] before:inline-block before:w-[6px] before:h-[6px] before:rounded-full before:bg-current before:me-2 ' +
                (orderList.orderStatus === "pending"
                  ? "text-[#E68D26] current-[#E68D26]"
                  : "") +
                (orderList.orderStatus === "preparing"
                  ? "text-[#93BF1B] current-[#93BF1B]"
                  : "") +
                (orderList.orderStatus === "canceled"
                  ? "text-[#FF4D4F] current-[#FF4D4F]"
                  : "") +
                (orderList.orderStatus === "ready"
                  ? "text-[#2690E6] current-[#2690E6]"
                  : "") +
                (orderList.orderStatus === "accepted"
                  ? "text-[#27AE60] current-[#27AE60]"
                  : "")
              }
            >
              {orderList.orderStatus}
            </div>
          ) || "-"
        ),
    },
    {
      label: "Payment Status",
      key: "paymentStatus",
      render: (orderList) =>
        loading ? <Skeleton width={100} /> : orderList.paymentStatus || "-",
    },
    {
      label: "Total Amount",
      key: "totalAmount",
      render: (orderList) =>
        loading ? <Skeleton width={100} /> : orderList.totalAmount || "-",
    },
    {
      label: "Action",
      key: "action",
      render: (orderList) =>
        loading ? (
          <div className="flex gap-3">
            <Skeleton width={24} height={24} />
          </div>
        ) : (
          <Select
            value={statuses[orderList.orderId] || orderList.orderStatus}
            onValueChange={(value) =>
              handleStatusChange(orderList.orderId, value)
            }
          >
            <SelectTrigger className="text-xs w-[143px]">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {/* 1. Added "cart" which was missing */}
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="preparing">Preparing</SelectItem>
              <SelectItem value="ready">Ready</SelectItem>
              <SelectItem value="assignedToDriver">Driver Assigned</SelectItem>
              <SelectItem value="driverAccepted">Driver Accepted</SelectItem>
              {/* 2. Added "completed" which was missing in your data */}
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="canceled">Canceled</SelectItem>
            </SelectContent>
          </Select>
        ),
    },
  ];

  const totalPages = useMemo(() => {
    if (!total || !limit) return 1;
    return Math.max(1, Math.ceil(total / limit));
  }, [total, limit]);

  const totalPagesSafe =
    Number.isFinite(totalPages) && totalPages > 0 ? totalPages : 1;
  const canPrev = page > 1;
  const canNext = page < totalPagesSafe;
  const onPrev = () => canPrev && setPage((p) => p - 1);
  const onNext = () => canNext && setPage((p) => p + 1);
  const onGoto = (p) => setPage(p);

  const handleStatusChange = async (id, value) => {
    setStatuses((prev) => ({ ...prev, [id]: value }));
    setLoading(true);

    const payload = {
      orderStatus: value,
    };

    try {
      const response = await patchRequest(
        `${ORDERS.UPDATE_STATUS}/${id}`,
        payload,
      );

      if (response.status === RESPONSE_CODE[200]) {
        toast.success(response?.data.message);
        getAllOdersCallBack();
        if (value === "accepted") {
          navigate("/orders/accepted");
        } else if (value === "preparing") {
          navigate("/orders/preparing");
        } else if (value === "ready") {
          navigate("/orders/ready");
        } else if (value === "assignedToDriver") {
          navigate("/orders/driver-assigned");
        }
        setLoading(false);
      }
    } catch (error) {
      toast.error(error?.response?.data.message);
      setLoading(false);
    }
    setLoading(false);
  };

  const getAllOders = async (url) => {
    setLoading(true);
    try {
      const res = await getRequest(url);
      setOrderList(res?.data?.data?.orders);
      setTotal(res?.data?.data?.total);
      setLimit(res?.data?.data?.limit);
      setLoading(false);
    } catch (error) {
      console.log("fetching order error", error);
      setLoading(false);
    }
  };

  const getAllOdersCallBack = () => {
    getAllOders(
      `${ORDERS.ALL_LIST}?page=1&limit=10&search=${debouncedSearch}&restaurantId=${user?.resturant?.id}&status=preparing`,
    );
  };

  const handleApplyDateFilter = () => {
    getAllOders(
      `${ORDERS.ALL_LIST}?page=1&limit=10&search=${debouncedSearch}&fromDate=${date}&toDate=${toDate}&restaurantId=${user?.resturant?.id}&status=preparing`,
    );
  };

  useEffect(() => {
    getAllOdersCallBack();
  }, [user, debouncedSearch]);

  return (
    <MainLayout>
      <h2 className="text-[28px] font-medium pb-5 mb-10 border-b">
        Preparing Orders
      </h2>
      <div className="p-2.5 rounded-[10px] shadow">
        <div className="flex justify-between items-center gap-3.5 mb-3.5">
          <div className="search relative">
            <Input
              type="search"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-10"
            />
            <Button
              variant="ghost"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-0 hover:ring-0 h-auto"
            >
              <SearchIcon size={24} />
            </Button>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className="border border-gray-300 py-3 h-12"
              >
                Date Filter <FilterIcon className="size-6" />
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="leading-none font-medium">Select dates</h4>
                </div>
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
                  type="button"
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

        <CustomTable
          columns={columns}
          data={orderList}
          loading={loading}
          stickyHeader
          pagination={{
            page,
            totalPages: totalPagesSafe,
            onPrev,
            onNext,
            onGoto,
            renderNumbers: false,
          }}
        />

        {/* <Table className="text-sm">
          <TableHeader>
            <TableRow className="border-none">
              <TableHead>#</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Date/Time</TableHead>
              <TableHead>Assigned Driver</TableHead>
              <TableHead>Order Status</TableHead>
              <TableHead>Payment Status</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.id}</TableCell>
                <TableCell>
                  <Link
                    to={`/orders/${order.orderNumber}`}
                    className="text-blue-500 underline"
                  >
                    {order.orderNumber}
                  </Link>
                </TableCell>
                <TableCell>{order.dateTime}</TableCell>
                <TableCell>{order.assignedDriver}</TableCell>
                <TableCell>
                  <div
                    className={
                      'order-status text-xs font-medium px-2 py-1 rounded-full bg-current/18 inline-flex items-center before:content-[""] before:inline-block before:w-[6px] before:h-[6px] before:rounded-full before:bg-current before:me-2 ' +
                      (order.orderStatus === "Pending"
                        ? "text-[#E68D26] current-[#E68D26]"
                        : "") +
                      (order.orderStatus === "Preparing"
                        ? "text-[#93BF1B] current-[#93BF1B]"
                        : "") +
                      (order.orderStatus === "Cancelled"
                        ? "text-[#FF4D4F] current-[#FF4D4F]"
                        : "") +
                      (order.orderStatus === "Ready"
                        ? "text-[#2690E6] current-[#2690E6]"
                        : "") +
                      (order.orderStatus === "Accepted"
                        ? "text-[#27AE60] current-[#27AE60]"
                        : "")
                    }
                  >
                    {order.orderStatus}
                  </div>
                </TableCell>
                <TableCell>{order.paymentStatus}</TableCell>
                <TableCell>{order.totalAmount}</TableCell>
                <TableCell className="py-1.5 px-2">
                  <Select>
                    <SelectTrigger className="text-xs w-[143px]">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="accepted">Accepted</SelectItem>
                      <SelectItem value="preparing">Preparing</SelectItem>
                      <SelectItem value="ready">Ready</SelectItem>
                      <SelectItem value="driver_assigned">
                        Driver Assigned
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Pagination className="mt-5 justify-start">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink isActive={true} href="#">
                1
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">2</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">3</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">100</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" />
            </PaginationItem>
          </PaginationContent>
        </Pagination> */}
      </div>
    </MainLayout>
  );
};

export default Preparing;
