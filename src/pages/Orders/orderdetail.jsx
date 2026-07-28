import MainLayout from "@/layouts/MainLayout";
import React, { useEffect, useState } from "react";
import greenTick from "../../assets/completed-tick.png";
import { CountIcon } from "@/components/icons";
import { getRequest } from "@/utils/http-client/axiosClient";
import { useParams } from "react-router-dom";
import { ORDERS } from "@/utils/endPoints";
import moment from "moment";

const Skeleton = () => {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-6 bg-gray-200 rounded w-1/4"></div>
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded w-2/4"></div>
      <div className="h-4 bg-gray-200 rounded w-full"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
    </div>
  );
};

const OrdersDetailPage = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);

  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      const res = await getRequest(`${ORDERS.DETAILS}/${id}`);
      if (res?.data?.data?.order) {
        setOrder(res.data.data.order);
      }
    } catch (error) {
      console.error("Error fetching order:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (id) fetchOrderDetails();
  }, [id]);

  if (loading) {
    return (
      <MainLayout>
        <h2 className="text-[28px] font-medium pb-5 mb-10 border-b">
          Order Details
        </h2>
        <Skeleton />
      </MainLayout>
    );
  }

  if (!order) {
    return (
      <MainLayout>
        <h2 className="text-[28px] font-medium pb-5 mb-10 border-b">
          Order Detail
        </h2>
        <p className="text-gray-600">No order found.</p>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <h2 className="text-[28px] font-medium pb-5 mb-10 border-b">
        Order Detail
      </h2>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[100px]">
          <div>


            <p className="text-sm text-[#808080] mb-1">
              Order: <span className="text-[#1E1E1E]">#{order.id}</span>
            </p>

            <div className="border-b pb-3">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center py-2"
                >
                  <span className="text-lg font-medium">
                    {order.resturant?.name || "Item"}
                  </span>
                  <div className="flex items-center space-x-7">
                    <span className="bg-[#E0E0E0] text-[#555555] text-xs font-medium py-1 px-2 rounded">
                      {item.quantity} X
                    </span>
                    <span className="text-lg font-medium flex gap-x-2">
                      <CountIcon /> {item.unitPrice}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-7 text-sm space-y-6">
              <div className="flex">
                <span className="text-[#808080] w-[200px]">Created at</span>
                <span className="text-black">
                  {moment(order.createdAt).format("MMMM D, YYYY h:mm A")}
                </span>
              </div>
              <div className="flex">
                <span className="text-[#808080] w-[200px]">Payment Method</span>
                <span className="text-black">
                  {order.paymentMethod?.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="mt-7 border-t pt-[20px]">
              <h3 className="font-medium text-lg mb-5">Customer Detail</h3>
              <div className="mt-7 text-sm space-y-6">
                <div className="flex">
                  <span className="text-[#808080] w-[200px]">
                    Customer name
                  </span>
                  <span className="text-black">
                    {order.user?.firstName} {order.user?.lastName}
                  </span>
                </div>
                <div className="flex">
                  <span className="text-[#808080] w-[200px]">Email</span>
                  <span className="text-black">
                    {order.user?.email || "N/A"}
                  </span>
                </div>
                <div className="flex">
                  <span className="text-[#808080] w-[200px]">Phone</span>
                  <span className="text-black">
                    {order.user?.phone || "N/A"}
                  </span>
                </div>
                <div className="flex">
                  <span className="text-[#808080] w-[200px]">Address</span>
                  <span className="text-black">
                    {order.resturant?.location || "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-medium text-lg">Order Status</h3>
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-[#32AB45] capitalize">
                  <span
                    className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${order.orderStatus === "delivered"
                      ? "bg-[#32ab452e] text-[#32AB45]"
                      : "bg-yellow-100 text-yellow-700"
                      }`}
                  >
                    {order.orderStatus}
                  </span>
                </span>
                {order.orderStatus === "delivered" && (
                  <img src={greenTick} alt="Completed Tick" />
                )}
              </div>
            </div>
            <div className="text-sm">
              <div className="flex justify-between items-center">
                <span className="text-[#808080]">Total Amount</span>
                <span className="text-lg font-medium flex gap-x-2">
                  <CountIcon /> {order.orderOtherPrice?.totalAmount || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#808080]">VAT</span>
                <span>{order.orderOtherPrice?.vatTotal || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#808080]">Delivery</span>
                <span>{order.orderOtherPrice?.delivery || 0}</span>
              </div>
            </div>

            <div className="mt-4 border-t pt-4">
              <h3 className="font-medium text-lg mb-3">Driver Detail</h3>
              {order.driver ? (
                <div className="space-y-5 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-[#808080]">Driver name</span>
                    <span className="text-black">
                      {order.driver.firstName} {order.driver.lastName}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#808080]">Phone</span>
                    <span className="text-black">
                      {order.driver.phone || "N/A"}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No driver assigned yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default OrdersDetailPage;
