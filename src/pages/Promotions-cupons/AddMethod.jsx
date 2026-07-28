import MainLayout from "@/layouts/MainLayout";
import React, { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/utils/toaster";
import {
  getRequest,
  patchRequest,
  postRequest,
} from "@/utils/http-client/axiosClient";
import { WALLET } from "@/utils/endPoints";
import { RESPONSE_CODE } from "@/utils/constants";
import CustomSelect from "@/components/ui/CustomSelect";
import { DatePicker } from "@/components/DatePicker";

const discountTypeOptions = [
  { label: "Percentage %", value: "PERCENTAGE" },
  { label: "Flat Amount", value: "FLAT" },
];

const schema = yup.object().shape({
  name: yup.string().required("Coupon name is required"),
  code: yup.string().required("Coupon code is required"),
  description: yup.string().required("Description is required"),
  discountType: yup.object().required("Discount type is required").nullable(),
  discountValue: yup
    .number()
    .typeError("Discount value must be a number")
    .required("Discount value is required")
    .min(1, "Minimum discount value is 1")
    .test("max-percentage", "Maximum 100% for percentage", (val, context) => {
      if (context.parent.discountType?.value === "PERCENTAGE" && val > 100) {
        return false;
      }
      return true;
    }),
  minOrderValue: yup
    .number()
    .typeError("Min order value must be a number")
    .required("Min order value is required")
    .min(0, "Minimum 0"),
  usageLimit: yup
    .number()
    .typeError("Usage limit must be a number")
    .required("Usage limit is required"),
  startDate: yup.date().required("Start date is required").nullable(),
  endDate: yup
    .date()
    .required("End date is required")
    .min(yup.ref("startDate"), "End date must be after start date")
    .nullable(),
});

const AddCoupon = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useSelector((state) => state.login);
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const couponId = searchParams.get("id");
  const isEditMode = Boolean(couponId);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      code: "",
      description: "",
      discountType: discountTypeOptions[0],
      discountValue: "",
      minOrderValue: "",
      usageLimit: "",
      startDate: null,
      endDate: null,
    },
  });

  const fetchCouponData = async () => {
    if (!couponId) return;
    try {
      const res = await getRequest(`${WALLET.CUPON_BY_ID}/${couponId}`);
      const c = res?.data?.data?.coupon;
      if (c) {
        setValue("name", c.name);
        setValue("code", c.code);
        setValue("description", c.description);
        setValue("discountValue", c.discountValue || c.discountpercentage);
        const type =
          c.discountType || (c.discountpercentage ? "PERCENTAGE" : "FLAT");
        setValue(
          "discountType",
          discountTypeOptions.find((o) => o.value === type) ||
          discountTypeOptions[0]
        );
        setValue("minOrderValue", c.minOrderValue || 0);
        setValue("usageLimit", c.usageLimit);
        setValue("startDate", new Date(c.startDate));
        setValue("endDate", new Date(c.endDate));
      }
    } catch {
      toast.error("Failed to fetch coupon data");
    }
  };

  useEffect(() => {
    if (user?.resturant?.id) {
      if (isEditMode) fetchCouponData();
    }
  }, [user, isEditMode]);

  const nameValue = watch("name");
  useEffect(() => {
    if (nameValue && !isEditMode) {
      const base = nameValue.replace(/[^a-zA-Z]/g, "").toUpperCase();
      const clean = base.slice(0, 10);
      const randomNum = Math.floor(10 + Math.random() * 90);
      const generatedCode = `${clean}${randomNum}`;
      setValue("code", generatedCode);
    }
  }, [nameValue, isEditMode, setValue]);

  const onSubmit = async (data) => {
    setLoading(true);
    const payload = {
      name: data.name,
      restaurantId: user?.resturant?.id,
      code: data.code,
      description: data.description,
      discountType: data.discountType.value,
      discountValue: Number(data.discountValue),
      minOrderValue: Number(data.minOrderValue),
      usageLimit: Number(data.usageLimit),
      startDate: data.startDate.toISOString(),
      endDate: data.endDate.toISOString(),
    };

    // Backward compatibility for percentage
    if (data.discountType.value === "PERCENTAGE") {
      payload.discountpercentage = Number(data.discountValue);
    }

    try {
      const res = isEditMode
        ? await patchRequest(`${WALLET.UPDATE_CUPON}/${couponId}`, payload)
        : await postRequest(`${WALLET.CREATE_CUPON}`, payload);

      if (
        res.status === RESPONSE_CODE[201] ||
        res.status === RESPONSE_CODE[200]
      ) {
        toast.success(
          isEditMode
            ? "Coupon updated successfully"
            : "Coupon created successfully"
        );
        navigate("/promotions-and-coupons");
      } else {
        toast.error(res?.data?.message || "Failed to process request");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const selectedDiscountType = watch("discountType");

  return (
    <MainLayout>
      <div className="pb-5 mb-10 border-b flex justify-between items-center flex-wrap">
        <h2 className="text-[28px] font-medium">
          {isEditMode ? "Edit Coupon" : "Add New Coupon"}
        </h2>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="max-w-[800px] space-y-6"
      >
        <div className="grid md:grid-cols-2 gap-6">
          <div className="grid">
            <Label htmlFor="name">Coupon Name</Label>
            <Input
              id="name"
              placeholder="Weekend Special Offer"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name.message}</p>
            )}
          </div>

          <div className="grid">
            <Label htmlFor="code">Coupon Code</Label>
            <Input id="code" {...register("code")} />
            {errors.code && (
              <p className="text-red-500 text-sm">{errors.code.message}</p>
            )}
          </div>

          <div className="grid md:col-span-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              placeholder="Get 20% off on all orders above 50 SAR during weekends!"
              {...register("description")}
              className="border rounded-md p-3 text-sm w-full min-h-[100px]"
            />
            {errors.description && (
              <p className="text-red-500 text-sm">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid">
            <CustomSelect
              label="Discount Type"
              options={discountTypeOptions}
              value={watch("discountType")}
              onChange={(selected) => setValue("discountType", selected)}
              placeholder="Select Type"
              error={errors.discountType?.message}
            />
          </div>

          <div className="grid">
            <Label htmlFor="discountValue">
              Discount{" "}
              {selectedDiscountType?.value === "PERCENTAGE"
                ? "Percentage (%)"
                : "Amount (SAR)"}
            </Label>
            <Input
              id="discountValue"
              placeholder={
                selectedDiscountType?.value === "PERCENTAGE" ? "20" : "50"
              }
              {...register("discountValue")}
            />
            {errors.discountValue && (
              <p className="text-red-500 text-sm">
                {errors.discountValue.message}
              </p>
            )}
          </div>

          <div className="grid">
            <Label htmlFor="minOrderValue">Minimum Order Value (SAR)</Label>
            <Input
              id="minOrderValue"
              placeholder="100"
              {...register("minOrderValue")}
            />
            {errors.minOrderValue && (
              <p className="text-red-500 text-sm">
                {errors.minOrderValue.message}
              </p>
            )}
          </div>

          <div className="grid">
            <Label htmlFor="usageLimit">Usage Limit</Label>
            <Input
              id="usageLimit"
              placeholder="100"
              {...register("usageLimit")}
            />
            {errors.usageLimit && (
              <p className="text-red-500 text-sm">
                {errors.usageLimit.message}
              </p>
            )}
          </div>

          <div className="grid">
            <Label>Start Date</Label>
            <DatePicker
              selectedDate={watch("startDate")}
              onDateChange={(date) => setValue("startDate", date)}
              placeholder="Select start date"
            />
            {errors.startDate && (
              <p className="text-red-500 text-sm">{errors.startDate.message}</p>
            )}
          </div>

          <div className="grid">
            <Label>End Date</Label>
            <DatePicker
              selectedDate={watch("endDate")}
              onDateChange={(date) => setValue("endDate", date)}
              placeholder="Select end date"
            />
            {errors.endDate && (
              <p className="text-red-500 text-sm">{errors.endDate.message}</p>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mt-7">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/promotions-and-coupons")}
          >
            Cancel
          </Button>
          <Button type="submit" variant="default" disabled={loading}>
            {loading
              ? isEditMode
                ? "Updating..."
                : "Creating..."
              : isEditMode
                ? "Update Coupon"
                : "Create Coupon"}
          </Button>
        </div>
      </form>
    </MainLayout>
  );
};

export default AddCoupon;
