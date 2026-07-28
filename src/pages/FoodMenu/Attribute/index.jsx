// src/pages/AddNewFood.jsx
import React, { useEffect, useMemo, useState } from "react";
import MainLayout from "@/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import CustomSelect from "@/components/ui/CustomSelect";
import { getRequest, postRequest } from "@/utils/http-client/axiosClient";
import { uploadSingleFile } from "@/utils/upload";
import { AUTH, MENU, UPLOAD_FILE } from "@/utils/endPoints";
import { RESPONSE_CODE } from "@/utils/constants";
import { useNavigate } from "react-router-dom";

// If needed, set VITE_TRANSLATE_BASE to "http://localhost:3050" in .env
const TRANSLATE_BASE =
  import.meta.env.VITE_TRANSLATE_BASE || import.meta.env.VITE_API_URL || "";

// Yup schema
const schema = yup.object({
  name: yup.string().trim().required("Name is required"),
  description: yup.string().trim().required("Description is required"),
  price: yup
    .string()
    .trim()
    .matches(/^\d+(\.\d{1,2})?$/, "Enter a valid price")
    .required("Price is required"),
  category: yup
    .object({
      value: yup.string().required(),
      label: yup.string().required(),
    })
    .nullable()
    .required("Category is required"),
  subCategory: yup
    .object({
      value: yup.string().required(),
      label: yup.string().required(),
    })
    .nullable()
    .required("Sub Category is required"),
  isVeg: yup.boolean().required(),
  image: yup
    .mixed()
    .test("required", "Image is required", (v) => {
      const file = v instanceof File ? v : null;
      return !!file;
    })
    .test("fileType", "Only image files are allowed", (v) => {
      const file = v instanceof File ? v : null;
      if (!file) return false;
      return /^image\//.test(file.type);
    })
    .test("fileSize", "Max file size is 5MB", (v) => {
      const file = v instanceof File ? v : null;
      if (!file) return false;
      return file.size <= 5 * 1024 * 1024;
    }),
});

const AddNewFood = () => {
  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    resetField,
    setValue,
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      category: null,
      subCategory: null,
      image: null, // single File
      isVeg: true,
    },
  });

  const [catOptions, setCatOptions] = useState([]);
  const [subCatRaw, setSubCatRaw] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");

  const selectedCategory = watch("category");
  const imageFile = watch("image");

  const basePrice = watch("price");

  const finalPrice = Math.ceil(Number(basePrice) * 1.15);

  // preview update
  useEffect(() => {
    if (imageFile instanceof File) {
      const objUrl = URL.createObjectURL(imageFile);
      setPreviewUrl(objUrl);
      return () => URL.revokeObjectURL(objUrl);
    } else {
      setPreviewUrl("");
    }
  }, [imageFile]);

  // categories
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await getRequest(MENU.CATEGORY);
        const list = res?.data?.data?.categories || [];
        const opts = list.map((c) => ({ value: c.id, label: c.name }));
        if (alive) setCatOptions(opts);
      } catch (e) {
        console.error("Load categories failed", e);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // sub-categories
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await getRequest(MENU.SUB_CATEGORY);
        const list = res?.data?.data?.categories || [];
        if (alive) setSubCatRaw(list);
      } catch (e) {
        console.error("Load sub-categories failed", e);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const subCatOptions = useMemo(() => {
    const catId = selectedCategory?.value;
    const filtered = catId
      ? subCatRaw.filter((s) => s.categoryId === catId)
      : subCatRaw;
    return filtered.map((s) => ({
      value: s.id,
      label: s.name,
      categoryId: s.categoryId,
    }));
  }, [subCatRaw, selectedCategory]);

  useEffect(() => {
    resetField("subCategory", { defaultValue: null });
  }, [selectedCategory, resetField]);

  async function translateToArabic(text) {
    if (!text) return "";
    try {
      const url = new URL(`${MENU.TRANSLATE}`);
      url.search = new URLSearchParams({ text, target: "ar" }).toString();
      const res = await fetch(url.toString(), {
        method: "GET",
        credentials: "include",
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        console.error("Translate HTTP error", res.status, txt);
        return "";
      }
      const json = await res.json();
      return json?.data?.translatedText || "";
    } catch (e) {
      console.error("Translate failed", e);
      return "";
    }
  }
  const navigate = useNavigate();
  async function onSubmit(values) {
    try {
      setUploading(true);

      const file = values.image;

      const uploadRes = await uploadSingleFile({
        endpoint: UPLOAD_FILE.UPLOAD,
        file,
        postRequest,
        extraPayload: { folder: "restaurant" },
      });

      const mediaKey = uploadRes?.fileKey || uploadRes?.key || file?.name || "";

      const arName = await translateToArabic(values.name);
      const arDesc = await translateToArabic(values.description);

      const payload = {
        translation: [
          {
            name: values.name,
            description: values.description,
            languageCode: "en",
          },
          {
            name: arName || values.name,
            description: arDesc || values.description,
            languageCode: "ar",
          },
        ],
        price: values.price,
        media: mediaKey,
        finalPrice: (Number(values.price) * 1.15).toFixed(2),
        categoryId: values.category?.value || "",
        subCategoryId: values.subCategory?.value || "",
        type: values.isVeg ? "veg" : "non-veg",
      };

      console.log(payload);

      const response = await postRequest(`${MENU.ADD}`, payload);
      if (response.status === RESPONSE_CODE[201]) {
        reset();
        navigate("/menu-list");
      }
    } catch (err) {
      setUploading(false);
      console.error("Submit failed", err);
    }
    setUploading(false);
  }

  function handleFileChange(e) {
    const f = e.target.files[0];
    setValue("image", f || null, { shouldValidate: true, shouldDirty: true });
  }

  return (
    <MainLayout>
      <h2 className="text-[28px] font-medium pb-5 mb-10 border-b">
        Add New Food
      </h2>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="max-w-[700px]">
          <div className="grid gap-7">
            <div className="grid gap-2">
              <Label htmlFor="images">Add Food Image</Label>

              <div className="flex items-center gap-4">
                <div className="image-block h-[123px] w-[268px] relative">
                  <Label
                    htmlFor="images"
                    className="h-full w-full flex items-center justify-center border border-dashed border-droobGray-300 rounded-[10px] text-droobGray-400 bg-droobGray-200 font-normal cursor-pointer"
                  >
                    {imageFile ? "Change Image" : "Browse"}
                  </Label>
                  <input
                    type="file"
                    id="images"
                    accept="image/*"
                    hidden
                    onChange={handleFileChange}
                  />
                </div>

                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="preview"
                    className="h-[123px] w-[123px] object-cover rounded-md border"
                  />
                ) : null}
              </div>

              {errors.image && (
                <p className="text-red-500 text-sm mt-2">
                  {errors.image.message}
                </p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="grid">
                <Label htmlFor="foodname">Name</Label>
                <Input
                  id="foodname"
                  placeholder="Enter food name"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="grid">
                <Label htmlFor="foodprice">Price</Label>
                <Input
                  id="foodprice"
                  placeholder="Enter price"
                  {...register("price")}
                />
                {errors.price && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.price.message}
                  </p>
                )}
              </div>

              <div className="grid">
                <Label htmlFor="finalPrice">
                  Final Price (15% VAT Included)
                </Label>
                <Input
                  id="finalPrice"
                  value={finalPrice}
                  readOnly
                  disabled
                  className="bg-gray-100 cursor-not-allowed"
                />
              </div>

              <div className="grid">
                <Label htmlFor="foodcategory">Category</Label>
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <CustomSelect
                      name="foodcategory"
                      options={catOptions}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select category"
                      error={errors.category?.message}
                    />
                  )}
                />
              </div>

              <div className="grid">
                <Label htmlFor="foodsubcategory">Sub Category</Label>
                <Controller
                  name="subCategory"
                  control={control}
                  render={({ field }) => (
                    <CustomSelect
                      name="foodsubcategory"
                      options={subCatOptions}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select sub category"
                      isDisabled={!selectedCategory}
                      error={errors.subCategory?.message}
                    />
                  )}
                />
              </div>

              <div className="grid md:col-span-2">
                <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <div
                    className={`p-1.5 rounded-md ${watch("isVeg") ? "bg-green-100" : "bg-red-100"}`}
                  >
                    <div
                      className={`size-3 rounded-full ${watch("isVeg") ? "bg-green-600" : "bg-red-600"}`}
                    />
                  </div>
                  <div className="flex-1">
                    <Label className="text-base font-semibold block">
                      Food Category
                    </Label>
                    <p className="text-sm text-gray-500">
                      Mark this item as{" "}
                      {watch("isVeg") ? "Vegetarian" : "Non-Vegetarian"}
                    </p>
                  </div>
                  <Controller
                    name="isVeg"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                </div>
              </div>

              <div className="grid md:col-span-2">
                <Label htmlFor="fooddescription">Short Description</Label>
                <Textarea
                  id="fooddescription"
                  placeholder="Add more details..."
                  className="h-[100px]"
                  {...register("description")}
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                loading={uploading}
                disabled={isSubmitting || uploading}
              >
                Submit
              </Button>
            </div>
          </div>
        </div>
      </form>
    </MainLayout>
  );
};

export default AddNewFood;
