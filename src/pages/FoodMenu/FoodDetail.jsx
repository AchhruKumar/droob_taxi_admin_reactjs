import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { CountIcon } from "@/components/icons";
import { getRequest } from "@/utils/http-client/axiosClient";
import { MENU } from "@/utils/endPoints";
import { IMAGE_URL } from "@/utils/constants";

const Skeleton = ({ className = "" }) => (
  <div
    className={`bg-accent/60 dark:bg-accent/40 animate-pulse rounded-md ${className}`}
  />
);

const FoodDetail = () => {
  const { id } = useParams();
  const [menu, setMenu] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    const fetchMenuById = async () => {
      try {
        setStatus("loading");
        setError(null);
        const res = await getRequest(`${MENU.GET_BY_ID}/${id}`);
        const data = res?.data?.data ?? res?.data ?? res;
        if (!active) return;
        setMenu(data || null);
        setStatus("success");
      } catch (err) {
        if (!active) return;
        setError(
          err?.response?.data?.message || err?.message || "Failed to fetch"
        );
        setStatus("error");
      }
    };

    if (id) fetchMenuById();

    return () => {
      active = false;
    };
  }, [id]);

  const imageUrl = useMemo(() => {
    const media = `${IMAGE_URL}/${menu?.media}`;

    return media || "";
  }, [menu]);

  const title = menu?.translation?.name || "";
  const price = menu?.price;
  const category = menu?.mainCategory?.name || "";
  const description = menu?.translation?.description || "";
  const restaurantName = menu?.restaurant?.name || "";

  const isLoading = status === "loading";
  const isError = status === "error";
  const isEmpty = status === "success" && !menu;

  return (
    <MainLayout>
      <div className="pb-5 mb-10 border-b flex justify-between items-center flex-wrap">
        <h2 className="text-[28px] font-medium">Food Detail</h2>
        <Button className="md:!px-8" asChild>
          <Link to={`/edit-food/${id}`}>Edit Detail</Link>
        </Button>
      </div>

      {isError && (
        <div className="max-w-[700px] p-4 rounded-md border border-red-200 bg-red-50 text-red-700">
          {error}
        </div>
      )}

      {isEmpty && (
        <div className="max-w-[700px] p-4 rounded-md border bg-muted text-muted-foreground">
          No data found for this item.
        </div>
      )}

      {isLoading && (
        <div className="max-w-[700px]">
          <div className="flex items-center gap-7 mb-10">
            <Skeleton className="h-52 w-80 rounded-[10px]" />
            <div className="flex-1">
              <Skeleton className="h-6 w-60 mb-5" />
              <div className="flex items-center gap-2 mb-5">
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-8 w-16 rounded-md" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          </div>
          <div>
            <Skeleton className="h-5 w-48 mb-5" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-[90%]" />
              <Skeleton className="h-4 w-[80%]" />
              <Skeleton className="h-4 w-[70%]" />
            </div>
          </div>
        </div>
      )}

      {!isLoading && !isError && !isEmpty && (
        <div className="max-w-[700px]">
          <div className="flex items-center gap-7 mb-10">
            <img
              src={imageUrl}
              className="h-52 w-80 rounded-[10px] object-cover bg-muted"
              alt={title || "Food image"}
            />
            <div>
              <h2 className="text-[22px] font-medium mb-5">{title || "—"}</h2>
              <div className="flex items-center gap-2 mb-5 text-3xl">
                <CountIcon />
                {price || "—"}
              </div>
              <div className="text-sm">
                <span className="text-[#808080]">Category:</span>
                <span className="ms-2 font-medium">{category || "—"}</span>
              </div>
              {restaurantName ? (
                <div className="text-sm mt-2">
                  <span className="text-[#808080]">Restaurant:</span>
                  <span className="ms-2 font-medium">{restaurantName}</span>
                </div>
              ) : null}
            </div>
          </div>

          <div>
            <p className="text-md mb-2">Short Description</p>
            <p className="text-sm text-[#808080] leading-6">
              {description || "—"}
            </p>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default FoodDetail;
